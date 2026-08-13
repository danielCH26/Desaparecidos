# Proposal: phase-7 — Polish

## Intent

Phase 7 is the final polish pass: 404 page, loading skeleton polish, empty state consistency, accessibility audit, and any final UX tightening. No DB changes, no new Server Actions. Just refinement.

## Context

- Phases 0–6 + register-fields all shipped. 25+ main specs, 6 commits of running software.
- The app already has:
  - `app/reports/loading.tsx` (skeleton for list)
  - `app/report/[id]/loading.tsx` (skeleton for detail)
  - Empty states in `/reports` (no reports CTA), `/report/[id]` (no comments), `/profile` (no saves)
  - Spanish copy throughout
  - 44px touch targets on form inputs and buttons
- What's still loose:
  - No `app/not-found.tsx` for global 404
  - `/report/[id]/not-found.tsx` exists but is route-scoped — when `/nonexistent-path` is hit, Next uses its default 404 (English) instead of our Spanish
  - Some empty states in `<Select>` dropdowns not styled
  - Accessibility attributes (aria-labels on map, button roles) — partially done
  - Mobile-first responsive — not formally QA'd at 375 px

## Scope

**In**:
- `app/not-found.tsx` — global 404 page in Spanish
- Polish existing loading skeletons (consistent visual rhythm)
- Polish empty states (consistent visual rhythm)
- Add aria-labels to the ReportMap and SaveButton
- Add `app/loading.tsx` — root-level loading (Next.js 15+ feature for top-level suspense)
- Final accessibility pass: ensure all interactive elements have proper roles + labels
- `metadata` exports for title/description per page
- Run `npm run lint && npm run type-check` final pass

**Out** (explicit):
- Lighthouse pass (requires browser, can't test in sandbox)
- Visual mobile QA at 375 px (requires browser)
- New features (no new auth, no new RLS, no new tables)
- Translation to English (Spanish only per plan.md)
- Performance optimization (out of MVP scope)
- SEO (out of MVP scope; project explicitly $0, no SEO work)

## Capabilities

### New
1. **`global-not-found`** — `app/not-found.tsx`: Spanish 404 page. Shows "Página no encontrada" with link to `/`. Used when a route doesn't match any in the app.

### Modified
2. **`loading-states-polish`** — Refactor `app/reports/loading.tsx` and `app/report/[id]/loading.tsx` to share a common pattern. Add `app/loading.tsx` (top-level fallback). All skeletons in Spanish.
3. **`empty-states-polish`** — Verify and tighten empty states:
   - `/reports` when no reports: shows CTA to create one
   - `/report/[id]` when no comments: shows "Sin comentarios todavía" (already done in Phase 5)
   - `/profile` when no saves: shows "No tenés reportes guardados" (already done in Phase 6)
   - All empty states use consistent visual hierarchy
4. **`accessibility-pass`** — Add aria-labels to:
   - `<SaveButton>` (currently uses text labels which is fine, but add `aria-pressed` for the toggle state)
   - `<ReportMap>` (Leaflet container, but the button "Quitar pin" already has text)
   - The `<form>` elements (use proper labels with `htmlFor` — already done in Phase 2/3)
5. **`metadata-exports`** — Add `metadata` exports to:
   - `app/page.tsx` (home): `{ title: 'Desaparecidos — Plataforma de búsqueda' }`
   - `app/reports/page.tsx`: `{ title: 'Reportes — Desaparecidos' }` (already there from Phase 4)
   - `app/report/[id]/page.tsx`: `generateMetadata` based on the report's person_name
   - `app/(auth)/register/page.tsx`: `{ title: 'Registrarse — Desaparecidos' }`
   - `app/(auth)/login/page.tsx`: `{ title: 'Iniciar sesión — Desaparecidos' }`
   - `app/profile/page.tsx`: `{ title: 'Mi perfil — Desaparecidos' }`
   - `app/report/new/page.tsx`: `{ title: 'Publicar reporte — Desaparecidos' }`

## Approach

- **404 page**: simple, big "404" text in Spanish with link back to `/`
- **Loading skeletons**: use a consistent `animate-pulse` pattern with `bg-gray-200` rectangles
- **Empty states**: italic `text-gray-500` text with a clear CTA link where appropriate
- **Accessibility**: minimal new attributes; mostly verify existing ones work
- **Metadata**: Next.js convention; lightweight

## Default decisions

1. **404 page styling**: matches the rest of the app (gray-50 bg, blue-600 link, max-w-md)
2. **Loading skeleton timing**: shown automatically by Next.js Suspense (no explicit "loading" prop)
3. **Empty state copy**: all in Spanish; CTA links go to the most useful next action
4. **No new icons**: stay text-only (no emoji per plan.md)
5. **No tests added**: this is polish; smoke tests are sufficient

## Persistence

- Engram `sdd/phase-7/proposal`
- OpenSpec `openspec/changes/phase-7/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT introduce new features
- DO NOT modify DB schema or RLS
- DO NOT add tests (out of MVP scope)
- DO NOT use emoji
- All Spanish copy
- 44 px touch targets on interactive elements

## Next

`sdd-spec` to detail the 5 capabilities.
