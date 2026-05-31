# Auth Flow Handoff

This project uses Supabase Auth for player sessions and `ApprovedUsername` as the whitelist gate for self-registration. This file documents the frontend contract, server behavior, error codes, and admin import flow.

## Frontend -> API contracts

### Signup
POST `/api/auth/signup`

Request JSON:
```json
{ "username": "player01", "password": "secret123" }
```

Success:
- `201` `{ "id": "<playerId>", "username": "player01" }`

Errors (example envelope):
```json
{ "error": { "code": "username_not_whitelisted", "message": "Your username is not registered.", "details": [] } }
```

### Login
POST `/api/auth/login`

Request JSON:
```json
{ "username": "player01", "password": "secret123" }
```

Success: `200` with `{ id, username }` and Supabase session cookie set.

### Logout
POST `/api/auth/logout` — returns `204` on success.

## Error codes (canonical)

- `username_not_whitelisted` — attempted signup for username not in `ApprovedUsername`.
- `account_already_exists` — signup attempted for an already-registered username.
- `username_not_found` — login attempted for unknown username.
- `incorrect_password` — password mismatch.
- `validation_error` — request payload fails validation.

Always return the shared error envelope and avoid including stack traces or DB errors in `details`.

## Admin / import-related auth

Admin endpoints use the bearer token guard:
- Header: `Authorization: Bearer <ADMIN_SECRET>`
- Missing/invalid: `403` (generic error envelope)

Admin import flow (compact mermaid):

```mermaid
flowchart TD
  A[Admin uploads CSV] -->|POST| B[/api/admin/import-usernames]
  B --> C{Validate CSV}
  C -->|ok| D[Upsert ApprovedUsername rows]
  C -->|errors| E[Return errors with line numbers]
  D --> F[Return { imported, skipped, errors }]
```
```

## Frontend rules & invariants

- Username matching is case sensitive.
- After signup/login, rely on the Supabase session cookie — server-side routes read the Supabase session; frontend should not manage cookies manually.
- The frontend should display `error.message` from the server envelope inline; do not display `details` unless in admin debug mode.

## Environment variables (runtime)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Session & security notes

- Supabase manages session cookies; server-side `requireAuth()` should load `Player` by auth UID.
- For admin endpoints, keep `ADMIN_SECRET` out of any client bundle; only use it in server environment variables.
- Consider rotating `ADMIN_SECRET` and adding per-user admin accounts in v2 for auditability.
