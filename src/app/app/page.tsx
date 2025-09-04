"use client";
import { LogoutButton } from "./_components/logout-button";
import { TodoList } from "./_components/todo-list";

export default function AppPage() {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your To-Do List</h1>
                <LogoutButton />
            </div>
            <TodoList />
        </>
    );
}
