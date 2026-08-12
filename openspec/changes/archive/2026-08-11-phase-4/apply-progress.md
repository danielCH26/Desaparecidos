# Phase 4 Apply Progress

## Status: COMPLETE

## Tasks Completed

| Task | Status |
|------|--------|
| T1: lib/types.ts - ReportSummary and Report interfaces | ✅ |
| T2: components/ui/ReportCard.tsx - Server Component card | ✅ |
| T3: app/reports/page.tsx - list page with status='missing' filter | ✅ |
| T4: app/reports/loading.tsx - 6-skeleton loading state | ✅ |
| T5: app/reports/not-found.tsx - 404 for /reports route | ✅ |
| T6: app/report/[id]/page.tsx - detail page with map and contact | ✅ |
| T7: app/report/[id]/loading.tsx - skeleton for detail | ✅ |
| T8: app/report/[id]/not-found.tsx - 404 for invalid UUID | ✅ |
| T9: components/map/ReportMap.tsx - add readOnly prop | ✅ |

## Smoke Test Results

- `/reports` returns 200, contains "Personas reportadas como desaparecidas"
- Empty state shows CTA when no reports
- `/report/<invalid-uuid>` shows "Reporte no encontrado"
- No contact_phone in /reports HTML (privacy enforced)
- `/report/new` (Phase 3) still works

## Build/Lint/Type-check

- `npm run build`: ✅ Passed
- `npm run lint`: ✅ Passed
- `npx tsc --noEmit`: ✅ Passed

## Commit

```
c909b96 feat(reports): public list and detail pages with privacy-enforced ReportSummary
```

## Notes

- Used Server Components + plain `<img loading="lazy">` (no next/image)
- No pagination per plan.md MVP constraint
- Status filter defaults to 'missing' only
- Privacy structurally enforced via ReportSummary type (excludes contact fields)
- readOnly prop on ReportMap is additive, preserves Phase 3 behavior
