"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/trpc/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TodoItem } from "./todo-item";

export function TodoList() {
    const [newTodoText, setNewTodoText] = useState("");

    const utils = api.useUtils();

    const { data: todos, isLoading } = api.todo.list.useQuery();

    const createTodoMutation = api.todo.create.useMutation({
        onSuccess: async () => {
            setNewTodoText("");
            await utils.todo.list.invalidate();
        },
    });

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTodoText.trim()) return;

        createTodoMutation.mutate({
            text: newTodoText,
        });
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleAddTodo} className="flex gap-2">
                <Input
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={
                        !newTodoText.trim() || createTodoMutation.isPending
                    }
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </Button>
            </form>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-4">Loading todos...</div>
                ) : todos && todos.length > 0 ? (
                    todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        No todos yet. Add one above!
                    </div>
                )}
            </div>
        </div>
    );
}
