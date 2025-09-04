import { loginSchema, signUpSchema } from "@/lib/zod-schemas/auth";
import { AuthError, auth, betterAuthToTrpcError } from "@/server/lib/auth";
import {
    baseProcedure,
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/trpc";
import { cookies } from "next/headers";

export const authRouter = createTRPCRouter({
    signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
        try {
            await auth.api.signUpEmail({
                body: {
                    email: input.email,
                    password: input.password,
                    name: input.name,
                },
            });
        } catch (error) {
            if (error instanceof AuthError) {
                throw betterAuthToTrpcError(error);
            }
            throw error;
        }

        return { success: true };
    }),

    login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
        try {
            await auth.api.signInEmail({
                body: {
                    email: input.email,
                    password: input.password,
                },
            });
        } catch (error) {
            if (error instanceof AuthError) {
                throw betterAuthToTrpcError(error);
            }
            throw error;
        }

        return { success: true };
    }),

    logout: protectedProcedure.mutation(async () => {
        (await cookies()).delete(
            auth.options.advanced.cookiePrefix + ".session_token",
        );

        return { success: true };
    }),
    getSession: baseProcedure.query(async ({ ctx }) => {
        return ctx.session;
    }),
});
