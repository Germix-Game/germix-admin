import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, { mode: "json" });

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    id: auth.user.id,
    email: auth.user.email,
  });
}