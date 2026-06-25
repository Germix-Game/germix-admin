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

  const options = data.has("option_A")
    ? [
        String(data.get("option_A") ?? "").trim(),
        String(data.get("option_B") ?? "").trim(),
        String(data.get("option_C") ?? "").trim(),
        String(data.get("option_D") ?? "").trim(),
      ]
    : existing.options;

  const correctOption =
    (data.get("correctOption") as string | null) ??
    existing.correctOption;

  const sortOrder = data.has("sortOrder")
    ? Number(data.get("sortOrder"))
    : existing.sortOrder;

  const error = validateQuestionInput({
    period,
    body,
    options,
    correctOption,
    sortOrder,
  });

  if (error) {
    return buildRedirect(req, period, { error });
  }

  try {
    await prisma.postTestQuestion.update({
      where: { id },
      data: {
        period: period as PostTestPeriod,
        body,
        options,
        correctOption: correctOption as AnswerOption,
        sortOrder,
      },
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