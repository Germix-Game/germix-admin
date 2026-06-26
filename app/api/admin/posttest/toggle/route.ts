import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const enabled = data.get("enabled") === "true";

  await prisma.config.upsert({
    where: {
      key: "posttest_enabled",
    },
    update: {
      value: enabled ? "true" : "false",
    },
    create: {
      key: "posttest_enabled",
      value: enabled ? "true" : "false",
    },
  });

    return NextResponse.redirect(
    new URL(
        `/admin/questions?toggle=${enabled ? "enabled" : "disabled"}`,
        req.url
    ),
    303
    );
}