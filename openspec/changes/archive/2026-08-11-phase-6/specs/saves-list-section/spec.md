# saves-list-section

## Purpose

Server Component rendered on `/profile` (below the profile form) that lists all reports the current user has saved.

## Requirements

- Renders inside `/profile/page.tsx`, below the existing `<ProfileForm>` and below a divider `<hr className="my-6" />`
- Fetches the user's saves with a join to reports (to get name, age, photo):
  ```sql
  select
    saves.id as save_id,
    saves.created_at as saved_at,
    reports.id,
    reports.person_name,
    reports.person_age,
    reports.person_photo_url,
    reports.last_known_lat,
    reports.last_known_lng,
    reports.status
  from saves
  inner join reports on reports.id = saves.report_id
  where saves.profile_id = $1
  order by saves.created_at desc
  ```
- Section heading: "Reportes guardados" (h2, same style as the page heading)
- For each saved report, render a card-style link to `/report/<id>`:
  - Person's name (bold)
  - Age (small badge if present)
  - Time since saved (e.g., "guardado hace 3 días") using `Intl.RelativeTimeFormat('es', { numeric: 'auto' })`
  - 44 px min-height click target
  - Photo thumbnail if available, otherwise initial-letter placeholder (same pattern as ReportCard)
- Empty state: "No tenés reportes guardados todavía. <Link href='/reports'>Volvé a reportes</Link> para guardar los que te interesen."
- The list MUST respect RLS: the SELECT on `saves` is owner-only, so if the auth session has no user, the query returns empty (and the user gets redirected to `/login` by the page itself)

## Scenarios

- GIVEN user U is logged in and has saved 3 reports
- WHEN `/profile` renders
- THEN the "Reportes guardados" section shows 3 cards, newest-saved first
- AND each card links to `/report/<id>` of that report
- AND each card shows "guardado hace X días"

- GIVEN user U has 0 saved reports
- WHEN `/profile` renders
- THEN the empty state appears: "No tenés reportes guardados todavía..." with a link to `/reports`

- GIVEN user is NOT logged in
- WHEN `/profile` is accessed
- THEN the page redirects to `/login` (per Phase 2 behavior — already in place)

- GIVEN the user removes a save via `toggleSaveAction`
- WHEN `/profile` is re-rendered
- THEN the removed report disappears from the list (via `revalidatePath`)

## Hard rules
- Server Component (no interactivity needed; revalidatePath on action triggers re-render)
- NO contact info exposed (per Phase 4 privacy stance)
- Reuse `formatRelativeTime` helper pattern from Phase 5 (CommentList)
- 44 px touch targets on each card link
- Spanish copy
