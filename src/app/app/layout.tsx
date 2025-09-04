import { api } from "@/lib/trpc/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await api.auth.getSession();

    if (!session) {
        const pathname = (await headers()).get("x-pathname");
        const redirectUrl = pathname
            ? `/login?redirect=${encodeURIComponent(pathname)}`
            : "/login";
        redirect(redirectUrl);
    }

    return <div className="mx-auto max-w-4xl p-4">{children}</div>;
}
