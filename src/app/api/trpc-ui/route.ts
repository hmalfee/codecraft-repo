import { env } from "@/env";
import { appRouter } from "@/server/trpc/root";
import { NextResponse } from "next/server";

export async function GET() {
    if (!!Number(env.NEXT_PUBLIC_VERCEL)) {
        // Don't render the tRPC UI on Vercel
        return new NextResponse("Not Found", { status: 404 });
    }

    const { renderTrpcPanel } = await import("trpc-ui");

    return new NextResponse(
        renderTrpcPanel(appRouter, {
            url: "/api/trpc", // The URL of your tRPC API
            transformer: "superjson",
        }),
        {
            status: 200,
            headers: [["Content-Type", "text/html"] as [string, string]],
        },
    );
}
