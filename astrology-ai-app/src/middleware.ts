import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
	function middleware(req: NextRequest) {
		// Security headers
		const response = NextResponse.next();

		// Security headers
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("Referrer-Policy", "origin-when-cross-origin");
		response.headers.set(
			"Content-Security-Policy",
			"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
		);

		return response;
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Protect API routes that require authentication
				if (req.nextUrl.pathname.startsWith("/api/protected")) {
					return !!token;
				}

				// Protect dashboard and user-specific pages
				if (
					req.nextUrl.pathname.startsWith("/dashboard") ||
					req.nextUrl.pathname.startsWith("/profile") ||
					req.nextUrl.pathname.startsWith("/charts")
				) {
					return !!token;
				}

				return true;
			},
		},
	}
);

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/profile/:path*",
		"/charts/:path*",
		"/api/protected/:path*",
	],
};
