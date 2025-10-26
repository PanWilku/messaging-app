import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /api/auth/signin)
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/", // Home page (landing page)
    "/signin", // Sign in page
    "/signup", // Sign up page
    "/api/auth", // NextAuth API routes (signin, callback, etc.)
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/api/auth") {
      return pathname.startsWith(route);
    }
    return pathname === route;
  });

  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Try to get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token found, redirect to signin with callback URL
  if (!token) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Token exists, allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  // Match all routes except static files and images
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
