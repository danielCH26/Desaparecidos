# Proposal: Phase 1 — Supabase schema + RLS

## Intent

Phase 0 shipped the scaffold; the app has no database. Every later phase blocks until Postgres schema, RLS, auth trigger, and storage exist. MVP ships in hours; we cannot retrofit identity or access control later.

## Scope

**In**: one migration `supabase/migrations/0001_init.sql`; 4 tables (`profiles`, `reports`, `comments`, `saves`); auth trigger on `auth.users` → `profiles` from JWT metadata; storage bucket `report-photos` + policies; RLS on every table and storage object; apply via `supabase db push`; verify `db diff` clean + manual smoke test.

**Out**: env wiring (Phase 0), client code (Phase 2+), Auth provider config (Phase 2), seed data.

## Capabilities

### New Capabilities
- `database-schema`: Four-table model, UUID PKs/FKs, types per `plan.md` § Data model
- `row-level-security`: Deny-by-default RLS per `plan.md` § Data model
- `auth-trigger`: `AFTER INSERT ON auth.users` → `handle_new_user()` reads `raw_user_meta_data->>'cedula'`
- `photo-storage`: `report-photos` bucket, public read, authenticated write

### Modified Capabilities
None

## Approach

Single migration `0001_init.sql` holds tables, indexes, trigger, RLS, and storage. Locked by `plan.md` § Data model.

**UUID-everywhere is a design pillar.** Every PK `uuid DEFAULT gen_random_uuid()` (needs `pgcrypto`). Every FK `uuid` with `REFERENCES` and `ON DELETE`. RLS predicates compare UUIDs to `auth.uid()` — never text/cedula to UUID. The only cedula→user mapping is login (`{cedula}@desaparecidos.local` → `auth.users.id`); afterward `auth.uid()` (UUID) is canonical and every query identifies rows by UUID. Helpers like `is_publisher(_report_id uuid, _uid uuid)` accept UUIDs only.

**RLS policies** per `plan.md`: `profiles` owner SELECT/UPDATE, trigger-only INSERT; `reports` public SELECT, INSERT `published_by IS NULL OR = auth.uid()`, owner UPDATE/DELETE; `comments` public SELECT, INSERT `author_id IS NULL OR = auth.uid()`, owner UPDATE/DELETE; `saves` SELECT/INSERT/DELETE where `profile_id = auth.uid()`.

**Auth trigger**: `AFTER INSERT ON auth.users` → `handle_new_user()` inserts `profiles (id, cedula)`.

**Storage bucket**: `storage.create_bucket('report-photos', public := true)`. Public SELECT; INSERT/UPDATE/DELETE scoped to authenticated role with object-owner check. Anonymous uploads blocked at policy level.

## Risks

- **Missing FK `REFERENCES`/`ON DELETE`** — small migration; smoke test verifies orphan rejection.
- **RLS predicate compares text/cedula to UUID** — review focused on predicates; all comparisons UUID-to-UUID.
- **`gen_random_uuid()` fails — `pgcrypto` off** — `CREATE EXTENSION IF NOT EXISTS pgcrypto;` at top.
- **Free-tier quota overrun (500 MB DB / 1 GB)** — Q4 default 5 MB photo cap keeps storage well under 1 GB.
- **Anonymous photo upload enabled when intent is auth-only** — default authenticated INSERT; flagged as open question.

## Open Questions

**Anonymous photo upload.** Does anonymous publishing require authenticated photo upload? (a) auth for any photo upload → anonymous reports cannot attach a photo; (b) auth for the report; photo upload uses same session; (c) allow anonymous photo uploads, accept abuse risk.

**Default if no answer: (a)** — anonymous reports publish without a photo in MVP. Conservative default matching the storage policy. User can override before apply.

## Rollback Plan

Drop tables, function, trigger, bucket, and bucket objects. Phase 1 is the first applied migration — no prior state. Uses `CREATE … IF NOT EXISTS` so a failed mid-migration retries cleanly. Full SQL in design phase.

## Success Criteria

- `0001_init.sql` applies cleanly; `db diff` clean
- 4 tables with UUID PKs + FKs per `plan.md`; RLS on every table
- Auth trigger creates `profiles` on `auth.users` INSERT; `report-photos` bucket exists
- Smoke: anonymous `reports` INSERT succeeds with `published_by = NULL`, rejected with `published_by = <uuid>`
- Smoke: anonymous `reports` SELECT returns rows; anonymous `saves` INSERT rejected
- Smoke: anonymous `storage.objects` INSERT for `report-photos` rejected
