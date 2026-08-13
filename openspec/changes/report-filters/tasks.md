# report-filters Tasks

## Dependency Chain
1. colombia-divipola.ts → 2, 3, 4
2. Migration file → 3
3. createReportAction (department + municipio) → 4
4. ReportForm (selects) → 5
5. ReportsFilterBar + page updates + ReportCard badge

## Atomic Tasks (6)

### T1 — Create `lib/colombia-divipola.ts`
- **Files**: `lib/colombia-divipola.ts` (new)
- Full DANE DIVIPOLA data: 32 departments + Bogotá D.C., 1,122 municipalities
- Exports: `DEPARTMENTS`, `MUNICIPALITIES`, `isValidDepartment`, `municipalitiesFor`, `municipalitiesForFlat`, `isValidMunicipality`
- **Verify**: TypeScript compiles; import test passes

### T2 — Create `supabase/migrations/0004_filters.sql`
- **Files**: `supabase/migrations/0004_filters.sql` (new)
- `ALTER TABLE reports ADD COLUMN IF NOT EXISTS department text, municipality text;`
- Both nullable, no constraints
- **Verify**: file exists with the right SQL

### T3 — Update `app/actions/reports.ts`
- **Files**: `app/actions/reports.ts` (modify)
- Read `department` and `municipality` from formData
- Validate with `isValidDepartment` and `isValidMunicipality`
- Include both in INSERT
- Return error in Spanish if invalid
- **Verify**: TypeScript compiles

### T4 — Update `components/forms/ReportForm.tsx`
- **Files**: `components/forms/ReportForm.tsx` (modify)
- Add `department` and `municipality` state
- Render two `<select>` after address field
- Cascade behavior: department change resets municipality
- **Verify**: build green

### T5 — Update `components/ui/ReportCard.tsx`
- **Files**: `components/ui/ReportCard.tsx` (modify)
- Show "Sin departamento" / "Sin municipio" badges when NULL
- **Verify**: build green

### T6 — Update `app/reports/page.tsx` and create `components/reports/ReportsFilterBar.tsx`
- **Files**: `app/reports/page.tsx` (modify), `components/reports/ReportsFilterBar.tsx` (new)
- `searchParams` parsing and validation
- Conditional Supabase query with `.eq`, `.not`, `.gte`, `.lte`
- Render the filter bar
- "Mostrando N reportes" when filters active
- **Verify**: build green; smoke test the filter via search params

## Review Workload Forecast
- **Estimated changed lines**: ~600 (colombia-divipola.ts is ~50KB for the data, plus ~150 lines of code)
- **Chained PRs**: No
- **Budget risk**: Low (within 1200)

## Action Type Summary
- Orchestrator-actions: T1, T3, T4, T5, T6
- User-actions: T2 (apply migration via dashboard)

## Hard Rules
- DO NOT add reverse geocoding
- All Spanish copy
- 44 px touch targets
- No emoji
- DO NOT run git push
