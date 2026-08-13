# report-detail-page (MODIFIED delta — Phase 6)

## What changes from the existing main spec at `openspec/specs/report-detail-page/spec.md`

Adds the save-toggle capability. The page Server Component now also queries the current user's saved-state for this report, and renders `<SaveButton>` after the contact section.

## Requirements

- **ADDED Requirement — SaveButton mount.** When `isAuthed=true`, the page MUST render `<SaveButton reportId={params.id} initialSaved={initialSaved} isAuthed={true} />` after the contact section. When anonymous, no SaveButton renders.
- **ADDED Requirement — Initial saved state query.** The page MUST query `SELECT id FROM saves WHERE report_id = $1 AND profile_id = auth.uid() LIMIT 1`. Pass `initialSaved = rows.length > 0` to `<SaveButton>`. If unauthenticated, `initialSaved=false`.
- The save query MUST run inside the same `await Promise.all` block (or sequential) as the existing report fetch — fail soft if the save query errors (don't 500 the whole page).

## Scenarios

- GIVEN user is anonymous on `/report/<id>`
- WHEN the page renders
- THEN no SaveButton appears in the DOM

- GIVEN user U is authenticated and has NOT saved report R
- WHEN `/report/R` renders
- THEN SaveButton shows with `initialSaved=false`

- GIVEN user U is authenticated and HAS saved report R
- WHEN `/report/R` renders
- THEN SaveButton shows with `initialSaved=true` (no client-side flash)

- GIVEN the user clicks SaveButton to toggle
- WHEN `toggleSaveAction` completes successfully
- AND the user navigates back to `/profile`
- THEN the report appears/disappears from the saves list (via `revalidatePath`)

## Hard rules
- DO NOT query saves for anonymous users (the query still runs but returns empty)
- DO NOT add save count display
- The save query must not block the page render on error
