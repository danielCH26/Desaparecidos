# Phase 6 Tasks

## Dependency Chain
1. Server Action `toggleSaveAction` → 2, 4
2. SaveButton component → 4
3. SavesList component → 5
4. Detail page update (mount SaveButton + initial-state query) → 6
5. Profile page update (add SavesList section) → 6
6. Smoke tests + commit

## Atomic Tasks (6)

### T1 — Create `app/actions/saves.ts`
- **Files**: `app/actions/saves.ts` (new)
- `'use server'` directive
- `toggleSaveAction(reportId, currentSaved)` with full validation
- Handles UNIQUE violation (Postgres code 23505)
- **Verify**: TypeScript compiles; `revalidatePath` calls present

### T2 — Create `components/ui/SaveButton.tsx`
- **Files**: `components/ui/SaveButton.tsx` (new)
- `'use client'` directive
- Returns null if `!isAuthed`
- Optimistic state + revert on error
- 44 px button height
- **Verify**: build green; button renders only when authed

### T3 — Create `components/ui/SavesList.tsx`
- **Files**: `components/ui/SavesList.tsx` (new)
- Server Component
- Joins saves with reports
- Empty state + relative time
- **Verify**: build green; renders list when there are saves

### T4 — Update `app/report/[id]/page.tsx`
- **Files**: `app/report/[id]/page.tsx` (modify)
- Import SaveButton
- Add initial saved-state query
- Mount SaveButton after contact section
- **Verify**: curl /report/<uuid> renders SaveButton HTML

### T5 — Update `app/profile/page.tsx`
- **Files**: `app/profile/page.tsx` (modify)
- Import SavesList
- Mount SavesList below ProfileForm
- **Verify**: curl /profile renders saves section

### T6 — Smoke tests + commit
- **Build / lint / type-check**: green
- **Smoke tests via REST API**:
  - Create test report
  - INSERT save (anon-ish — auth'd)
  - SELECT saves — verify 1 row
  - DELETE save
  - SELECT saves — verify 0 rows
- **Commit**: `feat(saves): bookmark reports with toggle save button`
- **Verify**: `git status` clean

## Review Workload Forecast
- Estimated changed lines: ~250 (3 new files ~180, 2 modified files ~70)
- Chained PRs: No
- Budget risk: Low
- Decision needed: No

## Action Type Summary
- Orchestrator-actions: T1, T2, T3, T4, T5, T6
- User-actions: 0 (no migration needed — saves table already exists from Phase 1)

## Hard Rules
- DO NOT touch saves table schema or RLS
- All Spanish copy
- 44 px touch targets
- No emoji
- DO NOT run git push
