import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const period = data.get("period");

  console.log("Received period:", period);

  await prisma.config.upsert({
    where: {
      key: "posttest_period",
    },
    update: {
      value: period === "final" ? "final" : "midterm",
    },
    create: {
      key: "posttest_period",
      value: period === "final" ? "final" : "midterm",
    },
  });

    return NextResponse.redirect(
    new URL(
        `/admin/questions?toggle=${period === "final" ? "final" : "midterm"}`,
        req.url
    ),
    303
    );
}