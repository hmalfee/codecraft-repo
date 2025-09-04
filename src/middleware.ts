import { env } from "@/env";
import {
    NextResponse,
    type MiddlewareConfig,
    type NextRequest,
} from "next/server";

export async function middleware(request: NextRequest) {
    if (env.NODE_ENV === "development") {
        console.log("\n🛡️ Middleware invoked\n");
    }

    const headers = new Headers(request.headers);

    const protectedRoutes = ["/app"];
    const authRoutes = ["/login", "/sign-up"];
    const { pathname } = request.nextUrl;

    const sessionCookie = request.cookies.get("codecraft.session_token");

    if (!sessionCookie) {
        if (authRoutes.includes(pathname)) {
            return NextResponse.next();
        }

        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
            const url = new URL("/login", request.url);
            url.searchParams.set("redirect", encodeURI(pathname));
            return NextResponse.redirect(url, { headers });
        }
    }

    // let the RSCs know the requested pathname so they can redirect with context of the request
    headers.set("x-pathname", pathname);
    return NextResponse.next({ headers });
}

export const config: MiddlewareConfig = {
    // Middleware runs only on the server components
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
