import type { NextConfig } from "next";
import "./src/env";

import { env } from "@/env";
const config: NextConfig = {
    poweredByHeader: false,
    env: {
        NEXT_PUBLIC_VERCEL: process.env.VERCEL,
    },
    ...(env.NODE_ENV === "production"
        ? {
              experimental: {
                  serverSourceMaps: true,
              },
          }
        : {}),
};

export default config;
