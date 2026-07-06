import { NextRequest, NextResponse } from "next/server";
import { Prisma, AnswerOption, PostTestPeriod } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validateQuestionInput } from "@/lib/posttest";

function buildRedirect(
  req: NextRequest,
  period?: string,
  params?: Record<string, string>
) {
  const url = new URL("/admin/questions", req.url);

  if (period) {
    url.searchParams.set("period", period);
  }

  if (params) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
  }

  return NextResponse.redirect(url, 303);
}

async function handleUpdate(
  req: NextRequest,
  id: string,
  data: FormData
) {
  const existing = await prisma.postTestQuestion.findUnique({
    where: { id },
    include: { optionImages: true },
  });

  if (!existing) {
    return buildRedirect(req, undefined, {
      error: "not_found",
    });
  }

  const period =
    (data.get("period") as string | null) ?? existing.period;

  const body =
    data.has("body")
      ? String(data.get("body") ?? "").trim()
      : existing.body;

  const bodyImageUrl = data.has("bodyImageUrl")
    ? (data.get("bodyImageUrl") as string ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : existing.bodyImageUrl;

  const options = data.has("option_A")
    ? [
        String(data.get("option_A") ?? "").trim(),
        String(data.get("option_B") ?? "").trim(),
        String(data.get("option_C") ?? "").trim(),
        String(data.get("option_D") ?? "").trim(),
        String(data.get("option_E") ?? "").trim(),
      ]
    : existing.options;

  const hasOptionImageKeys = ["A", "B", "C", "D", "E"].some((opt) =>
    data.has(`option_image_${opt}`)
  );

  let optionImagesToSet: { option: AnswerOption; imageUrl: string }[] | undefined = undefined;
  if (hasOptionImageKeys) {
    optionImagesToSet = [];
    const ANSWER_OPTIONS = ["A", "B", "C", "D", "E"] as const;
    for (const opt of ANSWER_OPTIONS) {
      const imageUrl = String(data.get(`option_image_${opt}`) ?? "").trim();
      if (imageUrl) {
        optionImagesToSet.push({
          option: opt as AnswerOption,
          imageUrl,
        });
      }
    }
  }

  const correctOption =
    (data.get("correctOption") as string | null) ??
    existing.correctOption;

  const sortOrder = data.has("sortOrder")
    ? Number(data.get("sortOrder"))
    : existing.sortOrder;

  const error = validateQuestionInput({
    period,
    body,
    bodyImageUrl,
    options,
    correctOption,
    sortOrder,
  });

  if (error) {
    return buildRedirect(req, period, { error });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (optionImagesToSet !== undefined) {
        await tx.postTestOptionImage.deleteMany({
          where: { questionId: id },
        });
      }

      await tx.postTestQuestion.update({
        where: { id },
        data: {
          period: period as PostTestPeriod,
          body,
          bodyImageUrl,
          options,
          correctOption: correctOption as AnswerOption,
          sortOrder,
          ...(optionImagesToSet !== undefined && {
            optionImages: {
              create: optionImagesToSet.map((oi) => ({
                option: oi.option,
                imageUrl: oi.imageUrl,
              })),
            },
          }),
        },
      });
    });

    return buildRedirect(req, period, {
      updated: id,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return buildRedirect(req, period, {
        error: "duplicate_sort_order",
      });
    }

    return buildRedirect(req, period, {
      error: "server_error",
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data = await req.formData();

  if (data.get("_method") !== "PUT") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  return handleUpdate(req, id, data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data = await req.formData();

  return handleUpdate(req, id, data);
}