import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ImportUsernameError = {
  line: number;
  reason: string;
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: ImportUsernameError[];
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

function parseCsv(fileText: string): { usernames: string[]; errors: ImportUsernameError[] } {
  const errors: ImportUsernameError[] = [];
  const usernames: string[] = [];
  const seen = new Set<string>();

  const normalizedText = fileText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();

  if (!normalizedText) {
    return { usernames, errors: [{ line: 1, reason: "empty file" }] };
  }

  const lines = normalizedText.split("\n");
  const header = splitCsvLine(lines[0]).map((value) => value.trim());
  const usernameIndex = header.findIndex((value) => value === "username");

  if (usernameIndex === -1) {
    return { usernames, errors: [{ line: 1, reason: 'missing required header "username"' }] };
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      continue;
    }

    const cells = splitCsvLine(line);
    const rawUsername = cells[usernameIndex] ?? "";
    const username = rawUsername.trim();

    if (!username.trim()) {
      continue;
    }

    if (seen.has(username)) {
      continue;
    }

    seen.add(username);
    usernames.push(username);
  }

  return { usernames, errors };
}

function parseSingleUsername(rawUsername: string): { usernames: string[]; errors: ImportUsernameError[] } {
  const username = rawUsername.replace(/^\uFEFF/, "").trim();

  if (!username.trim()) {
    return { usernames: [], errors: [{ line: 1, reason: "missing username" }] };
  }

  return { usernames: [username], errors: [] };
}

async function importUsernames(usernames: string[]) {
  const importedUsernames: string[] = [];
  let skipped = 0;

  for (const username of usernames) {
    const existing = await prisma.approvedUsername.findUnique({
      where: { username },
      select: { username: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.approvedUsername.create({
      data: { username },
    });

    importedUsernames.push(username);
  }

  return { importedUsernames, skipped };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mode: "json" });
  if (!auth.ok) {
    return auth.response;
  }

  const formData = await request.formData();
  const uploadedFile = formData.get("file") ?? formData.get("csv");
  const manualUsername = String(formData.get("username") ?? "");

  const hasManualUsername = manualUsername.trim().length > 0;
  const hasFileUpload = uploadedFile instanceof File;

  if (!hasManualUsername && !hasFileUpload) {
    const response: ImportResult = { imported: 0, skipped: 0, errors: [{ line: 0, reason: "missing username or CSV file" }] };
    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(new URL("/admin?error=missing_input", request.url), { status: 303 });
  }

  let parsed: { usernames: string[]; errors: ImportUsernameError[] };

  if (hasManualUsername) {
    parsed = parseSingleUsername(manualUsername);
  } else if (hasFileUpload) {
    const fileText = await uploadedFile.text();
    parsed = parseCsv(fileText);
  } else {
    parsed = { usernames: [], errors: [{ line: 0, reason: "missing input" }] };
  }

  if (parsed.errors.length > 0 && parsed.usernames.length === 0) {
    const response: ImportResult = { imported: 0, skipped: 0, errors: parsed.errors };
    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(
          new URL(hasManualUsername ? "/admin?error=invalid_username" : "/admin?error=invalid_csv", request.url),
          { status: 303 }
        );
  }

  const { importedUsernames, skipped } = await importUsernames(parsed.usernames);

  const response: ImportResult = {
    imported: importedUsernames.length,
    skipped: skipped + parsed.errors.length,
    errors: parsed.errors,
  };

  if (wantsJson(request)) {
    return NextResponse.json(response);
  }

  const redirectUrl = new URL("/admin", request.url);
  redirectUrl.searchParams.set("imported", String(response.imported));
  redirectUrl.searchParams.set("skipped", String(response.skipped));
  if (response.errors.length > 0) {
    redirectUrl.searchParams.set("error", response.errors[0].reason);
  } else {
    redirectUrl.searchParams.set("message", "import_success");
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}