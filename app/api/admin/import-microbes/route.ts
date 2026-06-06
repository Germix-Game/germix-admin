import {
  CardCategory,
  type GameMode,
  type GramType,
  type MicrobeTag,
} from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAnswerImageFileName,
  buildAnswerImagePath,
  isGameMode,
  isGramType,
  isMicrobeTag,
  normalizePngFileName,
} from "@/lib/microbes";

export const runtime = "nodejs";

type ImportMicrobeError = {
  line: number;
  reason: string;
};

type ImportResult = {
  imported: number;
  updated: number;
  skipped: number;
  errors: ImportMicrobeError[];
};

type ParsedMicrobe = {
  name: string;
  shortName: string;
  gameMode: GameMode;
  gramType: GramType;
  tags: MicrobeTag[];
  starRating: number;
  answerImageUrl: string;
  clueCardIds: string[];
};

const requiredCardCategories = new Set<CardCategory>(Object.values(CardCategory));

function wantsJson(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json") && !accept.includes("text/html");
}

function splitListValues(value: string) {
  return value
    .split(/[|,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeList(values: string[]) {
  return [...new Set(values)];
}

function getSingleClueCardIds(formData: FormData) {
  const selectedIds: string[] = [];

  for (const category of Object.values(CardCategory)) {
    const values = formData.getAll(`clueCardIds_${category}`);

    for (const value of values) {
      const clueCardId = String(value ?? "").trim();
      if (clueCardId) {
        selectedIds.push(clueCardId);
      }
    }
  }

  return dedupeList(selectedIds);
}

async function validateClueCoverage(clueCardIds: string[]) {
  const cards = await prisma.clueCard.findMany({
    where: { id: { in: clueCardIds } },
    select: { id: true, category: true },
  });

  const existingIds = new Set(cards.map((card) => card.id));
  const missingIds = clueCardIds.filter((id) => !existingIds.has(id));
  if (missingIds.length > 0) {
    return { ok: false as const, reason: `unknown clue card ids: ${missingIds.join(", ")}` };
  }

  const categories = new Set(cards.map((card) => card.category));
  const missingCategories = [...requiredCardCategories].filter((category) => !categories.has(category));
  if (missingCategories.length > 0) {
    return {
      ok: false as const,
      reason: `missing clue categories: ${missingCategories.join(", ")}`,
    };
  }

  return { ok: true as const };
}

function parseMicrobe(
  raw: {
    name: string;
    shortName: string;
    gameMode: string;
    gramType: string;
    tags: string;
    starRating: string;
    answerFilename: string;
    clueCardIds: string;
  },
  line: number
): { microbe?: ParsedMicrobe; errors: ImportMicrobeError[] } {
  const errors: ImportMicrobeError[] = [];

  const name = raw.name.trim();
  const shortName = raw.shortName.trim();
  const gameModeRaw = raw.gameMode.trim();
  const gramTypeRaw = raw.gramType.trim();
  const starRatingNumber = Number(raw.starRating.trim());
  const clueCardIds = dedupeList(splitListValues(raw.clueCardIds));

  if (!name) {
    errors.push({ line, reason: "missing name" });
  }

  if (!shortName) {
    errors.push({ line, reason: "missing shortName" });
  }

  if (!isGameMode(gameModeRaw)) {
    errors.push({ line, reason: `invalid gameMode \"${gameModeRaw}\"` });
  }

  if (!isGramType(gramTypeRaw)) {
    errors.push({ line, reason: `invalid gramType \"${gramTypeRaw}\"` });
  }

  if (!Number.isFinite(starRatingNumber) || starRatingNumber < 0) {
    errors.push({ line, reason: "starRating must be a non-negative number" });
  }

  const rawTags = splitListValues(raw.tags);
  const invalidTags = rawTags.filter((tag) => !isMicrobeTag(tag));
  if (invalidTags.length > 0) {
    errors.push({ line, reason: `invalid tags: ${invalidTags.join(", ")}` });
  }

  if (clueCardIds.length === 0) {
    errors.push({ line, reason: "missing clueCardIds" });
  }

  if (errors.length > 0) {
    return { errors };
  }

  const gameMode = gameModeRaw as GameMode;
  const answerFileName = normalizePngFileName(raw.answerFilename) || buildAnswerImageFileName(name);
  return {
    microbe: {
      name,
      shortName,
      gameMode,
      gramType: gramTypeRaw as GramType,
      tags: dedupeList(rawTags) as MicrobeTag[],
      starRating: starRatingNumber,
      answerImageUrl: buildAnswerImagePath(gameMode, answerFileName),
      clueCardIds,
    },
    errors,
  };
}

async function importMicrobes(microbes: ParsedMicrobe[]) {
  const imported: string[] = [];
  let skipped = 0;
  const errors: ImportMicrobeError[] = [];

  for (let index = 0; index < microbes.length; index += 1) {
    const microbe = microbes[index];
    const line = index + 1;

    const existing = await prisma.microbe.findUnique({
      where: { name: microbe.name },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      errors.push({
        line,
        reason: `microbe already exists: ${microbe.name}`,
      });
      continue;
    }

    const coverage = await validateClueCoverage(microbe.clueCardIds);
    if (!coverage.ok) {
      errors.push({ line, reason: coverage.reason });
      continue;
    }

    await prisma.microbe.create({
      data: {
        name: microbe.name,
        shortName: microbe.shortName,
        gameMode: microbe.gameMode,
        gramType: microbe.gramType,
        tags: microbe.tags,
        starRating: microbe.starRating,
        answerImageUrl: microbe.answerImageUrl,
        clues: {
          create: microbe.clueCardIds.map((clueCardId, clueIndex) => ({
            clueCard: { connect: { id: clueCardId } },
            sortOrder: clueIndex + 1,
          })),
        },
      },
    });

    imported.push(microbe.name);
  }

  return { imported, updated: 0, skipped, errors };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mode: "json" });
  if (!auth.ok) {
    return auth.response;
  }

  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "create");

  if (mode !== "create" && mode !== "single" && mode !== "edit") {
    const response: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [{ line: 0, reason: "unsupported import mode" }],
    };

    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(new URL("/admin?microbesError=unsupported_mode", request.url), {
          status: 303,
        });
  }

  const selectedClueCardIds = getSingleClueCardIds(formData);
  const selectedTags = formData
    .getAll("tags")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join("|");

  const parsed = parseMicrobe(
    {
      name: String(formData.get("name") ?? ""),
      shortName: String(formData.get("shortName") ?? ""),
      gameMode: String(formData.get("gameMode") ?? ""),
      gramType: String(formData.get("gramType") ?? ""),
      tags: selectedTags,
      starRating: String(formData.get("starRating") ?? ""),
      answerFilename: String(formData.get("answerFilename") ?? ""),
      clueCardIds: selectedClueCardIds.join("|"),
    },
    1
  );

  if (parsed.errors.length > 0 || !parsed.microbe) {
    const response: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: parsed.errors.length > 0 ? parsed.errors : [{ line: 1, reason: "invalid input" }],
    };

    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(new URL(`/admin?microbesError=${response.errors[0].reason}`, request.url), {
          status: 303,
        });
  }

  if (mode === "edit") {
    const microbeId = String(formData.get("microbeId") ?? "").trim();

    if (!microbeId) {
      const response: ImportResult = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [{ line: 1, reason: "missing microbeId" }],
      };

      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin?microbesError=missing_microbe_id", request.url), {
            status: 303,
          });
    }

    const existing = await prisma.microbe.findUnique({
      where: { id: microbeId },
      select: { id: true },
    });

    if (!existing) {
      const response: ImportResult = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [{ line: 1, reason: `microbe not found: ${microbeId}` }],
      };

      return wantsJson(request)
        ? NextResponse.json(response, { status: 404 })
        : NextResponse.redirect(new URL("/admin?microbesError=microbe_not_found", request.url), {
            status: 303,
          });
    }

    const duplicateName = await prisma.microbe.findFirst({
      where: { name: parsed.microbe.name, id: { not: microbeId } },
      select: { id: true },
    });

    if (duplicateName) {
      const response: ImportResult = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [{ line: 1, reason: `microbe already exists: ${parsed.microbe.name}` }],
      };

      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL(`/admin?microbesError=microbe_exists`, request.url), {
            status: 303,
          });
    }

    const coverage = await validateClueCoverage(parsed.microbe.clueCardIds);
    if (!coverage.ok) {
      const response: ImportResult = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [{ line: 1, reason: coverage.reason }],
      };

      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL(`/admin?microbesError=${coverage.reason}`, request.url), {
            status: 303,
          });
    }

    await prisma.microbe.update({
      where: { id: microbeId },
      data: {
        name: parsed.microbe.name,
        shortName: parsed.microbe.shortName,
        gameMode: parsed.microbe.gameMode,
        gramType: parsed.microbe.gramType,
        tags: parsed.microbe.tags,
        starRating: parsed.microbe.starRating,
        answerImageUrl: parsed.microbe.answerImageUrl,
        clues: {
          deleteMany: {},
          create: parsed.microbe.clueCardIds.map((clueCardId, clueIndex) => ({
            clueCard: { connect: { id: clueCardId } },
            sortOrder: clueIndex + 1,
          })),
        },
      },
    });

    const response: ImportResult = {
      imported: 0,
      updated: 1,
      skipped: 0,
      errors: [],
    };

    if (wantsJson(request)) {
      return NextResponse.json(response, { status: 200 });
    }

    const redirectUrl = new URL("/admin", request.url);
    redirectUrl.searchParams.set("microbesUpdated", String(response.updated));
    redirectUrl.searchParams.set("microbesMessage", "microbe_update_success");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const result = await importMicrobes([parsed.microbe]);
  const response: ImportResult = {
    imported: result.imported.length,
    updated: result.updated,
    skipped: result.skipped,
    errors: result.errors,
  };

  if (wantsJson(request)) {
    return NextResponse.json(response, { status: response.errors.length > 0 ? 400 : 200 });
  }

  const redirectUrl = new URL("/admin", request.url);
  redirectUrl.searchParams.set("microbesImported", String(response.imported));
  redirectUrl.searchParams.set("microbesUpdated", String(response.updated));
  redirectUrl.searchParams.set("microbesSkipped", String(response.skipped));
  if (response.errors.length > 0) {
    redirectUrl.searchParams.set("microbesError", response.errors[0].reason);
  } else {
    redirectUrl.searchParams.set("microbesMessage", "microbe_import_success");
  }
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
