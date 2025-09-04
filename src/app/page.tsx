import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/server";
import { CheckCircle, ListTodo } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
    const session = await api.auth.getSession();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between mx-auto">
                    <div className="flex items-center gap-2">
                        <ListTodo className="h-6 w-6" />
                        <span className="text-xl font-bold">TaskMaster</span>
                    </div>
                    <nav>
                        {session ? (
                            <div className="flex gap-4">
                                <Button asChild>
                                    <Link href="/app">Go to Dashboard</Link>
                                </Button>
                                <ModeToggle />
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Button variant="outline" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                                <ModeToggle />
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 mx-auto">
                <section className="container py-24 md:py-32">
                    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                                    Organize your tasks with ease
                                </h1>
                                <p className="text-lg text-muted-foreground md:text-xl">
                                    A simple and intuitive to-do application to
                                    help you stay organized and productive.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button size="lg" asChild>
                                    <Link href={session ? "/app" : "/sign-up"}>
                                        {session
                                            ? "Go to Your Tasks"
                                            : "Get Started"}
                                    </Link>
                                </Button>
                                {!session && (
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href="/login">Login</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="relative w-full max-w-md overflow-hidden rounded-lg border bg-background p-6 shadow-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            My Tasks
                                        </h3>
                                        <span className="text-sm text-muted-foreground">
                                            Today
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 rounded-md border p-3">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                            <span className="line-through text-muted-foreground">
                                                Complete project setup
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border p-3">
                                            <div className="h-5 w-5 rounded-full border-2" />
                                            <span>Create homepage design</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border p-3">
                                            <div className="h-5 w-5 rounded-full border-2" />
                                            <span>
                                                Implement authentication
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border p-3">
                                            <div className="h-5 w-5 rounded-full border-2" />
                                            <span>Deploy application</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container py-16">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Stay Organized
                            </h3>
                            <p className="text-muted-foreground">
                                Keep track of all your tasks in one place and
                                never miss a deadline.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6"
                                >
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">
                                Simple Interface
                            </h3>
                            <p className="text-muted-foreground">
                                Intuitive and clean design makes managing tasks
                                quick and easy.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">Secure Access</h3>

                            <p className="text-muted-foreground">
                                Your tasks are protected with user
                                authentication to keep your data private.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-6">
                <div className="mx-auto container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} TaskMaster. All rights
                        reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Login
                        </Link>
                        <Link
                            href="/sign-up"
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Sign Up
                        </Link>
                        <Link
                            href="/app"
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            App
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
