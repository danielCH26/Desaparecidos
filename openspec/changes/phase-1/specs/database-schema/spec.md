# database-schema Specification

## Purpose

Defines the four Postgres tables (`profiles`, `reports`, `comments`, `saves`) that form the entire persisted state of the application, plus the indexes, check constraints, and the UUID-everywhere typing rule that all downstream phases and RLS policies depend on.

This spec is the source of truth for column types, nullability, defaults, and referential integrity. **UUID-everywhere is a hard constraint**: every primary key is `uuid DEFAULT gen_random_uuid()`, every foreign key is `uuid REFERENCES ... ON DELETE ...`, and no text/cedula column is ever compared against a UUID anywhere in the schema.

## Requirements

### Requirement: UUID Generation Capability

The system MUST provide server-side UUID generation so every primary key is a UUID without application-side coordination.

- The migration MUST run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` before any table that uses `gen_random_uuid()`.
- Every primary key column MUST be declared `uuid PRIMARY KEY DEFAULT gen_random_uuid()`.

#### Scenario: gen_random_uuid() is callable

- GIVEN the migration `0001_init.sql` has been applied
- WHEN a SQL session executes `SELECT gen_random_uuid();`
- THEN the result MUST be a non-null `uuid` value.

### Requirement: profiles Table

The system MUST provide a `public.profiles` table that extends `auth.users` with profile-level fields owned by the authenticated user.

The table MUST be defined as:

```
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
                REFERENCES auth.users(id) ON DELETE CASCADE
cedula        text UNIQUE NOT NULL
display_name  text
real_phone    text
real_email    text
created_at    timestamptz NOT NULL DEFAULT now()
```

`cedula` MUST additionally enforce `CHECK (cedula ~ '^[0-9]{6,10}$')` (digits only, 6 to 10 characters).

#### Scenario: profile row can be inserted with required fields

- GIVEN the migration has been applied
- WHEN a row is inserted into `profiles (cedula)` with value `'12345678'`
- THEN the insert succeeds and the row's `id` is a UUID, `created_at` defaults to `now()`, and `display_name`/`real_phone`/`real_email` are NULL.

#### Scenario: profile row with non-digit cédula is rejected

- GIVEN the migration has been applied
- WHEN a row is inserted into `profiles (cedula)` with value `'AB123456'`
- THEN the insert fails with a CHECK constraint violation.

#### Scenario: profile row with too-short cédula is rejected

- GIVEN the migration has been applied
- WHEN a row is inserted into `profiles (cedula)` with value `'12345'`
- THEN the insert fails with a CHECK constraint violation.

#### Scenario: duplicate cédula is rejected

- GIVEN a `profiles` row with `cedula = '12345678'` already exists
- WHEN another row is inserted with `cedula = '12345678'`
- THEN the insert fails with a UNIQUE constraint violation.

### Requirement: reports Table

The system MUST provide a `public.reports` table that stores missing-person reports with optional publisher attribution.

The table MUST be defined as:

```
id                   uuid PRIMARY KEY DEFAULT gen_random_uuid()
person_name          text NOT NULL
person_age           int
person_photo_url     text                  -- NULLABLE: anonymous reports publish without a photo
last_known_lat       double precision NOT NULL
last_known_lng       double precision NOT NULL
last_known_address   text
last_seen_at         timestamptz
contact_phone        text NOT NULL
contact_email        text
status               text NOT NULL DEFAULT 'missing'
                       CHECK (status IN ('missing','found','resolved'))
published_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL
created_at           timestamptz NOT NULL DEFAULT now()
updated_at           timestamptz NOT NULL DEFAULT now()
```

`person_photo_url` MUST be nullable (no `NOT NULL` constraint). Per the user's locked decision, anonymous reports publish without a photo.

#### Scenario: anonymous report insert succeeds without a photo

- GIVEN the migration has been applied and no user is authenticated
- WHEN a row is inserted with `published_by = NULL`, `person_photo_url = NULL`, and all required text/lat/lng fields
- THEN the insert succeeds.

#### Scenario: identified report insert succeeds with a photo path

- GIVEN an authenticated user with UUID `auth.uid() = X`
- WHEN a row is inserted with `published_by = X`, `person_photo_url = 'X/photo.jpg'`, and required fields
- THEN the insert succeeds and `status` defaults to `'missing'`.

#### Scenario: report insert with foreign published_by referencing a missing profile is rejected

- GIVEN no `profiles` row with `id = '00000000-0000-0000-0000-000000000000'` exists
- WHEN a row is inserted into `reports` with `published_by = '00000000-0000-0000-0000-000000000000'`
- THEN the insert fails with a foreign-key violation.

#### Scenario: report status defaults to missing

- GIVEN the migration has been applied
- WHEN a row is inserted into `reports` without specifying `status`
- THEN the row's `status` equals `'missing'`.

#### Scenario: report with disallowed status is rejected

- GIVEN the migration has been applied
- WHEN a row is inserted with `status = 'cancelled'`
- THEN the insert fails with a CHECK constraint violation.

### Requirement: comments Table

The system MUST provide a `public.comments` table that stores per-report comments with optional author attribution.

The table MUST be defined as:

```
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
report_id   uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE
author_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL
body        text NOT NULL
              CHECK (char_length(body) BETWEEN 1 AND 2000)
created_at  timestamptz NOT NULL DEFAULT now()
```

#### Scenario: anonymous comment insert succeeds

- GIVEN the migration has been applied and report `R` exists
- WHEN a row is inserted with `report_id = R`, `author_id = NULL`, `body = 'Lo vi en el parque'`
- THEN the insert succeeds.

#### Scenario: empty comment body is rejected

- GIVEN the migration has been applied and report `R` exists
- WHEN a row is inserted with `report_id = R`, `body = ''`
- THEN the insert fails with a CHECK constraint violation.

#### Scenario: comment on a missing report is rejected

- GIVEN no `reports` row with `id = '00000000-0000-0000-0000-000000000000'` exists
- WHEN a row is inserted with `report_id = '00000000-0000-0000-0000-000000000000'`
- THEN the insert fails with a foreign-key violation.

### Requirement: saves Table

The system MUST provide a `public.saves` table that stores per-user bookmarks of reports.

The table MUST be defined as:

```
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
report_id   uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE
created_at  timestamptz NOT NULL DEFAULT now()
UNIQUE (profile_id, report_id)
```

#### Scenario: save insert with new profile/report pair succeeds

- GIVEN profile `P` and report `R` exist and no save `(P, R)` exists yet
- WHEN a row is inserted into `saves` with `profile_id = P`, `report_id = R`
- THEN the insert succeeds.

#### Scenario: duplicate save is rejected

- GIVEN a `saves` row with `(profile_id = P, report_id = R)` already exists
- WHEN another row is inserted with the same `profile_id = P` and `report_id = R`
- THEN the insert fails with a UNIQUE constraint violation.

#### Scenario: save referencing missing report is rejected

- GIVEN profile `P` exists and no report `R` exists
- WHEN a row is inserted into `saves` with `profile_id = P`, `report_id = '00000000-0000-0000-0000-000000000000'`
- THEN the insert fails with a foreign-key violation.

### Requirement: Listing and Join Indexes

The system MUST provide indexes that support the application's primary query patterns.

- `reports(created_at DESC)` MUST exist for the `/reports` list ordering.
- `comments(report_id)` MUST exist for the detail-page join.
- `saves(profile_id)` MUST exist for the saved-list query.
- `profiles.cedula` UNIQUE index is implicit via the UNIQUE constraint.

#### Scenario: reports list query uses created_at index

- GIVEN the migration has been applied and several `reports` rows exist
- WHEN a query runs `SELECT * FROM reports ORDER BY created_at DESC LIMIT 20`
- THEN the planner MUST be able to use the `reports_created_at_idx` index (verifiable via `EXPLAIN`).

### Requirement: UUID-Everywhere Typing Invariant

The system MUST NOT introduce any non-UUID primary or foreign key column in any table created by this migration.

- All `*_id` columns that reference another row MUST be `uuid`.
- The `cedula` column is the only text identifier and MUST NOT be used as a foreign key target.

#### Scenario: no non-UUID *_id columns exist

- GIVEN the migration has been applied
- WHEN `information_schema.columns` is queried for every column ending in `_id` across `profiles`, `reports`, `comments`, `saves`
- THEN every returned `data_type` MUST be `'uuid'`.
