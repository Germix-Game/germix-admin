import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { buildFakeEmailForUsername } from "@/lib/username-import";

type ImportUsernameError = {
  line: number;
  reason: string;
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: ImportUsernameError[];
};

type ParsedUsernameImportRow = {
  username: string;
  password: string;
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

function normalizeUsername(rawUsername: string) {
  const withoutBom = rawUsername.replace(/^\uFEFF/, "");
  console.log(`Normalizing username: "${rawUsername}" -> "${withoutBom}"`);

  const username = withoutBom.trim();
  console.log(`Trimmed username: "${withoutBom}" -> "${username}"`);

  if (!username) {
    console.log(`Username is empty. Rejecting: "${rawUsername}"`);
    return null;
  }

  return username;
}

function parseCsv(fileText: string): { rows: ParsedUsernameImportRow[]; errors: ImportUsernameError[] } {
  const errors: ImportUsernameError[] = [];
  const rows: ParsedUsernameImportRow[] = [];
  const seen = new Set<string>();

  const normalizedText = fileText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();

  if (!normalizedText) {
    return { rows, errors: [{ line: 1, reason: "empty file" }] };
  }

  const lines = normalizedText.split("\n");
  const header = splitCsvLine(lines[0]).map((value) => value.trim());
  console.log("Parsed CSV header:", header);
  const usernameIndex = header.findIndex((value) => value === "username");
  console.log("Username column index:", usernameIndex);
  const passwordIndex = header.findIndex((value) => value === "password");
  console.log("Password column index:", passwordIndex);

  if (usernameIndex === -1 || passwordIndex === -1) {
    console.log("CSV header is missing required columns.");
    return {
      rows,
      errors: [{ line: 1, reason: 'missing required headers "username" and "password"' }],
    };
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      continue;
    }

    const cells = splitCsvLine(line);
    const rawUsername = cells[usernameIndex] ?? "";
    const rawPassword = cells[passwordIndex].trim() ?? "";
    const username = normalizeUsername(rawUsername);

    console.log(`Username: "${rawUsername}" -> "${username}", Password: "${rawPassword}"`);

    if (!username || rawPassword.length === 0) {
      errors.push({ line: lineIndex + 1, reason: "missing username or password" });
      continue;
    }

    if (seen.has(username)) {
      errors.push({ line: lineIndex + 1, reason: "duplicate username in file" });
      continue;
    }

    seen.add(username);
    rows.push({ username, password: rawPassword });
  }

  console.log(`Rows: ${rows}, Errors: ${errors}`);
  return { rows, errors };
}

function parseSingleUsername(
  rawUsername: string,
  rawPassword: string
): { rows: ParsedUsernameImportRow[]; errors: ImportUsernameError[] } {
  const username = normalizeUsername(rawUsername);

  if (!username || rawPassword.length === 0) {
    return { rows: [], errors: [{ line: 1, reason: "missing username or password" }] };
  }

  return { rows: [{ username, password: rawPassword }], errors: [] };
}

function isDuplicateAuthUserError(error: unknown) {
  const authError = error as { message?: string; status?: number; code?: string } | null;

  return Boolean(
    authError &&
      (authError.status === 422 ||
        authError.code === "user_already_exists" ||
        /already (?:registered|exists)/i.test(authError.message ?? ""))
  );
}

function isUniqueConstraintError(error: unknown) {
  const prismaError = error as { code?: string; message?: string } | null;
  return prismaError?.code === "P2002" || /unique constraint/i.test(prismaError?.message ?? "");
}

async function deleteAuthUser(userId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }
}

async function createAuthUser(username: string, password: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const email = buildFakeEmailForUsername(username);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    if (isDuplicateAuthUserError(error)) {
      // return { alreadyExisted: true, userId: null };
      throw new Error(`User "${username}" already exists in auth`);
    }

    throw error;
  }

  if (!data.user?.id) {
    throw new Error(`Supabase did not return a user id for ${email}.`);
  }

  return { alreadyExisted: false, userId: data.user.id };
}

async function importUsernames(rows: ParsedUsernameImportRow[]) {
  const importedUsernames: string[] = [];
  let skipped = 0;
  const errors: ImportUsernameError[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const line = index + 1;

    const existing = await prisma.approvedUsername.findUnique({
      where: { username: row.username },
      select: { username: true },
    });

    if (existing) {
      skipped += 1;
      errors.push({
        line,
        reason: "username already exists",
      });
      continue;
    }

    let authUserId: string | null = null;
    let authUserAlreadyExisted = false;

    try {
      const authUser = await createAuthUser(row.username, row.password);
      authUserId = authUser.userId;
      authUserAlreadyExisted = authUser.alreadyExisted;

      // await prisma.approvedUsername.create({
      //   data: { username: row.username },
      // });
      if (!authUserId) {
        throw new Error("Missing auth user id");
      }

      await prisma.approvedUsername.create({
        data: {
          username: row.username,
          player: {
            create: {
              id: authUserId,
              // username: row.username,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("already exists in auth")
      ) {
        skipped += 1;
        errors.push({
          line,
          reason: "username already exists",
        });
        continue;
      }
      if (authUserId && !authUserAlreadyExisted) {
        try {
          await deleteAuthUser(authUserId);
        } catch {
          // Ignore cleanup errors and surface the original failure.
        }
      }

      if (isUniqueConstraintError(error)) {
        skipped += 1;
        errors.push({
          line,
          reason: error instanceof Error ? error.message : "failed to import username",
        });
        continue;
      }

      errors.push({
        line,
        reason: error instanceof Error ? error.message : "failed to import username",
      });
      continue;
    }

    importedUsernames.push(row.username);
  }

  return { importedUsernames, skipped, errors };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mode: "json" });
  if (!auth.ok) {
    return auth.response;
  }

  const formData = await request.formData();
  const uploadedFile = formData.get("file") ?? formData.get("csv");
  const manualUsername = String(formData.get("username") ?? "");
  const manualPassword = String(formData.get("password") ?? "");

  const hasManualUsername = manualUsername.trim().length > 0;
  const hasFileUpload = uploadedFile instanceof File;

  if (!hasManualUsername && !hasFileUpload) {
    const response: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [{ line: 0, reason: "missing username and password or CSV file" }],
    };
    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(new URL("/admin/users?error=missing_input", request.url), { status: 303 });
  }

  let parsed: { rows: ParsedUsernameImportRow[]; errors: ImportUsernameError[] };

  if (hasManualUsername) {
    parsed = parseSingleUsername(manualUsername, manualPassword);
  } else if (hasFileUpload) {
    const fileText = await uploadedFile.text();
    parsed = parseCsv(fileText);
    console.log("Parsed CSV:", parsed);
  } else {
    parsed = { rows: [], errors: [{ line: 0, reason: "missing input" }] };
  }

  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    console.log("Parsed CSV has errors and no valid rows to import.");
    const response: ImportResult = { imported: 0, skipped: 0, errors: parsed.errors };
    return wantsJson(request)
      ? NextResponse.json(response, { status: 400 })
      : NextResponse.redirect(
          new URL(
            hasManualUsername ? "/admin/users?error=invalid_username" : "/admin/users?error=invalid_csv",
            request.url
          ),
          { status: 303 }
        );
  }

  const { importedUsernames, skipped, errors } = await importUsernames(parsed.rows);

  const response: ImportResult = {
    imported: importedUsernames.length,
    skipped: skipped + parsed.errors.length,
    errors: [...parsed.errors, ...errors],
  };

  if (wantsJson(request)) {
    return NextResponse.json(response);
  }

  const redirectUrl = new URL("/admin/users", request.url);
  redirectUrl.searchParams.set("imported", String(response.imported));
  redirectUrl.searchParams.set("skipped", String(response.skipped));
  if (response.errors.length > 0) {
    const fullErrorMessage = response.errors.map((e) => `Line ${e.line}: ${e.reason}`).join("; ");
    redirectUrl.searchParams.set("error", `[one indexed] ${fullErrorMessage}`);
  } else {
    redirectUrl.searchParams.set("message", "import_success");
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}