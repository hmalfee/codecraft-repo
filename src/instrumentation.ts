export async function register() {
    if (
        process.env.NEXT_RUNTIME === "nodejs" &&
        process.env.NODE_ENV === "production"
    ) {
        const sourceMapSupport = await import("source-map-support");
        // integrate server source maps
        sourceMapSupport.install();
    }
}
