import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const TEACHER_PROTECTED = ["/acumular", "/rebajar", "/mis-lecciones", "/perfil"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ----- Admin (sin cambios) -----
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

  if (pathname === "/admin") {
    const session = req.cookies.get("admin_session");
    if (session) {
      return NextResponse.redirect(new URL("/admin/inicio", req.url));
    }
  }

  // ----- Docentes (Supabase Auth) -----
  const isTeacherPage = TEACHER_PROTECTED.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === "/login";

  if (isTeacherPage || isLoginPage) {
    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isTeacherPage && !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isLoginPage && user) {
      return NextResponse.redirect(new URL("/mis-lecciones", req.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/acumular",
    "/rebajar",
    "/mis-lecciones",
    "/perfil",
    "/login",
  ],
};
