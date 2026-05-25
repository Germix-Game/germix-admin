import { NextResponse, type NextRequest } from "next/server";
import { isActiveAdminUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "missing_fields");
    return NextResponse.redirect(redirectUrl);
  }

  const successResponse = NextResponse.redirect(new URL("/admin", request.url));

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        successResponse.cookies.set(name, value, options);
      });

      Object.entries(headers).forEach(([key, value]) => {
        successResponse.headers.set(key, value);
      });
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "invalid_credentials");
    redirectUrl.searchParams.set("email", email);
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signOut();

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "not_admin");
    return NextResponse.redirect(redirectUrl);
  }

  const adminIsActive = await isActiveAdminUser(user.id, user.email);

  if (!adminIsActive) {
    await supabase.auth.signOut();

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "admin_inactive");
    return NextResponse.redirect(redirectUrl);
  }

  return successResponse;
}