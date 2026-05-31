import { NextResponse, type NextRequest } from "next/server";
import { CardCategory } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildClueCardFileName,
  buildClueCardImagePath,
  isClueCardCategory,
  slugifyClueCardSegment,
} from "@/lib/clue-cards";

export const runtime = "nodejs";

type ImportClueCardError = {
  line: number;
  reason: string;
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: ImportClueCardError[];
};

function wantsJson(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json") && !accept.includes("text/html");
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];

      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function normalizePngFileName(fileName: string) {
  const trimmed = fileName.trim();

  if (!trimmed) {
    return "";
  }

  const withoutQuery = trimmed.split("?")[0].split("#")[0];

  if (withoutQuery.includes("/")) {
    return withoutQuery.replace(/^\/+/, "");
  }

  if (withoutQuery.toLowerCase().endsWith(".png")) {
    const baseName = withoutQuery.slice(0, -4);
    const safeBaseName = slugifyClueCardSegment(baseName) || "clue-card";
    return `${safeBaseName}.png`;
  }

  const safeBaseName = slugifyClueCardSegment(withoutQuery) || "clue-card";
  return `${safeBaseName}.png`;
}

function parseCsv(fileText: string) {
  const errors: ImportClueCardError[] = [];
  const cards: Array<{ category: CardCategory; label: string; imageUrl: string }> = [];
  const seen = new Set<string>();

  const normalizedText = fileText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();

  if (!normalizedText) {
    return { cards, errors: [{ line: 1, reason: "empty file" }] };
  }

  const lines = normalizedText.split("\n");
  const header = splitCsvLine(lines[0]).map((value) => value.trim());
  const categoryIndex = header.findIndex((value) => value === "category");
  const labelIndex = header.findIndex((value) => value === "label");
  const filenameIndex = header.findIndex((value) => value === "filename" || value === "fileName");

  if (categoryIndex === -1 || labelIndex === -1) {
    return {
      cards,
      errors: [{ line: 1, reason: 'missing required headers "category" and "label"' }],
    };
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      continue;
    }

    const cells = splitCsvLine(line);
    const rawCategory = cells[categoryIndex] ?? "";
    const rawLabel = cells[labelIndex] ?? "";
    const rawFileName = filenameIndex >= 0 ? cells[filenameIndex] ?? "" : "";
    const category = rawCategory.trim();
    const label = rawLabel.trim();

    if (!isClueCardCategory(category)) {
      errors.push({ line: lineIndex + 1, reason: `invalid category \"${rawCategory.trim()}\"` });
      continue;
    }

    if (!label) {
      errors.push({ line: lineIndex + 1, reason: "missing label" });
      continue;
    }

    const fileName = normalizePngFileName(rawFileName || buildClueCardFileName(label));

    if (!fileName) {
      errors.push({ line: lineIndex + 1, reason: "invalid file name" });
      continue;
    }

    const dedupeKey = `${category}:${label}:${fileName}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    cards.push({
      category,
      label,
      imageUrl: buildClueCardImagePath(category, fileName),
    });
  }

  return { cards, errors };
}

async function importClueCards(cards: Array<{ category: CardCategory; label: string; imageUrl: string }>) {
  const importedCards: string[] = [];
  let skipped = 0;

  for (const card of cards) {
    const existing = await prisma.clueCard.findFirst({
      where: {
        category: card.category,
        label: card.label,
        imageUrl: card.imageUrl,
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.clueCard.create({
      data: card,
    });

    importedCards.push(card.label);
  }

  return { importedCards, skipped };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mode: "json" });
  if (!auth.ok) {
    return auth.response;
  }

  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "single");

  if (mode === "single") {
    const category = String(formData.get("category") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim();
    const filename = String(formData.get("filename") ?? "").trim();

    if (!isClueCardCategory(category)) {
      const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "invalid category" }] };
      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=invalid_category", request.url), { status: 303 });
    }

    if (!label) {
      const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "missing label" }] };
      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=invalid_label", request.url), { status: 303 });
    }

    if (!filename) {
      const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "missing filename" }] };
      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=missing_filename", request.url), { status: 303 });
    }

    const imageUrl = buildClueCardImagePath(category, normalizePngFileName(filename) || buildClueCardFileName(label));
    const existingCard = await prisma.clueCard.findFirst({
      where: { category, label, imageUrl },
      select: { id: true },
    });

    if (existingCard) {
      const response: ImportResult = { imported: 0, skipped: 1, errors: [] };
      return wantsJson(request)
        ? NextResponse.json(response)
        : NextResponse.redirect(
            new URL(
              "/admin/clue-cards?cardsImported=0&cardsSkipped=1&cardsMessage=clue_card_import_success",
              request.url
            ),
            { status: 303 }
          );
    }

    await prisma.clueCard.create({
      data: { category, label, imageUrl },
    });

    const response: ImportResult = { imported: 1, skipped: 0, errors: [] };
    return wantsJson(request)
      ? NextResponse.json(response)
      : NextResponse.redirect(
          new URL(
            "/admin/clue-cards?cardsImported=1&cardsSkipped=0&cardsMessage=clue_card_import_success",
            request.url
          ),
          { status: 303 }
        );
  }

  if (mode === "csv") {
    const uploadedFile = formData.get("file") ?? formData.get("csv");

    if (!(uploadedFile instanceof File)) {
      const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "missing csv file" }] };
      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=missing_file", request.url), { status: 303 });
    }

    const fileText = await uploadedFile.text();
    const parsed = parseCsv(fileText);

    if (parsed.errors.length > 0 && parsed.cards.length === 0) {
      const response: ImportResult = { imported: 0, skipped: 0, errors: parsed.errors };
      return wantsJson(request)
        ? NextResponse.json(response, { status: 400 })
        : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=invalid_csv", request.url), { status: 303 });
    }

    const { importedCards, skipped } = await importClueCards(parsed.cards);
    const response: ImportResult = {
      imported: importedCards.length,
      skipped: skipped + parsed.errors.length,
      errors: parsed.errors,
    };

    if (wantsJson(request)) {
      return NextResponse.json(response, { status: parsed.errors.length > 0 ? 207 : 200 });
    }

    const redirectUrl = new URL("/admin/clue-cards", request.url);
    redirectUrl.searchParams.set("cardsImported", String(response.imported));
    redirectUrl.searchParams.set("cardsSkipped", String(response.skipped));

    if (response.errors.length > 0) {
      redirectUrl.searchParams.set("cardsError", response.errors[0].reason);
    } else {
      redirectUrl.searchParams.set("cardsMessage", "clue_card_import_success");
    }

    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "unsupported import mode" }] };
  return wantsJson(request)
    ? NextResponse.json(response, { status: 400 })
    : NextResponse.redirect(new URL("/admin/clue-cards?cardsError=invalid_input", request.url), { status: 303 });
}
