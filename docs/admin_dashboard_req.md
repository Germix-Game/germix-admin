# Admin Dashboard Requirements

This document captures the current admin-facing backend requirements for Germix. The dashboard is protected by an `ADMIN_SECRET` bearer token and is used by the research team for whitelist management, configuration, and data export.

## Current Scope

- `POST /api/admin/import-usernames` — multipart CSV upload with a `username` column; idempotent upsert into `ApprovedUsername`; return `{ imported: N, skipped: M }`.
- `GET /api/admin/export` — query param `?format=csv` (default); CSV export of sessions, round scores, and posttests joined for analysis.
- `PUT /api/admin/config/:key` — accept `{ value }`; upsert a `Config` row for the given key; used for posttest window dates and mode unlock dates.
- `GET /api/admin/dashboard` — optional aggregate stats: active players, games played per day, average time per microbe, per-microbe accuracy, and posttest completion count.
- All admin routes return `403` if `Authorization: Bearer <ADMIN_SECRET>` is missing or incorrect.

## Files

- `src/app/api/admin/import-usernames/route.ts`
- `src/app/api/admin/export/route.ts`
- `src/app/api/admin/config/[key]/route.ts`
- `src/app/api/admin/dashboard/route.ts` (optional)

## Definition of Done

- [ ] CSV import upserts usernames idempotently and returns correct counts.
- [ ] CSV export includes sessions, scores, and posttests in valid CSV format.
- [ ] `PUT /api/admin/config/:key` upserts values correctly, including posttest date keys.
- [ ] All admin routes return `403` on missing or incorrect bearer token.
- [ ] No stack traces or sensitive data leak in error responses.
- [ ] No TypeScript errors.

## References

- [docs/germix_game_requirements.md](germix_game_requirements.md) Section 4.3 (Whitelist import)
- [docs/germix_game_requirements.md](germix_game_requirements.md) Section 12.4 (Route table)
- [docs/germix_game_requirements.md](germix_game_requirements.md) Section 13 (Admin dashboard)
- [docs/auth-flow.md](auth-flow.md) for the current whitelist/auth model.

# Seed Script
## Overview
Build the seed script that bulk-imports microbes and clue cards from a CSV + Supabase Storage bucket. This is required before any gameplay can be tested end-to-end.

## Scope
- `prisma/seed.ts` reads a CSV where each row maps to one `ClueCard` (columns: `microbe_name`, `short_name`, `game_mode`, `gram_type`, `tags`, `star_rating`, `category`, `label`, `image_filename`)
- Parse PNG filenames following Section 20 naming convention: `{microbe-name-kebab-case}-{category-slug}-{two-digit-index}.png`
- Construct Supabase Storage CDN URL from `NEXT_PUBLIC_SUPABASE_URL` + bucket path `cards/{gameMode}/{filename}`
- Upsert `Microbe` rows (unique on `name`) and `ClueCard` rows
- Idempotent: re-running seed produces no duplicate rows
- Log import summary: microbes upserted, cards upserted, skipped

## Files
- `prisma/seed.ts`
- `prisma/seed-data/` — sample CSV for local testing

## Definition of Done
- [ ] Script parses CSV and maps all columns to schema fields correctly
- [ ] PNG filenames parsed per Section 20 naming convention
- [ ] Supabase Storage CDN URLs constructed and stored in `ClueCard.imageUrl`
- [ ] `Microbe` and `ClueCard` rows upserted (no duplicates on re-run)
- [ ] Script logs import counts on completion
- [ ] Tested with sample CSV covering at least 3 microbes × 5 cards each
- [ ] `prisma db seed` command runs without errors
- [ ] No TypeScript errors; PR reviewed and merged to `dev`

## References
- Requirements Section 2.3 (Card asset storage)
- Requirements Section 20 (Card asset naming convention)

