# Phase 4 Tasks

## Dependency Chain
1. Update TypeScript types → 2, 3, 4, 7
2. Implement ReportMap readOnly prop → 4, 7
3. Create ReportCard component → 4
4. Implement reports list page → 5, 6
5. Add loading state to list page → 6
6. Implement not-found state for list
7. Implement report detail page → 8, 9
8. Add loading state to detail page → 9
9. Implement not-found state for detail

## Atomic Tasks (9 total)

### 1. Update TypeScript types for Phase 4 features
- **Dependencies**: None
- **Files**: `lib/types.ts` (NEW — privacy-enforced types)
- **Description**: Add `ReportSummary` (excludes contact_phone/contact_email) and `Report` (includes contact) for client/server
- **Acceptance Criteria**:
  - `ReportSummary` excludes `contact_phone` and `contact_email` (structural privacy)
  - `Report` extends `ReportSummary` and adds `contact_phone`, `contact_email`, `updated_at`
  - `status` is typed as `'missing' | 'found' | 'resolved'` union

### 2. Implement readOnly prop in ReportMap component
- **Dependencies**: Task 1
- **Files**: `components/map/ReportMap.tsx`
- **Description**: Add prop to disable interactive map features for detail pages
- **Acceptance Criteria**:
  - When `readOnly=true`, map shows static marker with no click handlers
  - Map still renders properly in both readOnly and interactive modes

### 3. Create ReportCard component
- **Dependencies**: Task 1
- **Files**: `components/ui/ReportCard.tsx`
- **Description**: Reusable card component for report listings
- **Acceptance Criteria**:
  - Displays photo, name, age, and last known location
  - Implements mobile-first responsive design (375px width)
  - Spanish UI copy for all user-facing text

### 4. Implement reports list page
- **Dependencies**: Tasks 1, 2, 3
- **Files**: `app/reports/page.tsx`
- **Description**: Server Component for report listings
- **Acceptance Criteria**:
  - Fetches all reports from Supabase (no pagination per plan.md MVP)
  - Status filter: `status = 'missing'` only
  - Uses `<ReportCard>` for each listing
  - Empty state: "Aún no hay reportes" + CTA to /report/new

### 5. Add loading state to reports list
- **Dependencies**: Task 4
- **Files**: `app/reports/page.tsx`, `components/ui/Skeleton.tsx`
- **Description**: Implement loading skeletons
- **Acceptance Criteria**:
  - Shows 3 skeleton cards during initial load
  - Maintains 44px touch targets during loading
  - No layout shift when content loads

### 6. Implement not-found state for list
- **Dependencies**: Task 4
- **Files**: `app/reports/page.tsx`
- **Description**: Handle empty report lists
- **Acceptance Criteria**:
  - Shows Spanish-language message "No hay personas reportadas"
  - Includes CTA button to create first report
  - Works in both authenticated and anonymous contexts

### 7. Implement report detail page
- **Dependencies**: Tasks 1, 2
- **Files**: `app/report/[id]/page.tsx`
- **Description**: Server Component for individual report details
- **Acceptance Criteria**:
  - Fetches single report with comments
  - Shows ReportMap in readOnly mode
  - Implements proper RLS checks for comment visibility

### 8. Add loading state to detail page
- **Dependencies**: Task 7
- **Files**: `app/report/[id]/page.tsx`
- **Description**: Implement loading states
- **Acceptance Criteria**:
  - Shows skeleton for header, map, and comment section
  - Preserves layout structure during loading
  - Handles both valid and invalid ID cases

### 9. Implement not-found state for detail
- **Dependencies**: Task 7
- **Files**: `app/report/[id]/page.tsx`
- **Description**: Handle invalid report IDs
- **Acceptance Criteria**:
  - Shows 404 page with Spanish message "Reporte no encontrado"
  - Includes link back to reports list
  - Works for both authenticated and anonymous users

## Review Workload Forecast
- **Estimated changed lines**: 385
- **Chained PRs recommended**: No (under 400-line threshold)
- **Risk level**: Medium (touches critical UI paths)
- **Verification plan**: 
  - Manual smoke test checklist (6 steps)
  - Type checking and lint validation
  - Responsive testing at 375px width
- **Decision needed before apply**: None (scope fully defined)