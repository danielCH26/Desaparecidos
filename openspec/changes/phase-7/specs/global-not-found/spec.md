# global-not-found (NEW)

## Purpose

Top-level 404 page rendered when a route doesn't match any in the app (e.g., `/foo`, `/bar/baz`). Distinct from `/report/[id]/not-found.tsx` which is route-scoped.

## Requirements

- File: `app/not-found.tsx`
- Spanish-only copy
- Heading: "Página no encontrada" (`<h1 className="text-2xl font-bold">`)
- Subtext: "La ruta que buscás no existe." (`<p className="text-gray-600">`)
- CTA link: "Volver al inicio" → `/` (`<Link className="text-blue-600 underline">`)
- 44 px min-height on the link
- Mobile-first: `max-w-md mx-auto` and `p-4`
- Centered vertically: `min-h-screen flex items-center justify-center`
- Uses the same `Header` from `app/layout.tsx` (auto-included by the App Router)

## Scenarios

- GIVEN the user navigates to `/nonexistent-path`
- WHEN the route is unmatched
- THEN the page renders with "Página no encontrada" + "Volver al inicio" link

- GIVEN a screen reader encounters the page
- WHEN the heading is read
- THEN it announces "Página no encontrada, nivel 1"

- GIVEN the user clicks "Volver al inicio"
- WHEN the link is activated
- THEN the user is taken to `/`
