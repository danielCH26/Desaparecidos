# report-filters Technical Design

## File-by-File

### NEW files

#### `lib/colombia-divipola.ts`
- Static TypeScript file with the full DANE DIVIPOLA list
- Exports: `DEPARTMENTS`, `MUNICIPALITIES`, `isValidDepartment`, `municipalitiesFor`, `municipalitiesForFlat`, `isValidMunicipality`
- TypeScript strict
- Data source: DANE public list

#### `supabase/migrations/0004_filters.sql`
```sql
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS municipality text;
```

#### `components/reports/ReportsFilterBar.tsx`
- Server Component (no `'use client'`)
- Reads `current` prop and renders a `<form method="get" action="/reports">`
- Department select with all 33 options
- Municipality select populated from `municipalitiesFor(current.department)`
- Age range: two number inputs
- "Filtrar" button
- "Limpiar filtros" link if any filter is active
- Inline `<script>` to auto-submit on department change

### MODIFIED files

#### `app/reports/page.tsx`
- Accept `searchParams: Promise<{ department?, municipality?, ageMin?, ageMax? }>`
- Parse + validate each param using the static data
- Build Supabase query with conditional filters:
  ```typescript
  let query = supabase
    .from('reports')
    .select('id, person_name, person_age, person_photo_url, last_known_lat, last_known_lng, last_known_address, created_at, status, department, municipality')
    .eq('status', 'missing')
    .order('created_at', { ascending: false });

  if (department) {
    query = query.eq('department', department).not('department', 'is', null);
  }
  if (municipality) {
    query = query.eq('municipality', municipality).not('municipality', 'is', null);
  }
  if (ageMin !== undefined) {
    query = query.gte('person_age', ageMin);
  }
  if (ageMax !== undefined) {
    query = query.lte('person_age', ageMax);
  }
  ```
- Render `<ReportsFilterBar current={...} />` at the top
- Render "Mostrando N reportes" if any filter is active
- Update the empty state message to show a "Limpiar filtros" link when filters are active

#### `components/ui/ReportCard.tsx`
- When `report.department IS NULL`, show a "Sin departamento" badge
- When `report.municipality IS NULL`, show a "Sin municipio" badge
- Same place as the time label

#### `components/forms/ReportForm.tsx`
- Add `department` and `municipality` state
- Add two `<select>` fields after the address field, before the toggle
- On department change, reset municipality
- Include both in the formData to `createReportAction`

#### `app/actions/reports.ts`
- Read `department` and `municipality` from formData
- Validate via `isValidDepartment` and `isValidMunicipality`
- Include in INSERT

## Hard rules
- DO NOT add reverse geocoding
- DO NOT add a `departamentos` table
- DO NOT change RLS
- All Spanish copy
- 44 px touch targets

## Smoke test plan
- Migration applied (user action) → columns present
- Create a report with department + municipality → row has both
- Create with invalid department → action returns error
- List page with `?department=X` → only matching rows
- Filter bar renders Spanish copy
- "Sin departamento" badge on pre-migration reports (NULL)
