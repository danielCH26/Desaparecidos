# migration-filters

## Purpose

Add two new text columns to the `reports` table: `department` and `municipality`. Both are nullable for backward compat with existing reports (which were created before this migration).

## Requirements

- File: `supabase/migrations/0004_filters.sql`
- `ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS department text, ADD COLUMN IF NOT EXISTS municipality text;`
- Both columns nullable (no NOT NULL constraint) — existing pre-migration reports have NULL values
- No CHECK constraints (validation is application-side in `createReportAction` per the create-report-action spec)
- No new indexes (full DIVIPOLA list is ~1,122 municipalities; indexed `eq` queries on this size are fine for MVP)
- Migration is idempotent: `ADD COLUMN IF NOT EXISTS` allows re-running

## How to apply

The user must paste the SQL into the Supabase dashboard SQL Editor and click Run (same workflow as Phase 1's `0001_init.sql` and Phase 5's `0002_register_fields.sql`).

## Scenarios

- GIVEN the migration has been applied to the live Supabase project
- WHEN the user inspects the `reports` table via the dashboard
- THEN the columns `department` and `municipality` are present
- AND both are of type `text`
- AND both are nullable
- AND pre-existing reports (created before migration) have NULL in both columns

- GIVEN the migration is re-run (already applied)
- WHEN the SQL is executed again
- THEN no error is raised (idempotent via `IF NOT EXISTS`)

## Hard rules
- DO NOT use `NOT NULL` constraints (would break pre-migration reports)
- DO NOT use CHECK constraints (validation is application-side)
- DO NOT drop or rename existing columns
- DO NOT introduce a separate `departamentos` or `municipios` table
