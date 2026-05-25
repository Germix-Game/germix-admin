# Admin Dashboard PRD

## 1. Executive summary

The Admin Dashboard is a lightweight, server-side-first admin surface for the Germix research team. It enables whitelist management (approved usernames), runtime configuration (date gates and unlocks), deterministic CSV exports for analysis, and optional read-only summary metrics. The dashboard is strictly for trusted staff and is protected by a shared bearer token for v1.

## 2. Problem Statement

The main Germix app already handles player signup, login, gameplay, and posttests. What is still missing is a reliable admin surface for:

- importing approved usernames from the pre-test workflow,
- updating release and posttest configuration,
- exporting study data in a format suitable for analysis,
- and, if time allows, reviewing summary metrics without querying the database manually.

Today this work is partly described in the game requirements and partly in an older admin note that still uses outdated terms like `student_id`. This PRD defines the current admin dashboard project in the same vocabulary and data model used by the live app.

## 3. Goals (measurable)

- Import approved usernames: admins can upload a CSV and import/upsert without duplicates within 2 minutes.
- Config management: research staff can change date-gated keys and verify changes in-app without developer intervention.
- Data export: research team can download a production-ready CSV (sessions, scores, posttests) matching the analysis schema.
- Safety: admin routes fail-closed (403 on missing/invalid token) and never expose stack traces or secrets.

Success criteria (acceptance):
- CSV import completes idempotently and reports counts for imported/skipped rows.
- Config PUT returns the stored key/value and is immediately reflected in behavior gated by that key.
- Export CSV schema is documented and consumes without manual transformation by analysts.

## 4. Non-Goals (v1)

- No player-facing changes or marketing pages.
- No multi-user RBAC (v1 uses a single shared bearer token). Add RBAC in a later iteration.
- No editing of historical gameplay records through the UI (read-only exports only).
- No content-authoring UI for game assets (seed/import scripts remain the source of truth).

## 5. Users

Primary users are research staff and project administrators who need to:

- import approved usernames,
- adjust time-based config flags,
- export data for statistics or manuscript work,
- and monitor basic operational health.

## 6. Data model & export schema

Operate against the canonical Germix schema. Key tables used by the admin surface:

- `ApprovedUsername` — whitelist used during signup (unique `username`).
- `Player` — created after signup; references Supabase auth UID.
- `Config` — key/value runtime flags (dates, unlocks).
- `GameSession`, `Score`, `SessionMicrobe`, `PostTest` — gameplay and posttest data.

Export CSV columns (stable canonical shape):
- `session_id, player_id, username, started_at, ended_at, round_index, microbe_id, microbe_name, cards_opened, correct, round_score, session_score, posttest_id, posttest_score`

If downstream needs change, add a versioned export param `?v=2` instead of mutating v1 shape.

## 7. Authentication and access

For v1 the dashboard uses a shared bearer token as an API guard:

- Header: `Authorization: Bearer <ADMIN_SECRET>`
- Missing/invalid token: `403` (use consistent error envelope)

Security rules:

- Do not expose timing-based hints (constant-time compare recommended) or stack traces in errors.
- Admin endpoints must be server-only (Next.js route handlers, no client-side secrets persisted).
- Log admin requests and exports (audit trail) with admin client IP and timestamp; redact token values.

## 8. Functional scope (API surface)

Core endpoints (examples):

- `POST /api/admin/import-usernames` — multipart CSV upload. Validates `username` column, upserts, returns `{ imported, skipped, errors: [] }`.
- `GET /api/admin/export?format=csv&v=1` — stream CSV with canonical columns; include `started_at`/`ended_at` timestamps.
- `PUT /api/admin/config/:key` — body `{ value }` (string|number|ISODate). Upserts and returns `{ key, value, updatedAt }`.
- `GET /api/admin/dashboard` — optional read-only aggregates (cached or precomputed for performance).

Import behavior:

- Idempotent upsert by `username` (preserve case).
- Validate rows: skip blanks, dedupe in-memory before DB upsert, report malformed rows with line numbers.

Export behavior:

- Deterministic column ordering and CSV header row.
- Support streaming to avoid memory pressure for large exports.
- Audit log: record who exported (IP + timestamp) and store anonymized summary (no PII leak beyond usernames).

Config behavior:

- Strongly encourage ISO-8601 strings for date keys; UI will parse and show human-readable date/time.
- Changing config should produce a short success toast and show the updated value on the page.

## 9. UX requirements

- Minimal, task-focused layout: header (env + token status), import panel, config editor, export controls, optional analytics panel.
- Provide clear success and error feedback; show row-level errors for imports.
- Export UI: allow selecting date ranges, export format, and preview first 10 rows.
- Config UI: inline editing with validation and `Confirm` step for destructive keys (e.g., unlock dates).

Accessibility:
- Keyboard-accessible file upload, controls, and table navigation.
- Color/contrast and ARIA labels for all interactive elements.

## 10. Technical requirements

- Implement as Next.js route handlers (server-only) + a minimal React admin page.
- TypeScript + Prisma (reuse existing schema). Keep DB migrations backward compatible with exports.
- Stream CSV generation on the server; paginate and use async iterators for memory safety.
- Tests: unit for import parsing/upsert logic; integration test for export shape and config PUT; security tests for token rejection.

Monitoring:
- Track export counts, import errors, and config changes in Sentry or similar (no secrets in logs).

## 11. Security requirements

- Gate routes with bearer token; store token in server environment only.
- Use constant-time token comparison and generic error messages.
- Audit log config changes and exports (timestamp, IP, action); rotate logs per policy.
- Treat export data as sensitive — ensure TLS, and limit pre-signed link lifetimes if implemented.

## 12. Success metrics

- Import idempotency: repeated CSV uploads do not create duplicates.
- Time-to-change: research staff can change a config key and confirm the change within 3 minutes.
- Export usability: first-time analyst can ingest exported CSV into analysis tools without transformations.
- Security: 100% of admin endpoints return `403` for invalid/missing token in automated tests.

## 13. Suggested deliverables

- `src/app/api/admin/import-usernames/route.ts` (CSV parsing, validation, upsert)
- `src/app/api/admin/export/route.ts` (streaming CSV, canonical shape)
- `src/app/api/admin/config/[key]/route.ts` (upsert, validation)
- `src/app/api/admin/dashboard/route.ts` (optional cached aggregates)
- `app/admin/*` pages (minimal React UI for tasks above)
- Tests and CI assertions for security and data shape

## 14. Definition of Done (concrete)

- Import: upload CSV → response `{ imported, skipped, errors }` and DB reflects upserts.
- Config: `PUT /api/admin/config/posttest_unlock` with ISO date → returns `{ key, value }` and UI shows updated value.
- Export: `GET /api/admin/export?format=csv` streams CSV with header row matching documented columns.
- Security: automated tests assert `403` for missing/invalid `Authorization` header.

## 15. References

- [docs/germix_game_requirements.md](germix_game_requirements.md)
- [docs/auth-flow.md](auth-flow.md)
- [docs/admin_dashboard_req.md](admin_dashboard_req.md)
