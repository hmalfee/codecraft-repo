import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { logger } from "@/server/lib/logger";
import { createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server/trpc/root";

const handler = (req: NextRequest) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,

        createContext: () =>
            createTRPCContext({
                headers: req.headers,
            }),

        onError: ({ error }) => {
            if (error.code === "INTERNAL_SERVER_ERROR") {
                logger.error("[TRPC]", error);
            }
        },
    });
};

export { handler as GET, handler as POST };
