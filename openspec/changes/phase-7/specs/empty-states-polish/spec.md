# empty-states-polish (MODIFIED delta)

## What changes

Verify and tighten all empty states. They already exist from earlier phases but the polish pass ensures consistent visual rhythm and copy.

## Requirements

- **MODIFIED Requirement — `/reports` empty state.** When `reports.length === 0`:
  - Heading: "Aún no hay reportes publicados." (`<p>` italic gray-500)
  - CTA: "Publicar un reporte" → `/report/new` (button, blue-600, 44px)
  - Centered: `text-center py-12`
- **MODIFIED Requirement — `/report/[id]` no comments empty state.** When `comments.length === 0`:
  - Italic gray-500: "Sin comentarios todavía. Sé el primero en comentar."
- **MODIFIED Requirement — `/profile` no saves empty state.** When `saves.length === 0`:
  - Italic gray-500: "No tenés reportes guardados todavía." with inline `<Link href="/reports">Volvé a reportes</Link>` for "para guardar los que te interesen."
- All empty states: `text-sm text-gray-500 italic` (or `text-center` for the list page CTA)
- No new empty states added in Phase 7

## Scenarios

- GIVEN `/reports` with 0 reports
- THEN the page shows italic "Aún no hay reportes publicados." + blue CTA button
- AND the CTA is 44 px min-height, blue-600, links to `/report/new`

- GIVEN `/report/<id>` with 0 comments
- THEN below the comment form, "Sin comentarios todavía. Sé el primero en comentar." in italic gray-500

- GIVEN `/profile` with 0 saves
- THEN "No tenés reportes guardados todavía. Volvé a reportes para guardar los que te interesen." in italic gray-500
