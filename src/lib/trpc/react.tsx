"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
    httpBatchLink,
    httpBatchStreamLink,
    loggerLink,
    splitLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";

import { env } from "@/env";
import { type AppRouter } from "@/server/trpc/root";
import SuperJSON from "superjson";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return createQueryClient();
    }
    // Browser: use singleton pattern to keep the same query client
    clientQueryClientSingleton ??= createQueryClient();

    return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                // logs the response errors with more details in development
                loggerLink({
                    enabled: (op) =>
                        env.NEXT_PUBLIC_ENV === "development" ||
                        (op.direction === "down" && op.result instanceof Error),
                }),
                splitLink({
                    condition(op) {
                        return op.path.startsWith("auth.");
                    },
                    true: httpBatchLink({
                        transformer: SuperJSON,
                        url: getBaseUrl() + "/api/trpc",
                        headers: () => {
                            const headers = new Headers();
                            headers.set("x-trpc-source", "nextjs-react");
                            headers.set("x-trpc-stream", "false");
                            return headers;
                        },
                    }),
                    false: httpBatchStreamLink({
                        transformer: SuperJSON,
                        url: getBaseUrl() + "/api/trpc",
                        headers() {
                            const headers = new Headers();
                            headers.set("x-trpc-source", "nextjs-react");
                            headers.set("x-trpc-stream", "true");
                            return headers;
                        },
                    }),
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    );
}

function getBaseUrl() {
    if (typeof window !== "undefined") return window.location.origin;
    // if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // return `http://localhost:${process.env.PORT ?? 3000}`;
    return "";
}
