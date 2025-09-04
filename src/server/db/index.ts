import { env } from "@/env";
import { logger } from "@/server/lib/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

if (env.NODE_ENV === "development") {
    pool.on("connect", () => {
        logger.info("[DATABASE] New connection established");
    });

    pool.on("remove", () => {
        logger.info("[DATABASE] Connection removed from the pool");
    });
}

pool.on("error", (err) => {
    logger.error("[DATABASE]", err);
});
