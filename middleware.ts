import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/auth/signin",
      "/auth/signup",
      "/api/auth/register",
    ];

    // Check if the current path is public
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected route
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Role-based route protection
    const userRole = token.role as string;

    // Define role-based access rules
    const roleRoutes = {
      student: ["/student"],
      instructor: ["/instructor"],
      coordinator: ["/coordinator"],
      manager: ["/manager"],
      ceo: ["/ceo", "/manager", "/coordinator", "/instructor"], // CEO has access to all dashboards
    };

    // Check if user has access to the requested route
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap = {
        student: "/student/dashboard",
        instructor: "/instructor/dashboard",
        coordinator: "/coordinator/dashboard",
        manager: "/manager/dashboard",
        ceo: "/ceo/dashboard",
      };

      const redirectUrl =
        dashboardMap[userRole as keyof typeof dashboardMap] || "/";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without token
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/api/auth/register",
        ];

        const pathname = req.nextUrl.pathname;

        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // For all other routes, require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
