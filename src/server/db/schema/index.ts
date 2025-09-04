import { relations } from "drizzle-orm";
import { users } from "./auth";
import { todos } from "./public";

// Export the relations for the tables here
export const usersRelations = relations(users, ({ many }) => ({
    todos: many(todos),
}));
export const todosRelations = relations(todos, ({ one }) => ({
    users: one(users, {
        fields: [todos.userId],
        references: [users.id],
    }),
}));

// Export the DTO types for the tables here
export type User = typeof users.$inferSelect;
export type Todo = typeof todos.$inferSelect;

// Export all the files in the schema directory
export * from "./auth";
export * from "./public";
