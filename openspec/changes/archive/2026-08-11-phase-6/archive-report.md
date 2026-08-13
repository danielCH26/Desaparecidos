# phase-6 Archive Report

## Final State (2026-08-11)

### Outcome
**Success** — Phase 6 (Save/bookmark) shipped. 3 new components + 1 new Server Action + 2 page updates. End-to-end smoke tests pass via REST API.

### Tasks Completed
- T1: `app/actions/saves.ts` (Server Action) ✓
- T2: `components/ui/SaveButton.tsx` (Client Component) ✓
- T3: `components/ui/SavesList.tsx` (Server Component) ✓
- T4: `app/report/[id]/page.tsx` (mount SaveButton + initial-state query) ✓
- T5: `app/profile/page.tsx` (mount SavesList section) ✓
- T6: smoke tests + commit ✓

### Commits
```
65231ef feat(saves): bookmark reports with toggle save button and profile list
04bef94 chore: add phase-6 apply progress
```

### Smoke Test Results
- INSERT save: HTTP 201 ✓
- SELECT saves: HTTP 200, 1 row returned ✓
- DELETE save: HTTP 204 ✓
- Cleanup: HTTP 204 ✓

### Specs Synced
- 1 delta merged into existing main spec:
  - `openspec/specs/report-detail-page/spec.md` (added SaveButton mount + initial saved-state query)
- 3 new main specs:
  - `openspec/specs/save-button-component/spec.md`
  - `openspec/specs/toggle-save-action/spec.md`
  - `openspec/specs/saves-list-section/spec.md`

### Fixes Applied During Apply
1. Fixed TypeScript `any` error in `SavesList.tsx` by using `as unknown as` cast (Supabase nested type inference)
2. Added eslint-disable comment for `<img>` (Supabase Storage external URL is allowed in this context)

### Behavior Summary
- Anon user on /report/[id]: no SaveButton visible
- Logged-in user on /report/[id]: SaveButton shows "Guardar" (or "Quitar de guardados" if already saved)
- Click toggles: optimistic state flip + server action + revert on error
- /profile shows "Reportes guardados" section below the form
- Login as A, save report R, log out, log in: R is still in saved list (DB-persisted)

### Open Items (deferred to Phase 7 polish)
- Save count display on report detail (e.g., "3 personas guardaron esto") — not in MVP
- Saved-list filtering/sort UI — list is `created_at DESC` only
- Save notifications — not in MVP

### Next Recommended
Phase 7 — Polish: 404 page, loading states, Lighthouse, visual QA pass.

### Risks
- **WARNING**: Confirm email must be disabled in Supabase dashboard for production signups (carried over from Phase 2)
- **WARNING**: ProfileForm + profile page are NOT tested with the new email/phone from register-fields — would need browser-based QA
