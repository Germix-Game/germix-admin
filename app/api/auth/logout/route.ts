import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const redirectResponse = NextResponse.redirect(new URL("/login?message=signed_out", request.url));

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(name, value, options);
      });

      Object.entries(headers).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value);
      });
    },
  });

  await supabase.auth.signOut();

  return redirectResponse;
}