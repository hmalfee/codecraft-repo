import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        AUTH_SECRET: z.string().min(1),
        /** It will be automatically set to "development" for `next dev` and
         * "production" for `next build` and `next start` commands. No need to
         * set manually in .env file. You can set it to "test" only if needed. */
        NODE_ENV: z.enum(["development", "production"]),
        SKIP_ENV_VALIDATION: z.enum(["1"]).optional(),
    },
    clientPrefix: "NEXT_PUBLIC_",
    client: {
        /** Tells whether the current environment is in Vercel. Use this instead
         * of NODE_ENV for stopping expensive events such as email sending, calling
         * external paid APIs, etc.
         */
        NEXT_PUBLIC_VERCEL: z.enum(["1"]).optional(),
        /** Alternative to NODE_ENV for client side usage. */
        NEXT_PUBLIC_ENV: z.enum(["development", "production"]),
    },
    runtimeEnvStrict: {
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
        SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
        NEXT_PUBLIC_VERCEL: process.env.NEXT_PUBLIC_VERCEL,
        NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    },
    emptyStringAsUndefined: true,
    skipValidation: !!Number(process.env.SKIP_ENV_VALIDATION),
});
