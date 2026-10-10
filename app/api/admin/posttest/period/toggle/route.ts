import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const VALID_PERIODS = new Set(["midterm", "prefinal", "final"]);

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const rawPeriod = String(data.get("period") ?? "").toLowerCase();
  const period = VALID_PERIODS.has(rawPeriod) ? rawPeriod : "midterm";

  console.log("Received period:", period);

  await prisma.config.upsert({
    where: {
      key: "posttest_period",
    },
    update: {
      value: period,
    },
    create: {
      key: "posttest_period",
      value: period,
    },
  });

    return NextResponse.redirect(
    new URL(
        `/admin/questions?toggle=${period}`,
        req.url
    ),
    303
    );
}