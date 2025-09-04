import Link from "next/link";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Or{" "}
                    <Link
                        href="/sign-up"
                        className="font-medium text-primary hover:underline"
                    >
                        create a new account
                    </Link>
                </p>
            </div>
            <LoginForm />
        </>
    );
}
