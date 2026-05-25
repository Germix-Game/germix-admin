# Admin Dashboard Requirements

This document translates the PRD into prioritized work items, API contracts, and acceptance tests. The admin surface uses a shared bearer token for v1.

## Priority backlog (sprint-sized)

1. Import usernames (critical)
	- `POST /api/admin/import-usernames`
	- Acceptance: idempotent upsert, returns `{ imported, skipped, errors }`, supports CSV with header `username`.
2. Export CSV (critical)
	- `GET /api/admin/export?format=csv&v=1&from=&to=`
	- Acceptance: streams canonical CSV columns; preview available in UI; audit log entry created.
3. Config key upsert (high)
	- `PUT /api/admin/config/:key` body `{ value }`
	- Acceptance: writes to `Config`, returns `{ key, value, updatedAt }`, UI reflects change.
4. Basic dashboard aggregates (medium)
	- `GET /api/admin/dashboard` cached view (1-min TTL)
	- Acceptance: returns `activePlayers`, `gamesPerDay`, `avgTimePerMicrobe`.
5. Tests and CI (critical)
	- Unit tests for import parser, integration tests for export shape, security tests for token rejection.

## API contracts (examples)

POST /api/admin/import-usernames
- Request: multipart/form-data file=`approved.csv`
- Response 200:
```json
{ "imported": 123, "skipped": 2, "errors": [{ "line": 42, "reason": "missing username" }] }
```

GET /api/admin/export?format=csv&v=1&from=2026-05-01&to=2026-05-24
- Response: `text/csv` stream with header row matching PRD export columns.

PUT /api/admin/config/:key
- Request body: `{ "value": "2026-08-01T00:00:00Z" }`
- Response 200:
```json
{ "key": "posttest_unlock", "value": "2026-08-01T00:00:00Z", "updatedAt": "2026-05-25T12:00:00Z" }
```

## Validation & error model

- Follow existing error envelope: `{ error: { code, message, details[] } }`.
- Import: report per-row errors, reject file if header missing.
- Export: return 400 for invalid date range, 403 for missing/invalid token.

## Acceptance tests (concrete)

- Import: upload a CSV with duplicates and malformed rows → assert DB has single row per username and response shows counts.
- Export: request CSV for small time window → assert header row equals documented columns and sample row values match DB.
- Config: PUT an ISO date → assert `Config` row updated and API returns updatedAt.
- Security: call each admin endpoint without `Authorization` → assert `403`.

## Seed script (operational)

- `prisma/seed.ts` reads `prisma/seed-data/*.csv`, upserts `Microbe` and `ClueCard` rows, constructs `ClueCard.imageUrl` from `NEXT_PUBLIC_SUPABASE_URL`.
- Acceptance: idempotent; logs counts; sample CSV included in `prisma/seed-data/` for tests.

## Files to add / update

- `src/app/api/admin/import-usernames/route.ts`
- `src/app/api/admin/export/route.ts`
- `src/app/api/admin/config/[key]/route.ts`
- `src/app/admin/page.tsx` (minimal UI)
- `prisma/seed.ts` and sample CSV in `prisma/seed-data/`

## Notes

- Keep exports versioned. Add `v` query parameter when changing CSV shape.
- For large datasets prefer streaming via an async generator and `res.write`.

