console.log("Database URL:", process.env.DATABASE_URL ?? "no url");
console.log("T3 Database URL:", env.DATABASE_URL ?? "no url");

import { env } from "@/env";
import { type Config } from "drizzle-kit";

import fs from "fs";
import path from "path";

export default {
    schema: "./src/server/db/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    out: "./migrations",
    migrations: {
        schema: "system",
        table: "migrations",
    },
    /**
     * `schemaFilter` is required for `drizzle-kit push` to work, more specifically in `development` environment.
     * If you don't want to use `drizzle-kit push`, you can remove this schemaFilter below.
     * You can write all the schema names manually such as ['auth', 'public'], but following our project convention,
     * we can get the schema names if we read all the files except for `index.ts` in the schema directory.
     * This way, if you add a new schema file, you don't have to update this config file.
     *
     * Now, we include both files (ending with .ts except index.ts) and folders (containing an index.ts within it).
     */
    schemaFilter: fs
        .readdirSync("./src/server/db/schema", { withFileTypes: true })
        .filter((dirent) => {
            if (dirent.isFile()) {
                return (
                    dirent.name !== "index.ts" && dirent.name.endsWith(".ts")
                );
            }
            if (dirent.isDirectory()) {
                const indexTsPath = path.join(
                    "./src/server/db/schema",
                    dirent.name,
                    "index.ts",
                );
                return fs.existsSync(indexTsPath);
            }
            return false;
        })
        .map((dirent) =>
            dirent.isFile() ? path.basename(dirent.name, ".ts") : dirent.name,
        ),
} satisfies Config;
