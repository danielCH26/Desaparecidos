# row-level-security Specification

## Purpose

Defines the Row Level Security policies that protect every table in the `public` schema and every object in the `report-photos` storage bucket. The model is deny-by-default: RLS is enabled on every table, and the `anon` role receives only the explicit allow paths. **Every policy comparison uses UUID-only operands** against `auth.uid()` — never text/cedula.

## Requirements

### Requirement: RLS Enabled Everywhere

The migration MUST enable Row Level Security on every table created by Phase 1 (`profiles`, `reports`, `comments`, `saves`) and MUST leave RLS enabled on `storage.objects` (default).

For each of `profiles`, `reports`, `comments`, `saves`, the migration MUST execute `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`.

#### Scenario: RLS is enabled on every public table

- GIVEN the migration has been applied
- WHEN `pg_class.relrowsecurity` is queried for `profiles`, `reports`, `comments`, `saves`
- THEN the result MUST be `true` for every table.

### Requirement: profiles Policies

The `profiles` table MUST allow:

- `SELECT` only when `id = auth.uid()`.
- `UPDATE` only when `id = auth.uid()`.
- `INSERT` MUST NOT be permitted via RLS for any role (the row is created exclusively by the `handle_new_user()` trigger, which runs as `security definer`).
- `DELETE` MUST NOT be permitted via RLS.

#### Scenario: owner can read own profile

- GIVEN the migration has been applied and an authenticated session with `auth.uid() = U`
- WHEN the session runs `SELECT * FROM profiles WHERE id = U`
- THEN one row is returned.

#### Scenario: anonymous session cannot read any profile

- GIVEN the migration has been applied and an anonymous session (`auth.uid() IS NULL`)
- WHEN the session runs `SELECT * FROM profiles`
- THEN zero rows are returned.

#### Scenario: anonymous session cannot insert into profiles

- GIVEN an anonymous session
- WHEN the session attempts `INSERT INTO profiles (id, cedula) VALUES (gen_random_uuid(), '12345678')`
- THEN the insert is rejected by RLS (returns zero rows affected).

#### Scenario: direct client insert to profiles from an authenticated user is rejected

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session attempts `INSERT INTO profiles (id, cedula) VALUES (gen_random_uuid(), '99999999')`
- THEN the insert is rejected by RLS; only the trigger creates profile rows.

### Requirement: reports Policies

The `reports` table MUST allow:

- `SELECT` for both the `anon` and `authenticated` roles (public read).
- `INSERT` when `(published_by IS NULL) OR (published_by = auth.uid())`. Both `anon` and `authenticated` sessions can insert; `anon` only with `published_by = NULL`.
- `UPDATE` only when the row's publisher is the calling user: `public.is_publisher(id, auth.uid())` returns true.
- `DELETE` only when `public.is_publisher(id, auth.uid())` returns true.

#### Scenario: anonymous report insert with NULL published_by succeeds

- GIVEN an anonymous session
- WHEN the session inserts a `reports` row with `published_by = NULL`
- THEN the insert succeeds.

#### Scenario: anonymous report insert with a UUID published_by is rejected

- GIVEN an anonymous session
- WHEN the session attempts to insert a `reports` row with `published_by = '00000000-0000-0000-0000-000000000000'`
- THEN the insert is rejected by RLS because `published_by` is not NULL and `auth.uid()` is NULL.

#### Scenario: authenticated user inserting with their own UUID succeeds

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session inserts a `reports` row with `published_by = U`
- THEN the insert succeeds.

#### Scenario: authenticated user inserting with another user's UUID is rejected

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session inserts a `reports` row with `published_by = V` where `V != U`
- THEN the insert is rejected by RLS.

#### Scenario: anonymous SELECT returns all reports

- GIVEN several `reports` rows exist (some anonymous, some identified)
- WHEN an anonymous session runs `SELECT id FROM reports`
- THEN every row is returned.

#### Scenario: only the publisher can update their report

- GIVEN report `R` was published by user `U`
- WHEN an authenticated session with `auth.uid() = U` runs `UPDATE reports SET person_name = 'x' WHERE id = R`
- THEN the update affects one row.
- WHEN an authenticated session with `auth.uid() = V` (different user) runs the same update
- THEN the update affects zero rows (RLS denies).

#### Scenario: only the publisher can delete their report

- GIVEN report `R` was published by user `U`
- WHEN an authenticated session with `auth.uid() = V != U` runs `DELETE FROM reports WHERE id = R`
- THEN zero rows are deleted.

### Requirement: comments Policies

The `comments` table MUST allow:

- `SELECT` for both `anon` and `authenticated` roles (public read).
- `INSERT` when `(author_id IS NULL) OR (author_id = auth.uid())`. `anon` inserts only with `author_id = NULL`.
- `UPDATE` only when `public.is_comment_author(id, auth.uid())` returns true.
- `DELETE` only when `public.is_comment_author(id, auth.uid())` returns true.

#### Scenario: anonymous comment insert with NULL author_id succeeds

- GIVEN an anonymous session and report `R` exists
- WHEN the session inserts a `comments` row with `report_id = R`, `author_id = NULL`, `body = 'foo'`
- THEN the insert succeeds.

#### Scenario: anonymous comment insert with a UUID author_id is rejected

- GIVEN an anonymous session
- WHEN the session attempts to insert with `author_id = '00000000-0000-0000-0000-000000000000'`
- THEN the insert is rejected by RLS.

#### Scenario: non-author cannot update or delete a comment

- GIVEN comment `C` was authored by user `U`
- WHEN a session with `auth.uid() = V != U` runs `UPDATE comments SET body = 'x' WHERE id = C` and `DELETE FROM comments WHERE id = C`
- THEN both statements affect zero rows.

### Requirement: saves Policies

The `saves` table MUST allow:

- `SELECT`, `INSERT`, `DELETE` only when `profile_id = auth.uid()`.
- `UPDATE` MUST NOT be permitted (a save is immutable; users delete and re-create to change).

#### Scenario: anonymous save insert is rejected

- GIVEN an anonymous session
- WHEN the session attempts `INSERT INTO saves (profile_id, report_id) VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001')`
- THEN the insert is rejected by RLS (zero rows affected).

#### Scenario: a user can save a report under their own UUID

- GIVEN an authenticated session with `auth.uid() = U` and report `R` exists
- WHEN the session inserts `(profile_id = U, report_id = R)` into `saves`
- THEN the insert succeeds.

#### Scenario: a user cannot save under another user's UUID

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session attempts to insert with `profile_id = V` where `V != U`
- THEN the insert is rejected by RLS.

#### Scenario: a user can read only their own saves

- GIVEN users `U` and `V` each have saves
- WHEN the session with `auth.uid() = U` runs `SELECT * FROM saves`
- THEN only rows with `profile_id = U` are returned.

### Requirement: Helper Functions Accept UUIDs Only

Two SQL helper functions MUST be created in the `public` schema to keep RLS predicates UUID-typed and to centralize ownership checks:

- `public.is_publisher(_report_id uuid, _uid uuid) RETURNS boolean` — returns true when a `reports` row with `_report_id` exists and its `published_by` equals `_uid`.
- `public.is_comment_author(_comment_id uuid, _uid uuid) RETURNS boolean` — returns true when a `comments` row with `_comment_id` exists and its `author_id` equals `_uid`.

Both functions MUST be declared `SECURITY DEFINER` and `STABLE`, MUST take only `uuid` parameters (no `text`), and MUST be `GRANT EXECUTE`ed to the `authenticated` role.

#### Scenario: is_publisher returns true for owner, false for everyone else

- GIVEN report `R` exists with `published_by = U`
- WHEN `SELECT public.is_publisher(R, U)` runs
- THEN the result MUST be `true`.
- WHEN `SELECT public.is_publisher(R, V)` runs (with `V != U`)
- THEN the result MUST be `false`.

#### Scenario: is_publisher rejects non-UUID arguments at the type system

- GIVEN the migration has been applied
- WHEN `SELECT public.is_publisher('abc', 'def')` is run
- THEN the call fails with a type error (arguments are not UUIDs).

### Requirement: No Anonymous Storage Writes

The storage bucket policy MUST reject any `INSERT`, `UPDATE`, or `DELETE` on `storage.objects` for the `report-photos` bucket when `auth.role() != 'authenticated'`. SELECT MUST remain public for the bucket. See `photo-storage` spec for the bucket-level policy; this requirement enforces the cross-table consequence that anonymous reports never carry a photo.
