import { NextRequest, NextResponse } from "next/server";
import { Prisma, AnswerOption, PostTestPeriod } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validateQuestionInput } from "@/lib/posttest";

function redirect(
  req: NextRequest,
  period: string,
  params: Record<string, string>
) {
  const url = new URL("/admin/questions", req.url);

  if (period) {
    url.searchParams.set("period", period);
  }

  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const period = String(data.get("period") ?? "");

  const body = String(data.get("body") ?? "").trim();

  const options = [
    String(data.get("option_A") ?? "").trim(),
    String(data.get("option_B") ?? "").trim(),
    String(data.get("option_C") ?? "").trim(),
    String(data.get("option_D") ?? "").trim(),
    String(data.get("option_E") ?? "").trim(),
  ];

  const correctOption = String(data.get("correctOption") ?? "");

  const sortOrder = Number(data.get("sortOrder"));

  const error = validateQuestionInput({
    period,
    body,
    options,
    correctOption,
    sortOrder,
  });

  if (error) {
    return redirect(req, period, { error });
  }

  try {
    const question = await prisma.postTestQuestion.create({
      data: {
        period: period as PostTestPeriod,
        body,
        options,
        correctOption: correctOption as AnswerOption,
        sortOrder,
      },
    });

    return redirect(req, period, {
      created: question.id,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return redirect(req, period, {
        error: "duplicate_sort_order",
      });
    }

    return redirect(req, period, {
      error: "server_error",
    });
  }
}