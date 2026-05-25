import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

function cloneCookiesAndHeaders(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });

  source.headers.forEach((value, key) => {
    target.headers.set(key, value);
  });
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isLoginRoute = pathname === "/login";

  if (isAdminRoute || isAdminApiRoute) {
    const auth = await requireAdmin(request, {
      mode: isAdminApiRoute ? "json" : "redirect",
      redirectTo: "/login",
    });

    if (!auth.ok) {
      cloneCookiesAndHeaders(response, auth.response);
      return auth.response;
    }
  }

  if (user && isLoginRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/admin", request.url));
    cloneCookiesAndHeaders(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/api/admin/:path*"],
};