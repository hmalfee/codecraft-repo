import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { logger } from "@/server/lib/logger";
import { createTRPCContext } from "@/server/trpc";
import { createCaller, type AppRouter } from "@/server/trpc/root";
import { createQueryClient } from "./query-client";

// tRPC callers are called on the server and calls the functions/procedures directly skipping the
// fetchRequestHandler in the route handlers in trpc/[trpc]/route.ts and hence the request/response cycle.
// Therefore, we need to attach the headers manually to the context.

const createContext = cache(async () => {
    const heads = new Headers(await headers());
    heads.set("x-trpc-source", "rsc");

    return createTRPCContext({
        headers: heads,
    });
});

const caller = createCaller(createContext, {
    onError: ({ error }) => {
        // @ts-expect-error build error for dynamic server usage can be ignored by this condition
        // This error is thrown when you make a component render at server, it is a warning that
        // the component couldn't be made static and will be rendered dynamically.
        if (error.cause?.digest === "DYNAMIC_SERVER_USAGE") return;

        if (error.code === "INTERNAL_SERVER_ERROR") {
            logger.error("[TRPC]", error);
        }
    },
});

const getQueryClient = cache(createQueryClient);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
    caller,
    getQueryClient,
);
