import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { env } from "@/env";
import { db } from "@/server/db";
import { auth, AuthError, betterAuthToTrpcError } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: opts.headers,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            throw betterAuthToTrpcError(error);
        }
        throw error;
    }

    return {
        db,
        session,
        ...opts,
    };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    // use this errorFormatter for response formatting
    // use the onError from the fetchRequestHandler for side-effect handling
    errorFormatter({ shape, error }) {
        delete shape.data.stack; // Remove stack trace from the response, although automatically removed in production
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError
                        ? error.cause.flatten()
                        : null,
            },
        };
    },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 * Also, this is the base procedure for every procedure to initialize on. All users can access it.
 */
export const baseProcedure = t.procedure.use(
    t.middleware(async ({ next, path }) => {
        const start = Date.now();

        if (env.NODE_ENV === "development") {
            const waitMs = Math.floor(Math.random() * 400) + 100; // Random wait between 100ms and 500ms
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }

        const result = await next();

        const end = Date.now();

        if (env.NODE_ENV === "development") {
            logger.info(`[TRPC] ${path} took ${end - start}ms to execute`);
        }

        return result;
    }),
);

/** This procedure is public-only, meaning only non-authenticated users can access it. */
export const publicProcedure = baseProcedure.use(({ next, ctx }) => {
    if (ctx.session) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are already logged in",
        });
    }
    return next();
});

/** This procedure is protected, meaning only authenticated users can access it. */
export const protectedProcedure = baseProcedure.use(({ next, ctx }) => {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to perform this action",
        });
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});
