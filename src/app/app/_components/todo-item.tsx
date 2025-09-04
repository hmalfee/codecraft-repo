"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/trpc/react";
import type { Todo } from "@/server/db/schema";
import { Check, Pencil, Trash, X } from "lucide-react";
import { useState } from "react";

export function TodoItem({ todo }: { todo: Todo }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const utils = api.useUtils();

    const updateTodoMutation = api.todo.update.useMutation({
        onSuccess: async () => {
            await utils.todo.list.invalidate();
            if (isEditing) {
                setIsEditing(false);
            }
        },
    });

    const deleteTodoMutation = api.todo.delete.useMutation({
        onSuccess: async () => {
            await utils.todo.list.invalidate();
        },
    });

    const handleToggleComplete = () => {
        updateTodoMutation.mutate({
            id: todo.id,
            completed: !todo.completed,
        });
    };

    const handleUpdateText = () => {
        if (!editText.trim()) return;

        updateTodoMutation.mutate({
            id: todo.id,
            text: editText,
        });
    };

    const handleDelete = () => {
        deleteTodoMutation.mutate({
            id: todo.id,
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(todo.text);
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg border ${todo.completed ? "bg-muted/50" : "bg-card"}`}
        >
            <div className="flex items-center gap-3 flex-1">
                <Checkbox
                    checked={todo.completed}
                    onCheckedChange={handleToggleComplete}
                    disabled={updateTodoMutation.isPending}
                />

                {isEditing ? (
                    <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1"
                        autoFocus
                    />
                ) : (
                    <span
                        className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                        {todo.text}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleUpdateText}
                            disabled={
                                !editText.trim() || updateTodoMutation.isPending
                            }
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                            disabled={todo.completed}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={deleteTodoMutation.isPending}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
