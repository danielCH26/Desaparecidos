# reports-filter-bar (NEW)

## Purpose

Server Component rendered at the top of `/reports` that lets the user filter the list by department, municipality, and age range. Filter state is reflected in URL search params so the URL is shareable and bookmarkable.

## Requirements

- File: `components/reports/ReportsFilterBar.tsx`
- Server Component (renders HTML, submits via plain `<form method="get" action="/reports">`)
- Receives `current: { department?: string; municipality?: string; ageMin?: number; ageMax?: number }` as prop
- Renders a `<form>` with:
  - **Department select** (`<select name="department">`):
    - First option: `<option value="">Todos los departamentos</option>` (selected if no current)
    - Then a sorted list of all 33 departments from `DEPARTMENTS`
    - Pre-selects the current department
    - Has `id="filter-department"`, `aria-label="Filtrar por departamento"`
  - **Municipality select** (`<select name="municipality">`):
    - First option: `<option value="">Todos los municipios</option>`
    - Then the list returned by `municipalitiesFor(currentDepartment || "")`
    - If no department selected, the list is empty (just the placeholder option)
    - Pre-selects the current municipality
    - Has `id="filter-municipality"`, `aria-label="Filtrar por municipio"`
    - When the user changes the department, the form auto-submits (via a small inline `<script>` that calls `form.submit()` on `change` of the department select) so the municipality list updates server-side
  - **Age range**: two number inputs (`<input type="number" min="0" max="130">`):
    - `ageMin` with placeholder "Edad mín" (default 0, optional)
    - `ageMax` with placeholder "Edad máx" (default 130, optional)
    - Both have `id` and `aria-label`
  - **Submit button**: "Filtrar" (`<button type="submit">`, 44 px, blue-600)
  - **Clear link**: `<Link href="/reports">Limpiar filtros</Link>` (44 px, only rendered if any filter is active)
- All controls: 44 px min-height for touch targets
- Spanish labels throughout
- Semantic HTML: `<form>` with `<label>` for each control
- Form has `role="search"` for accessibility
- Layout: flex-wrap on small screens, horizontal on large screens; gap between controls

## Scenarios

- GIVEN the user visits `/reports` with no params
- WHEN the page renders
- THEN a filter bar appears at the top with all 3 controls (department, municipality, age range) and a "Filtrar" button
- AND the "Limpiar filtros" link is NOT rendered (no active filters)

- GIVEN the user visits `/reports?department=Antioquia`
- WHEN the page renders
- THEN the department select shows "Antioquia" pre-selected
- AND the municipality select shows the full list of Antioquian municipalities
- AND the URL after submitting retains `?department=Antioquia`

- GIVEN the user visits `/reports?department=Antioquia&municipality=Medell%C3%ADn&ageMin=18&ageMax=30`
- WHEN the page renders
- THEN all three selects/inputs are pre-filled with the current values
- AND the "Limpiar filtros" link IS rendered

- GIVEN the user changes the department select
- WHEN the change event fires
- THEN the form auto-submits (the browser navigates to `/reports?department=<new>&municipality=` to reset the municipality)

- GIVEN the user clicks "Filtrar" with department="Antioquia" and ageMin=18
- WHEN the form submits
- THEN the browser navigates to `/reports?department=Antioquia&ageMin=18`
- AND the page re-renders with the new query

- GIVEN the user clicks "Limpiar filtros"
- WHEN the link is activated
- THEN the browser navigates to `/reports` (no params)

## Hard rules
- DO NOT use client-side React state (form submits via plain GET)
- DO NOT introduce a new test framework
- All controls: 44 px min-height
- Spanish copy
- No emoji
