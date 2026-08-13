# accessibility-pass (MODIFIED delta)

## What changes

Add `aria-*` attributes to interactive elements. Verify existing labels work. No major a11y overhaul.

## Requirements

- **MODIFIED Requirement — `<SaveButton>` pressed state.** Add `aria-pressed={saved}` to the button so screen readers announce the toggle state.
- **MODIFIED Requirement — `<ReportForm>` toggle group.** The `<fieldset>` already has a `<legend>`. Add `aria-required="false"` to the optional radio buttons. The `<input type="file">` for photo MUST have `aria-describedby` pointing to its helper text id.
- **MODIFIED Requirement — `<CommentForm>`.** Add `aria-required="true"` to the body textarea (it's already required but explicit for SR).
- **MODIFIED Requirement — `<CommentList>` and `<SavesList>`.** Each list item MUST have `aria-label` describing the entry (e.g., for SavesList: `aria-label="Reporte de {person_name}, guardado {timeAgo}"`).
- **ADDED Requirement — Skip link.** Add a "Saltar al contenido" link at the very top of `<body>` (in `app/layout.tsx`). It MUST be visually hidden until focused, then jump to `<main>`. `<a href="#main" className="sr-only focus:not-sr-only ...">Saltar al contenido principal</a>`.
- **ADDED Requirement — `<main id="main">`.** All page-level Server Components MUST have `<main id="main">` so the skip link works.
- **MODIFIED Requirement — Map accessibility.** `<ReportMap>` MUST set `aria-label="Mapa de ubicación"` on the wrapping `<div>`.

## Scenarios

- GIVEN a screen reader on `/report/[id>`
- WHEN the user tabs to the SaveButton
- THEN the SR announces "Quitar de guardados, button, pressed" (or "Guardar, button, not pressed")

- GIVEN a screen reader on `/report/[id]`
- WHEN the user lands on the page
- THEN a "Saltar al contenido principal" link is the first focusable element
- AND activating it moves focus to `<main>`

- GIVEN a SavesList card
- WHEN a screen reader reads it
- THEN the card has a clear label like "Reporte de Juan, guardado hace 2 horas, link"
