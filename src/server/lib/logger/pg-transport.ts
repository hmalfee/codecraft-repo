import type { Pool } from "pg";
import type { TransportStreamOptions } from "winston-transport";
import Transport from "winston-transport";

interface PgTransportOptions extends TransportStreamOptions {
    pool: Pool;
    table: string;
    schema?: string;
    level?: string;
    timestamp?: string;
    message?: string;
    metadata?: string;
    batchSize?: number;
    flushInterval?: number;
    maxRetries?: number;
    retryDelay?: number;
}

interface LogEntry {
    level: unknown;
    timestamp: Date;
    message: unknown;
    metadata: string | null;
}

export class PgTransport extends Transport {
    private pool: Pool;
    private table: string;
    private schema: string;
    private levelColumn: string;
    private timestampColumn: string;
    private messageColumn: string;
    private metadataColumn: string;
    private fullTableName: string;

    private batchSize: number;
    private flushInterval: number;
    private logBatch: LogEntry[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private isClosing = false;

    private maxRetries: number;
    private retryDelay: number;

    constructor(options: PgTransportOptions) {
        super(options);

        if (!options.pool) {
            throw new Error("PgTransport requires a pg Pool instance");
        }

        if (!options.table) {
            throw new Error("PgTransport requires a table name");
        }

        this.pool = options.pool;
        this.table = options.table;
        this.schema = options.schema ?? "public";
        this.levelColumn = options.level ?? "level";
        this.timestampColumn = options.timestamp ?? "timestamp";
        this.messageColumn = options.message ?? "message";
        this.metadataColumn = options.metadata ?? "metadata";

        // Batching configuration
        this.batchSize = options.batchSize ?? 10;
        this.flushInterval = options.flushInterval ?? 5000; // 5 seconds

        // Retry configuration
        this.maxRetries = options.maxRetries ?? 3;
        this.retryDelay = options.retryDelay ?? 1000; // 1 second

        this.fullTableName = `"${this.schema}"."${this.table}"`;

        this.initTable().catch((err: Error) => {
            console.error("Failed to initialize PgTransport table:", err);
        });

        // Set up exit handlers for serverless environments
        this.setupExitHandlers();

        // Start the flush timer
        this.startFlushTimer();
    }

    private setupExitHandlers(): void {
        // Handle various exit scenarios
        const exitHandler = () => {
            if (!this.isClosing) {
                this.isClosing = true;
                this.flushBatch().catch((err) => {
                    console.error("Failed to flush logs on exit:", err);
                });
            }
        };

        // Standard exit events
        process.on("exit", exitHandler);
        process.on("SIGINT", exitHandler);
        process.on("SIGTERM", exitHandler);
        process.on("uncaughtException", exitHandler);
        process.on("unhandledRejection", exitHandler);

        // AWS Lambda specific - before function completion
        process.on("beforeExit", exitHandler);
    }

    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            if (this.logBatch.length > 0) {
                this.flushBatch().catch((err) => {
                    console.error("Failed to flush logs on timer:", err);
                });
            }
        }, this.flushInterval);

        // Don't keep the process alive just for the timer
        this.flushTimer.unref();
    }

    async initTable(): Promise<void> {
        // First, check if schema exists and create it if it doesn't
        const checkSchemaQuery = `
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name = $1;
        `;

        try {
            const schemaResult = await this.pool.query(checkSchemaQuery, [
                this.schema,
            ]);

            if (schemaResult.rowCount === 0) {
                const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS "${this.schema}";`;
                await this.pool.query(createSchemaQuery);
            }

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.fullTableName} (
                    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    "${this.levelColumn}" VARCHAR(10) NOT NULL,
                    "${this.timestampColumn}" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "${this.messageColumn}" TEXT,
                    "${this.metadataColumn}" JSONB
                );
            `;

            await this.pool.query(createTableQuery);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            throw new Error(
                `Failed to create schema/table ${this.fullTableName}: ${errorMessage}`,
            );
        }
    }

    log(info: Record<string, unknown>, callback: () => void): boolean {
        if (this.silent || this.isClosing) {
            callback();
            return true;
        }

        const { level, message, timestamp, ...metadata } = info;

        const logEntry: LogEntry = {
            level,
            timestamp: timestamp ? new Date(timestamp as string) : new Date(),
            message,
            metadata:
                Object.keys(metadata).length > 0
                    ? JSON.stringify(metadata)
                    : null,
        };

        this.logBatch.push(logEntry);

        // Flush immediately if batch is full
        if (this.logBatch.length >= this.batchSize) {
            setImmediate(() => {
                this.flushBatch().catch((err) => {
                    console.error("Failed to flush full batch:", err);
                });
            });
        }

        callback();
        return true;
    }

    private async flushBatch(): Promise<void> {
        if (this.logBatch.length === 0) {
            return;
        }

        const batch = [...this.logBatch];
        this.logBatch = [];

        await this.insertBatchWithRetry(batch);
    }

    private async insertBatchWithRetry(
        batch: LogEntry[],
        attempt = 1,
    ): Promise<void> {
        try {
            await this.insertBatch(batch);
            // Emit logged event for each successfully processed log
            batch.forEach(() => {
                this.emit("logged");
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(
                `PgTransport failed to insert batch (attempt ${attempt}/${this.maxRetries}):`,
                errorMessage,
            );

            if (attempt < this.maxRetries) {
                // Wait before retrying
                await new Promise((resolve) =>
                    setTimeout(resolve, this.retryDelay * attempt),
                );
                return this.insertBatchWithRetry(batch, attempt + 1);
            } else {
                console.error(
                    `Failed to insert batch after ${this.maxRetries} attempts, dropping ${batch.length} logs`,
                );
                // Emit error for the transport
                this.emit(
                    "error",
                    new Error(
                        `Failed to insert batch after ${this.maxRetries} attempts: ${errorMessage}`,
                    ),
                );
            }
        }
    }

    private async insertBatch(batch: LogEntry[]): Promise<void> {
        if (batch.length === 0) return;

        // Build batch insert query
        const valuesClauses: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const entry of batch) {
            valuesClauses.push(
                `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`,
            );
            values.push(
                entry.level,
                entry.timestamp,
                entry.message,
                entry.metadata,
            );
            paramIndex += 4;
        }

        const insertQuery = `
            INSERT INTO ${this.fullTableName} (
                "${this.levelColumn}",
                "${this.timestampColumn}",
                "${this.messageColumn}",
                "${this.metadataColumn}"
            ) VALUES ${valuesClauses.join(", ")}
        `;

        await this.pool.query(insertQuery, values);
    }

    // Method to manually flush - useful for serverless environments
    async flush(): Promise<void> {
        await this.flushBatch();
    }

    close(): void {
        this.isClosing = true;

        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        // Flush remaining logs synchronously if possible
        this.flushBatch()
            .catch((err) => {
                console.error("Failed to flush logs on close:", err);
            })
            .finally(() => {
                if (this.pool) {
                    void this.pool.end();
                }
            });
    }
}
