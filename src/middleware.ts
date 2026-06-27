import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* except /admin (login page) and /api/admin/login
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin";
  const isAdminApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    const session = req.cookies.get("admin_session");
    if (!session) {
      if (isAdminApi) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // If logged in and visiting /admin login page, redirect to dashboard
  if (pathname === "/admin") {
    const session = req.cookies.get("admin_session");
    if (session) {
      return NextResponse.redirect(new URL("/admin/inicio", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
