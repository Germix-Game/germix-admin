import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.postTestQuestion.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.redirect(
      new URL("/admin/questions?error=not_found", req.url), 303
    );
  }

  await prisma.postTestQuestion.delete({
    where: { id },
  });

  return NextResponse.redirect(
    new URL(
      `/admin/questions?period=${existing.period}&deleted=${id}`,
      req.url
    ), 303
  );
}