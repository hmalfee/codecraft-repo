import { logger } from "@/server/lib/logger";
import {
    baseProcedure,
    createCallerFactory,
    createTRPCRouter,
} from "@/server/trpc";
import { authRouter } from "@/server/trpc/routers/auth";
import { todoRouter } from "@/server/trpc/routers/todo";
import { z } from "zod";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    todo: todoRouter,
    reportClientError: baseProcedure
        .input(
            z.object({
                name: z.string(),
                stack: z.string(),
                message: z.string(),
                digest: z.string().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            logger.error("[Client]", input);
            return { success: true };
        }),
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
