# Admin Dashboard PRD

## 1. Overview

The admin dashboard is a secure research tool for the Germix project. It gives the research team a way to manage the approved username whitelist, update runtime configuration, export study data, and optionally inspect high-level gameplay statistics.

This dashboard is separate from the player-facing game. It is only for trusted staff and is protected by a shared `ADMIN_SECRET` bearer token.

## 2. Problem Statement

The main Germix app already handles player signup, login, gameplay, and posttests. What is still missing is a reliable admin surface for:

- importing approved usernames from the pre-test workflow,
- updating release and posttest configuration,
- exporting study data in a format suitable for analysis,
- and, if time allows, reviewing summary metrics without querying the database manually.

Today this work is partly described in the game requirements and partly in an older admin note that still uses outdated terms like `student_id`. This PRD defines the current admin dashboard project in the same vocabulary and data model used by the live app.

## 3. Goals

- Give the research team a simple way to upload approved usernames into `ApprovedUsername`.
- Make it easy to update `Config` values such as posttest windows and mode unlock dates.
- Provide a clean CSV export of sessions, scores, and posttests for downstream analysis.
- Keep admin access lightweight and server-side only.
- Avoid duplicating player auth logic or introducing a second session system.

## 4. Non-Goals

- No player-facing signup or login UI.
- No replacement for Supabase Auth.
- No per-user admin accounts or role-based admin RBAC for v1.
- No direct editing of gameplay records.
- No content authoring tools for microbes, clue cards, or posttest questions.

## 5. Users

Primary users are research staff and project administrators who need to:

- import approved usernames,
- adjust time-based config flags,
- export data for statistics or manuscript work,
- and monitor basic operational health.

## 6. Data Model Context

The dashboard should operate against the existing Germix schema and terminology:

- `ApprovedUsername` is the whitelist source of truth for signup.
- `Player` is the authenticated student record created after signup.
- `Config` stores runtime keys such as posttest windows and mode unlock dates.
- `GameSession`, `Score`, `SessionMicrobe`, and `PostTest` are the primary gameplay and research tables.

The dashboard must not assume a separate `student_id` system. Username is the identifier used throughout the current app.

## 7. Authentication and Access

All admin endpoints are protected by `Authorization: Bearer <ADMIN_SECRET>`.

Requirements:

- Missing or incorrect token returns `403`.
- Admin routes must not depend on Supabase user sessions.
- Admin routes should not leak whether a token is close to correct.
- Error responses must never expose stack traces, SQL details, or secret values.

## 8. Functional Scope

### 8.1 Username Import

The dashboard supports bulk import of approved usernames from CSV.

Requirements:

- Accept multipart file upload.
- Parse a CSV with a `username` column.
- Upsert rows into `ApprovedUsername`.
- Be idempotent on re-upload.
- Return counts for imported and skipped rows.
- Skip blank rows and malformed entries.
- Preserve the case-sensitive username exactly as imported.

### 8.2 Data Export

The dashboard supports study-data export.

Requirements:

- `GET /api/admin/export` defaults to CSV.
- Export should join the tables needed for analysis, including sessions, scores, and posttests.
- Output should be directly usable by the research team without additional manual cleanup.
- The export should include stable column names and deterministic ordering where practical.

### 8.3 Config Management

The dashboard supports arbitrary config keys through `PUT /api/admin/config/:key`.

Requirements:

- Accept a JSON body with `{ value }`.
- Upsert by key.
- Support date-like values as strings for posttest windows and unlock dates.
- Support future keys without code changes when possible.
- Return the stored key/value after update.

### 8.4 Optional Summary Dashboard

If implemented, the dashboard should show high-level aggregate metrics:

- active players,
- games played per day,
- average time per microbe,
- per-microbe accuracy,
- and posttest completion count.

This view should be read-only and should not replace CSV export.

## 9. UX Requirements

The admin UI should be practical rather than decorative.

- Minimal navigation.
- Clear upload and export actions.
- Confirmation feedback after a successful import or config update.
- Error banners that explain what failed without exposing internals.
- Tables or cards for stats only if the optional dashboard is included.

Recommended layout:

- header with environment and auth status,
- import panel,
- config editor,
- export panel,
- optional analytics section.

## 10. Technical Requirements

- Build as a Next.js app consistent with the existing Germix stack.
- Use TypeScript and Prisma against the same Supabase-backed database.
- Reuse the current API error envelope style.
- Keep admin route handlers server-side only.
- Prefer CSV generation on the server.
- Keep import operations idempotent.

## 11. Security Requirements

- Gate every admin route with the shared bearer token.
- Avoid storing admin credentials in the browser.
- Reject malformed requests early.
- Do not echo secrets or raw database errors.
- Treat export data as sensitive research data.

## 12. Success Metrics

- Approved usernames can be imported without duplicates.
- Research staff can update config values without developer assistance.
- CSV export can be used directly for analysis.
- Admin requests fail closed when the token is absent or invalid.
- The dashboard remains usable even as the schema grows.

## 13. Suggested Deliverables

- `src/app/api/admin/import-usernames/route.ts`
- `src/app/api/admin/export/route.ts`
- `src/app/api/admin/config/[key]/route.ts`
- `src/app/api/admin/dashboard/route.ts` optional
- an admin UI page or pages that call those endpoints
- tests for token rejection, import idempotency, export shape, and config upsert behavior

## 14. Definition of Done

- CSV import upserts `ApprovedUsername` rows idempotently.
- CSV export includes the expected joined research data.
- Config updates work for the current posttest date keys.
- All admin routes return `403` on missing or incorrect bearer token.
- No stack traces or sensitive data appear in responses.
- TypeScript passes without errors.

## 15. References

- [docs/germix_game_requirements.md](germix_game_requirements.md)
- [docs/auth-flow.md](auth-flow.md)
- [docs/admin_dashboard_req.md](admin_dashboard_req.md)
