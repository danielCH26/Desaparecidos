# Phase 4 Archive Report

## Change Summary
- **Name**: phase-4 (Public browse + detail)
- **Project**: desaparecidos
- **Completed**: 2026-08-11
- **Commit**: c909b96

## Specs Synced

### New Main Specs (3)
- `openspec/specs/reports-list-page/spec.md` — Public `/reports` listing page
- `openspec/specs/report-detail-page/spec.md` — Public `/report/[id]` detail page
- `openspec/specs/report-card-component/spec.md` — Reusable ReportCard component

### Updated Main Specs (1)
- `openspec/specs/report-map-component/spec.md` — Added `readOnly` mode requirement

## Implementation Summary

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

## Files Created/Modified
- `lib/types.ts` (NEW)
- `components/ui/ReportCard.tsx` (NEW)
- `app/reports/page.tsx` (NEW)
- `app/reports/loading.tsx` (NEW)
- `app/reports/not-found.tsx` (NEW)
- `app/report/[id]/page.tsx` (NEW)
- `app/report/[id]/loading.tsx` (NEW)
- `app/report/[id]/not-found.tsx` (NEW)
- `components/map/ReportMap.tsx` (MODIFIED - added readOnly prop)

## Verification
- Build: ✅ Passed
- Lint: ✅ Passed
- Type-check: ✅ Passed
- Smoke tests: ✅ Passed (contact_phone not exposed in list)

## Next Recommended
Phase 5 (Comments) — implement comment system on detail pages
