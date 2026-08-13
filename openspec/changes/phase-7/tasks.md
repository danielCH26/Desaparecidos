# Phase 7 Tasks

## Dependency Chain
1. Polish loading + empty states → 2, 3, 4
2. Add metadata + skip link + a11y → 4, 5
3. Build verification → 6
4. Commit + RDD + archive → 6, 7

## Atomic Tasks (7)

### T1 — Polish `app/reports/loading.tsx` and `app/report/[id]/loading.tsx`
- Per `design.md`
- Add `sr-only aria-live="polite"` accessibility text
- Consistent `animate-pulse` pattern
- **Verify**: build green

### T2 — Create `app/loading.tsx` (top-level) and `app/not-found.tsx` (global 404)
- Per `design.md`
- **Verify**: curl /nonexistent returns 404 (or dev 200 with the page rendered)

### T3 — Polish empty states (no new code, verify copy matches spec)
- Review `/reports`, `/report/[id]`, `/profile` empty states
- Tighten copy and visual hierarchy if needed
- **Verify**: all three empty states have correct copy

### T4 — Accessibility pass
- Add `aria-pressed={saved}` to `<SaveButton>`
- Add `aria-describedby` to the photo file input in `<ReportForm>`
- Add `aria-required="true"` to the body textarea in `<CommentForm>`
- Add `aria-label` to list items in `<CommentList>` and `<SavesList>`
- Add `aria-label="Mapa de ubicación"` to `<ReportMap>` wrapper

### T5 — Add metadata exports + skip link + `<main id="main">` wrapping
- `app/page.tsx`: metadata for home
- `app/(auth)/register/page.tsx`, `app/(auth)/login/page.tsx`: metadata
- `app/profile/page.tsx`, `app/report/new/page.tsx`, `app/reports/page.tsx`: metadata
- `app/report/[id]/page.tsx`: `generateMetadata`
- `app/layout.tsx`: add skip link as first body child
- Wrap page content in `<main id="main">` in each page

### T6 — Build verification
- `npm run build`: must compile
- `npm run lint`: must be clean
- `npx tsc --noEmit`: must be clean
- **Verify**: all three pass

### T7 — Commit
- `feat(polish): not-found page, loading states, accessibility, metadata, skip link`
- **Verify**: `git status` clean

## Review Workload Forecast
- Estimated changed lines: ~150 (2 new files ~40, 6+ modified files ~110)
- Chained PRs: No
- Budget risk: Low

## Action Type Summary
- Orchestrator-actions: T1, T2, T3, T4, T5, T6, T7
- User-actions: 0
