import { env } from "@/env";
import { Pool } from "pg";
import winston from "winston";
import { PgTransport } from "./pg-transport";

const { combine, errors, timestamp, printf, colorize } = winston.format;

export const logger = winston.createLogger({
    format: combine(errors({ stack: true })),
    transports: [
        new winston.transports.Console({
            format: combine(
                timestamp({ format: "hh:mm:ss A" }),
                colorize({
                    all: true,
                }),
                printf((info) => {
                    const {
                        level,
                        message,
                        timestamp: ts,
                        stack,
                        ...additionalData
                    } = info;

                    let baseText = `\x1b[38;5;232m${String(ts)}\x1b[0m [\x1b[1m${String(level)}\x1b[0m]: ${String(message)}`;

                    if (stack) {
                        baseText += `\n\x1b[0;43m\x1b[1;90m STACK TRACE \x1b[0m\n\x1b[38;5;250m${String(stack as unknown)}\x1b[0m`;
                    }

                    if (Object.keys(additionalData).length > 0) {
                        baseText += `\n\x1b[48;5;238m\x1b[1;90m ADDITIONAL DATA \x1b[0m\n\x1b[38;5;250m${JSON.stringify(
                            additionalData,
                            null,
                            4,
                        )}\x1b[0m`;
                    }

                    return "\n" + baseText + "\n";
                }),
            ),
        }),
        new PgTransport({
            pool: new Pool({
                connectionString: env.DATABASE_URL,
            }),
            table: "app_logs",
            schema: "system",
        }),
    ],
});
