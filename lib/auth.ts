import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

type RequireAdminMode = "json" | "redirect";

type RequireAdminOptions = {
  mode?: RequireAdminMode;
  redirectTo?: string;
};

type AdminAuthSuccess = {
  ok: true;
  user: {
    id: string;
    email?: string | null;
  };
};

type AdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

type AdminStatusRow = {
  isActive: boolean;
};

export async function isActiveAdminUser(userId: string, email?: string | null): Promise<boolean> {
  if (!email) {
    const rows = await prisma.$queryRaw<AdminStatusRow[]>`
      SELECT "isActive"
      FROM "AdminUser"
      WHERE "id" = ${userId}
      LIMIT 1
    `;

    return Boolean(rows[0]?.isActive);
  }

  const rows = await prisma.$queryRaw<AdminStatusRow[]>`
    SELECT "isActive"
    FROM "AdminUser"
    WHERE "id" = ${userId} OR "email" = ${email}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isActive);
}

export async function requireAdmin(
  request: NextRequest,
  options: RequireAdminOptions = {}
): Promise<AdminAuthResult> {
  const mode = options.mode ?? "json";
  const redirectTo = options.redirectTo ?? "/login";

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (mode === "redirect") {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", "auth_required");
      return { ok: false, response: NextResponse.redirect(url) };
    }

    return {
      ok: false,
      response: NextResponse.json({ error: { code: "forbidden", message: "Admin access required." } }, { status: 403 }),
    };
  }

  const adminIsActive = await isActiveAdminUser(user.id, user.email);

  if (!adminIsActive) {
    if (mode === "redirect") {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", "admin_inactive");
      return { ok: false, response: NextResponse.redirect(url) };
    }

    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: "forbidden", message: "Admin account is not active." } },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}