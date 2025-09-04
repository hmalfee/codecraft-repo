import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError as AuthError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

/**
 * This is a server side factory caller, and doesn't invoke an API request. You have to create
 * a route handler at `app/api/auth/[...better-auth]/route.ts` and integrate this caller with
 * that route handler to turn it into an api. In this project, we are not creating a route handler
 * for Better Auth, and instead we are using it as a server side caller in our tRPC endpoints.
 */
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
    },
    logger: {
        disabled: true,
    },
    plugins: [nextCookies()], // make sure `nextCookies()` is the last plugin in the array
    advanced: {
        cookiePrefix: "codecraft",
        useSecureCookies: env.NODE_ENV === "production",
    },
});

/** Converts Better Auth errors to TRPC compatible errors. This function is in `beta` and will be developed with time. */
export const betterAuthToTrpcError = (error: AuthError) => {
    let errorData;
    switch (error.status) {
        case "UNAUTHORIZED":
        case "FORBIDDEN":
        case "NOT_FOUND":
        case "CONFLICT":
            errorData = new TRPCError({
                code: error.status,
                message: error.message,
            });
            break;
        default:
            errorData = new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Unexpected authentication error",
                cause: error,
            });
    }
    return errorData;
};

export { AuthError };
