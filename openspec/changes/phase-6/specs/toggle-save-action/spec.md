# toggle-save-action

## Purpose

Server Action that idempotently toggles the save state for the current user on a report.

## Requirements

- File: `app/actions/saves.ts` with `'use server'`
- Exports: `toggleSaveAction(reportId: string, currentSaved: boolean): Promise<{ saved: boolean } | { error: string }>`
- The action MUST require authentication: `await createSupabaseServerClient()` then `supabase.auth.getUser()` — if no user, return `{ error: 'Iniciá sesión para guardar reportes' }`
- The action MUST validate `reportId` is a non-empty UUID (regex match) — if invalid, return `{ error: 'Identificador de reporte inválido' }`
- Verify the report exists: `SELECT id FROM reports WHERE id = $1 LIMIT 1` — if not found, return `{ error: 'El reporte ya no existe' }`
- Toggle semantics:
  - If `currentSaved=true`: DELETE the row from `saves` WHERE `report_id=$1 AND profile_id=auth.uid()` — return `{ saved: false }`
  - If `currentSaved=false`: INSERT into `saves` (report_id, profile_id) — return `{ saved: true }`
- The INSERT MUST handle the UNIQUE constraint race condition: catch Postgres error code `23505` and treat as "already saved" (return `{ saved: true }`)
- After successful DELETE, call `revalidatePath('/profile')` AND `revalidatePath('/report/' + reportId)`
- After successful INSERT, same two `revalidatePath` calls
- The action MUST NOT log sensitive data (e.g., the reportId is fine to log if needed for debugging, but the user's access_token never)
- Server-side authoritative — no client trust

## Scenarios

- GIVEN user is anonymous
- WHEN `toggleSaveAction(<uuid>, false)` is called
- THEN return `{ error: 'Iniciá sesión para guardar reportes' }`

- GIVEN user is authenticated with `auth.uid() = U`, `reportId = 'r1'` does NOT exist
- WHEN `toggleSaveAction('r1', false)` is called
- THEN return `{ error: 'El reporte ya no existe' }`

- GIVEN user U has NOT saved report R, R exists
- WHEN `toggleSaveAction(R, false)` is called
- THEN INSERT into saves (profile_id=U, report_id=R) succeeds
- AND return `{ saved: true }`
- AND revalidatePath called for /profile and /report/R

- GIVEN user U HAS saved report R
- WHEN `toggleSaveAction(R, true)` is called
- THEN DELETE from saves WHERE profile_id=U AND report_id=R succeeds
- AND return `{ saved: false }`

- GIVEN user U inserts save for R twice in rapid succession
- WHEN the second INSERT fires
- THEN Postgres raises UNIQUE_VIOLATION (23505)
- AND the action catches it and returns `{ saved: true }` (not an error)

## Hard rules
- DO NOT modify the saves table or its RLS
- DO NOT use the service_role key
- DO NOT log auth tokens or passwords
- DO NOT call `revalidatePath` on errors (only on success)
