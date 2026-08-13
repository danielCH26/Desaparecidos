# loading-states-polish (MODIFIED delta)

## What changes

Three loading states get a consistent polish: shared `animate-pulse` pattern, gray-200 rectangles, consistent vertical rhythm. Add a top-level `app/loading.tsx` so the whole app has a fallback while the root layout loads.

## Requirements

- **MODIFIED Requirement — `app/reports/loading.tsx`.** Shows 6 card skeletons in a 3-column grid. Each card: `bg-white rounded-lg shadow overflow-hidden animate-pulse` with a 40-px tall `bg-gray-200` photo rectangle + a 16-px `bg-gray-200` text rectangle + an 8-px `bg-gray-200` secondary text rectangle.
- **MODIFIED Requirement — `app/report/[id]/loading.tsx`.** Shows: a 32-px back link skeleton, an 8-px title skeleton (3/4 width), a 4-px subtitle skeleton (1/2 width), a 48-px photo skeleton, a 72-px map skeleton. Same `animate-pulse` pattern.
- **ADDED Requirement — `app/loading.tsx`** (top-level). Renders a centered skeleton with a "Cargando…" message (`<p className="sr-only">` for accessibility) and a 32-px pulsing rectangle. Used automatically by Next.js while the root layout streams.
- All skeletons: `bg-gray-200 rounded animate-pulse` blocks.
- Spanish accessibility: each loading.tsx file MUST include `<p className="sr-only" aria-live="polite">Cargando…</p>` for screen readers.

## Scenarios

- GIVEN the user navigates to `/reports`
- WHILE the page loads
- THEN 6 skeleton cards with `animate-pulse` render in a grid

- GIVEN the user navigates to `/report/<uuid>`
- WHILE the page loads
- THEN the title + photo + map skeletons render

- GIVEN a slow page
- WHEN the root layout is hydrating
- THEN a top-level skeleton renders with "Cargando…" announced to screen readers
