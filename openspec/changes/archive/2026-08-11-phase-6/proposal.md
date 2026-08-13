# Proposal: phase-6 — Save/bookmark

## Intent

Phase 6 adds the **Save / bookmark** feature: logged-in users can save reports to their profile for later reference. Adds `<SaveButton>` on `/report/[id]` (auth-only) and a "Guardados" list on `/profile`. The save toggle is one server action that handles insert/delete idempotently.

## Context

- Phase 1 already has `saves (id uuid PK, profile_id uuid FK, report_id uuid FK, created_at, UNIQUE(profile_id, report_id))` with RLS: SELECT/INSERT/DELETE only by owner (`profile_id = auth.uid()`)
- Phase 2 has the auth flow and Server Action pattern in `app/actions/auth.ts`
- Phase 4 has the `/report/[id]` detail page
- Phase 5 has the comment thread; `/profile` currently shows display_name, real_email, real_phone editing

## Scope

**In**:
- `SaveButton` Client Component on `/report/[id]` (only visible if authenticated; toggles state)
- "Guardados" list on `/profile` (new section, lists saved reports with link to detail)
- `toggleSaveAction` Server Action (one endpoint, idempotent: insert if not exists, delete if exists, returns new state)
- `getSaveStatus` helper to know if the current user has saved the current report
- New migration `0003_saves_helper.sql` (optional) for a Postgres function `is_saved_by_current_user(report_id uuid) → boolean` — but RLS already exposes this via a join; not strictly required

**Out** (deferred or out of MVP per plan.md):
- Save count display on the report (e.g., "3 personas guardaron esto") — not in MVP
- Saved-list filtering/sort UI — list is `created_at DESC` only
- Save notifications ("X saved your report")
- Save sharing ("Look at this report I saved")
- Bulk save (multi-select)
- "Collections" / folders — flat list only

## Capabilities

### New
1. **`save-button-component`** — Client `components/ui/SaveButton.tsx`: shows "Guardar" or "Guardado" depending on state; click triggers `toggleSaveAction`; visible only when `isAuthed`; shows optimistic state during transition; 44 px touch target; Spanish copy.
2. **`toggle-save-action`** — Server Action `app/actions/saves.ts`: idempotent toggle. Reads `reportId`; resolves `auth.uid()`; checks if a row exists; inserts or deletes; calls `revalidatePath('/profile')` and `revalidatePath('/report/' + reportId)`.
3. **`saves-list-section`** — Server-rendered section on `/profile` (after the profile form): shows all reports the current user has saved, ordered by `saves.created_at DESC`; each row links to `/report/[id]`; shows report name, age, time since save; empty state: "No tenés reportes guardados todavía. Volvé a /reports y guardá los que te interesen."

### Modified
4. **`detail-page-update`** — `app/report/[id]/page.tsx`: mount `<SaveButton>` after the existing actions (or at the end of the contact section). Pass `reportId` and `isAuthed` and initial saved state.

## Approach

- **Auth-gated UI**: `<SaveButton>` only renders if `isAuthed=true`. For anonymous users, no button shows (they're reading, not saving).
- **Initial state**: the detail page Server Component queries `saves` table: `SELECT id FROM saves WHERE report_id = $1 AND profile_id = auth.uid() LIMIT 1`. If a row exists, `initialSaved = true`. Pass as prop to SaveButton.
- **Optimistic update**: SaveButton tracks local state; updates immediately on click; reverts on server error.
- **Toggle semantics**: `toggleSaveAction` does UPSERT semantics — if save exists, DELETE; if not, INSERT. Returns the new state.
- **No UNIQUE conflict on INSERT**: even with UNIQUE constraint, we check first; if race condition, catch unique_violation (code 23505) and treat as already-saved.
- **`/profile` integration**: existing page edits the form fields; new section below shows the saves list. Same Server Component fetches all data in parallel.

## Default decisions

1. **Initial state at render time**: server-fetched (so the page shows correct state on first paint, no client-side flash)
2. **Optimistic UI**: instant state flip, revert on error
3. **Save button placement**: at the end of the report detail, after contact info, as its own `<div>` with clear visual separation
4. **"Guardado" indicator**: filled bookmark icon when saved, outline when not (visual feedback) — but no icon library added, just text + bg color (saved = bg-blue-600, not = bg-white with border)
5. **Sort order**: `saves.created_at DESC` (most recently saved first)
6. **/profile tab separation**: "Guardados" is a section below the form, not a tab (MVP simplicity)
7. **Empty state for /profile Guardados**: just shows the empty message + link back to /reports

## Open questions

1. **Anonymous users see anything?**: Default: nothing. If anon visits /report/<id>, no SaveButton. If anon visits /profile, redirect to /login. Default: redirect.
2. **Save count visible on /report/[id>?**: Default: NO (defer — would require count(*) query and changes scope).
3. **Saved-list shows status of each report (missing/found)?**: Default: just show report name + time since save. The report's own status is in the report detail page.

## Persistence

- Engram `sdd/phase-6/proposal`
- OpenSpec `openspec/changes/phase-6/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT modify the `saves` table schema (Phase 1 has it)
- DO NOT modify RLS on `saves` (Phase 1 has it)
- DO NOT add save count on the report
- SaveButton is Client Component (uses useTransition, useState)
- /profile saves section is Server Component (no interactivity needed, just re-renders on revalidatePath)
- All Spanish copy
- 44 px touch targets
- No emoji

## Success criteria

- Anon user visits /report/<id>: no SaveButton visible
- Logged-in user visits /report/<id>: SaveButton shows "Guardar" or "Guardado" based on current state
- Click "Guardar" → server action inserts save → button changes to "Guardado" without page reload
- Click "Guardado" → server action deletes save → button changes back to "Guardar"
- /profile shows "Guardados" section with all saved reports
- Login as A, save report R, log out, log in as A: R is still in saved list (DB-persisted)

## Next

`sdd-spec` to write the detailed delta spec for the 4 capabilities.
