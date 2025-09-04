import { todos } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const todoRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        const todoList = await ctx.db.query.todos.findMany({
            where: eq(todos.userId, ctx.session.user.id),
            orderBy: (todos, { desc }) => [desc(todos.createdAt)],
        });

        return todoList;
    }),

    create: protectedProcedure
        .input(
            z.object({
                text: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(todos).values({
                userId: ctx.session.user.id,
                text: input.text,
                completed: false,
            });

            return { success: true };
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                text: z.string().min(1).optional(),
                completed: z.boolean().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const todoData = await ctx.db.query.todos.findFirst({
                where: and(
                    eq(todos.id, input.id),
                    eq(todos.userId, ctx.session.user.id),
                ),
            });

            if (!todoData) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Todo not found",
                });
            }

            await ctx.db
                .update(todos)
                .set({
                    ...(input.text !== undefined && { text: input.text }),
                    ...(input.completed !== undefined && {
                        completed: input.completed,
                    }),
                })
                .where(eq(todos.id, input.id));

            return { success: true };
        }),

    delete: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const todoData = await ctx.db.query.todos.findFirst({
                where: and(
                    eq(todos.id, input.id),
                    eq(todos.userId, ctx.session.user.id),
                ),
            });

            if (!todoData) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Todo not found",
                });
            }

            await ctx.db.delete(todos).where(eq(todos.id, input.id));

            return { success: true };
        }),
});
