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

  const bodyImageUrlRaw = String(data.get("bodyImageUrl") ?? "").trim();
  const bodyImageUrl = bodyImageUrlRaw
    ? bodyImageUrlRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const options = [
    String(data.get("option_A") ?? "").trim(),
    String(data.get("option_B") ?? "").trim(),
    String(data.get("option_C") ?? "").trim(),
    String(data.get("option_D") ?? "").trim(),
    String(data.get("option_E") ?? "").trim(),
  ];

  const optionImages: { option: AnswerOption; imageUrl: string }[] = [];
  const ANSWER_OPTIONS = ["A", "B", "C", "D", "E"] as const;
  for (const opt of ANSWER_OPTIONS) {
    const imageUrl = String(data.get(`option_image_${opt}`) ?? "").trim();
    if (imageUrl) {
      optionImages.push({
        option: opt as AnswerOption,
        imageUrl,
      });
    }
  }

  const correctOption = String(data.get("correctOption") ?? "");

  const sortOrder = Number(data.get("sortOrder"));

  const error = validateQuestionInput({
    period,
    body,
    bodyImageUrl,
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
        bodyImageUrl,
        options,
        correctOption: correctOption as AnswerOption,
        sortOrder,
        optionImages: {
          create: optionImages.map((oi) => ({
            option: oi.option,
            imageUrl: oi.imageUrl,
          })),
        },
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