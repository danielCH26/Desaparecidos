# Proposal: report-filters — Filter reports by department, municipality, age

## Intent

The `/reports` list page currently shows all reports, newest first, with no filter capability. Add three filter dimensions: **department** (departamento), **municipality** (municipio), and **age range**. Filters are reflected in URL search params so they're shareable and bookmarkable. The create form gets department + municipio selects so reports are filterable from the start.

## Context

- `reports` table currently has `last_known_address` (free text), `last_known_lat`, `last_known_lng`, and `person_age` (int, nullable). No `department` or `municipality` columns.
- The user already created test reports via the create form; those will have NULL for the new columns and would be excluded from filtered queries. Need a UX decision (see open questions).
- For Colombian geography: 32 departments + Bogotá DC, ~1,122 municipalities. Source: DANE DIVIPOLA codes (publicly available).
- Phase 7 already shipped metadata + accessibility — this change should respect those patterns.

## Scope

**In**:
- DB migration `supabase/migrations/0004_filters.sql` adding `department text` and `municipality text` columns to `reports` (both nullable to keep backward compat with existing rows; but new reports REQUIRE them)
- Static data file `lib/colombia-divipola.ts` with departments + their municipalities (curated subset, not full DIVIPOLA — see open questions)
- New `components/reports/ReportsFilterBar.tsx` (Server Component) rendered at the top of `/reports` with three controls: department select, municipality select (filtered by department), age range (min/max number inputs)
- `ReportForm.tsx` updates: add department + municipio selects after the address field, before the toggle
- `createReportAction` (app/actions/reports.ts) updates: read department + municipio, validate against the static list, include in INSERT
- `app/reports/page.tsx` updates: parse search params (`department`, `municipality`, `ageMin`, `ageMax`), apply to Supabase query, render the filter bar
- Filter state lives in URL search params (e.g., `/reports?department=Antioquia&municipality=Medell%C3%ADn&ageMin=18&ageMax=30`)
- "Limpiar filtros" link when any filter is active
- Update apply-progress for the migration; update the proposal's open-question outcome

**Out** (explicit):
- Real-time reverse geocoding from lat/lng (Nominatim etc.) — too slow, rate-limited
- Full DIVIPOLA list of all 1,122 municipalities (too much for MVP)
- Map view of filtered results (Phase 7 already deferred; this change doesn't reintroduce it)
- Saved-search (a user "favorites" a filter combination) — not in MVP
- Filter persistence across sessions (URL params are enough)
- Server-side filter analytics ("how many people search Antíoquia") — out of MVP
- Internationalization of the filter labels (Spanish only per plan.md)

## Capabilities

### New
1. **`colombia-divipola-data`** — Static TypeScript file `lib/colombia-divipola.ts` exporting:
   - `DEPARTMENTS: string[]` — list of 32 Colombian departments + "Bogotá D.C."
   - `MUNICIPALITIES: Record<string, string[]>` — keyed by department, value is sorted list of municipalities
   - `isValidDepartment(d: string): boolean` — true if d is in DEPARTMENTS
   - `municipalitiesFor(d: string): string[]` — returns the list for a department (empty if invalid)
   - `isValidMunicipality(d: string, m: string): boolean` — true if m is in d's list
   - Data sourced from DANE (curated to top ~50 most populous municipalities per department for MVP)
2. **`reports-filter-bar`** — Server Component `components/reports/ReportsFilterBar.tsx`:
   - Reads `searchParams` from props
   - Renders a `<form method="get" action="/reports">` with three controls
   - Department select (full list), pre-selects current
   - Municipality select (filtered by current department), pre-selects current
   - Age range: two number inputs (min, max)
   - "Filtrar" submit button (44 px)
   - "Limpiar filtros" link (only shown if any filter is active)
   - Spanish labels + accessible
3. **`migration-filters`** — `supabase/migrations/0004_filters.sql`:
   - `ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS department text, ADD COLUMN IF NOT EXISTS municipality text;`
   - Both nullable for backward compat (existing rows + new optional fields)
   - No new CHECK constraints (validation is application-side in `createReportAction`)

### Modified
4. **`create-report-action`** — `app/actions/reports.ts` updates:
   - Read `department` and `municipality` formData
   - Validate against the static list (`isValidDepartment`, `isValidMunicipality`)
   - Return error in Spanish if invalid: "Departamento inválido" / "Municipio inválido para ese departamento"
   - Include both in INSERT
5. **`report-form-component`** — `components/forms/ReportForm.tsx` updates:
   - Add state for `department` and `municipality`
   - Render two `<select>` after the address field, before the toggle group
   - When department changes, reset municipality to empty (cascade)
   - When municipality changes, fetch list from `municipalitiesFor(department)`
   - Both required (form-level validation)
6. **`reports-list-page`** — `app/reports/page.tsx` updates:
   - Accept `searchParams: Promise<{ department?, municipality?, ageMin?, ageMax? }>`
   - Parse and validate each param
   - Build Supabase query: `.eq('department', ...)`, `.eq('municipality', ...)`, `.gte('person_age', ...)`, `.lte('person_age', ...)`
   - Only apply filters that are present
   - Render `<ReportsFilterBar />` at the top, above the grid
   - Show "Mostrando N reportes" when filters are active
   - Pass the current `searchParams` to the filter bar so it pre-selects

## Approach

- **URL-driven state**: every filter change submits a `GET /reports?...` form. The page parses search params and re-queries. No client state needed.
- **Cascading selects**: changing department clears municipality (handled in the form's React state). The URL submit re-encodes the current values.
- **Validation is server-side authoritative**: client-side check for UX (instant feedback), `createReportAction` does authoritative re-validation.
- **Backward compat**: existing reports (pre-migration) have NULL `department` and `municipality`. They show in the unfiltered list but are excluded from any filter that requires non-null department/municipality. Decision: filter on `department IS NOT NULL` when a department filter is applied, so pre-existing reports don't show up under "Antioquia" accidentally.
- **Age range is OR vs AND**: `ageMin=18` means "person_age >= 18", `ageMax=30` means "person_age <= 30". Both together mean "18 <= person_age <= 30" (AND). Both optional.
- **Empty department → no department filter** (department IS NOT NULL is dropped too).
- **Static data over a DB table**: no new table `departamentos` / `municipios` for MVP. Trade-off: requires code update when the list changes. Acceptable for a curated subset.
- **Filter UI style**: matches existing `/reports` page (cards in grid, gray-50 bg, blue-600 accent).

## Default decisions

1. **Data source**: static `lib/colombia-divipola.ts` with curated 32 departments + ~50 most populous municipalities per department. Full DIVIPOLA out of MVP scope.
2. **Department + municipio are required at create time** (form validation). Backward compat: existing reports stay NULL and won't show under filtered queries.
3. **Filter state in URL search params**: shareable, bookmarkable. No session storage.
4. **Cascading selects**: department change resets municipality.
5. **Age filter range**: min and max both optional, AND-combined.
6. **"Limpiar filtros" link** when any filter is active.
7. **Backward-compat SQL**: filter on `department IS NOT NULL` when department is supplied, so pre-existing reports (NULL) don't accidentally match.
8. **No new design or styles** beyond what's needed (FilterBar reuses existing card-style).

## Open questions (locked by orchestrator with the user, can be overridden in the proposal)

1. **Full DIVIPOLA list vs curated subset?** Default: curated (~32 departments + top 50 per department). Trade-off: more municipalities = better UX for users, but more code + larger bundle. User can override.
2. **Department + municipio required at create time?** Default: YES (since we want them filterable). User can override to optional.
3. **Existing pre-migration reports behavior?** Default: excluded from filtered queries (NULL department is filtered out when department filter is applied). User can override to "include them with NULL displayed as 'Sin departamento'".
4. **Municipality as free text or strict dropdown?** Default: strict dropdown (no free text). User can override to free text with autocomplete.
5. **Sort order change with filters?** Default: still `created_at DESC` regardless of filters. User can override to "closest age to filter".

## Persistence

- Engram `sdd/report-filters/proposal`
- OpenSpec `openspec/changes/report-filters/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT introduce reverse geocoding (no Nominatim, no external API calls)
- DO NOT add a `departamentos` DB table (keep data static in code)
- DO NOT change the existing `last_known_address` behavior
- All Spanish copy
- 44 px touch targets on filter controls
- RLS unchanged (Phase 1 RLS already allows public SELECT on `reports`)
- No emoji
- No new dependencies

## Next

`sdd-spec` to detail the 6 capabilities.
