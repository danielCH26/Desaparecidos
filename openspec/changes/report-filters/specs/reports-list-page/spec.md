# reports-list-page (MODIFIED delta)

## What changes from the existing main spec at `openspec/specs/reports-list-page/spec.md`

The `/reports` page now accepts filter search params (`department`, `municipality`, `ageMin`, `ageMax`) and applies them to the Supabase query. It also renders a `<ReportsFilterBar />` above the grid. The query result count display is also added.

## Requirements

- **MODIFIED Requirement — Page params.** `app/reports/page.tsx` accepts `searchParams: Promise<{ department?: string; municipality?: string; ageMin?: string; ageMax?: string }>` (all `string` because URL params are always strings).
- **ADDED Requirement — Filter parsing and validation.** The page MUST parse and validate each param:
  - `department` (optional): if present, must satisfy `isValidDepartment(department)` per `lib/colombia-divipola.ts`. If invalid, drop the filter (and log a warning in dev).
  - `municipality` (optional): if present, must satisfy `isValidMunicipality(department, municipality)`. If invalid, drop the filter.
  - `ageMin` (optional): parsed via `parseInt`, must be 0–130. If invalid, drop the filter.
  - `ageMax` (optional): parsed via `parseInt`, must be 0–130. If invalid, drop the filter.
- **MODIFIED Requirement — Supabase query.** The `select` now applies filters conditionally:
  - If `department`: `.eq('department', department)`. ALWAYS paired with `.not('department', 'is', null)` so pre-existing reports (NULL) don't accidentally show.
  - If `municipality`: `.eq('municipality', municipality)`. Same NULL exclusion.
  - If `ageMin`: `.gte('person_age', ageMin)`. If `person_age` IS NULL, the row is excluded by `.gte` (correct).
  - If `ageMax`: `.lte('person_age', ageMax)`. Same NULL behavior.
  - All filters combined with implicit AND.
  - The base `status='missing'` filter and `order('created_at', { ascending: false })` stay.
- **MODIFIED Requirement — "Sin departamento" badge.** When `report.department IS NULL`, the `<ReportCard>` MUST show a small badge "Sin departamento" (italic, text-xs, text-gray-500) above the timestamp line. Same for `Sin municipio` (separately, not both at once).
- **ADDED Requirement — Result count display.** When any filter is active, the page MUST show "Mostrando N reportes" above the grid (text-sm, text-gray-700, mb-2). When no filter is active, no count is shown (the cards themselves are the count).
- **MODIFIED Requirement — Filter bar mount.** The page MUST render `<ReportsFilterBar current={...} />` at the top, above the heading or below it (decide in the implementation).

## Scenarios

- GIVEN no search params
- WHEN `/reports` renders
- THEN no filter applied; all reports with `status='missing'` are returned, newest first
- AND `<ReportsFilterBar />` shows all 3 controls with no pre-selection
- AND the "Limpiar filtros" link is NOT shown
- AND the result count is NOT shown

- GIVEN `?department=Antioquia`
- WHEN `/reports` renders
- THEN `.eq('department', 'Antioquia')` AND `.not('department', 'is', null)` are applied
- AND pre-existing reports (NULL department) are excluded
- AND the department select pre-selects "Antioquia"

- GIVEN `?department=Antioquia&municipality=Medellín&ageMin=18&ageMax=30`
- WHEN `/reports` renders
- THEN all 4 filters apply; pre-migration reports are excluded (NULL department)
- AND reports with `person_age IS NULL` are excluded (because `.gte` and `.lte` both reject NULL)
- AND result count "Mostrando N reportes" is shown

- GIVEN `?department=Atlantis` (invalid department)
- WHEN `/reports` renders
- THEN the filter is dropped (logged in dev), the query returns all reports
- AND the filter bar shows no pre-selected department (the URL `?department=Atlantis` is effectively ignored for query purposes)

- GIVEN a pre-existing report with `department IS NULL`
- WHEN the unfiltered list renders
- THEN the card shows the "Sin departamento" badge

- GIVEN a pre-existing report with `department IS NULL`
- WHEN `?department=Antioquia` is applied
- THEN the report is NOT in the result (filtered out by `.not('department', 'is', null)`)

## Hard rules
- DO NOT add pagination
- DO NOT change the report sort order
- DO NOT query the full DIVIPOLA list in the database; the filter values come from URL search params
- All Spanish copy
- The filter bar is rendered server-side; no client-side state needed
