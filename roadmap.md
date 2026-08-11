# Roadmap: Desaparecidos

Phases run sequentially. Each phase ends with a reviewable artifact and a smoke check before the next phase begins. Effort is estimated in focused hours by a single developer with AI assistance.

## Phases

### Phase 0 — Repo bootstrap

- Initialize Next.js 14 + Tailwind + TypeScript via `create-next-app`.
- Configure ESLint, Prettier, and `tsconfig` strict mode.
- Wire environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Add a smoke `app/page.tsx` that renders "Hola" and a link to `/reports`.
- **Deliverable:** green `next build` and `next lint` on `main`.
- **Effort:** 1 h

### Phase 1 — Supabase schema + RLS

- Create the Supabase project (free tier).
- Run a single SQL migration that creates: `profiles`, `reports`, `comments`, `saves`, the auth trigger that creates `profiles` on signup, and the storage bucket `report-photos` with its policy.
- Enable RLS on every table and apply the policies from `plan.md`.
- **Deliverable:** schema deployed; `supabase db diff` clean; manual SQL smoke test inserts and rejects as expected.
- **Effort:** 2 h

### Phase 2 — Auth flow (cédula)

- Build `/lib/supabase/client.ts` (browser) and `/lib/supabase/server.ts` (RSC cookie client).
- Build `/register` and `/login` pages with Spanish copy, using the synthetic `{cedula}@example.net` email.
- Disable Supabase email confirmation at the project level.
- Build `/profile` for editing `display_name`, `real_phone`, `real_email`.
- Header nav reflects auth state (login/logout).
- **Deliverable:** end-to-end register → login → edit profile works locally.
- **Effort:** 3 h

### Phase 3 — Report creation

- Build `/components/map/ReportMap.tsx` (Leaflet, client component, OSM tiles).
- Build `/components/forms/ReportForm.tsx` with photo preview, map pin drop, "publicar identificado / anónimo" toggle.
- Build `/report/new` page that uses the form and uploads directly to the `report-photos` bucket, then inserts the `reports` row.
- **Deliverable:** logged-in user can publish identified; logged-out user can publish anonymous; photo appears on detail page.
- **Effort:** 4 h

### Phase 4 — Browse + detail

- Build `/reports` list page (grid of cards, no pagination in MVP — Supabase returns everything).
- Build `/report/[id]` detail page (photo, map, contact, comments section).
- Add `app/reports/loading.tsx` and `app/reports/not-found.tsx`.
- **Deliverable:** public user can browse and view every report.
- **Effort:** 3 h

### Phase 5 — Comments

- Build `/components/forms/CommentForm.tsx` with anonymous toggle.
- Insert comments on `/report/[id]` via Supabase client.
- **Deliverable:** both anonymous and identified comments appear in real time after submit.
- **Effort:** 2 h

### Phase 6 — Saves / bookmarks

- Add a "Guardar" button on `/report/[id]` visible only to logged-in users.
- Build `/profile` "Guardados" tab listing saved reports.
- **Deliverable:** login → save → log out → log in → saved list intact.
- **Effort:** 2 h

### Phase 7 — Polish

- Empty states (no reports, no comments, no saves).
- 404 page in Spanish.
- Loading skeletons.
- Mobile QA at 375 px.
- Lighthouse pass on `/reports` and `/report/[id]`.
- **Deliverable:** no console errors, no broken layouts.
- **Effort:** 3 h

### Phase 8 — Deploy

- Push to GitHub.
- Import repo into Vercel.
- Add env vars; promote to production.
- Run the production smoke test from `plan.md` success criterion 8.
- **Deliverable:** public URL reachable; smoke test passes.
- **Effort:** 1 h

**Total estimated effort: 21 h.**

## Milestones

| Milestone | Criterion | Phases |
|---|---|---|
| **M1 — Auth works** | A user can register, log in, and edit their profile on production. | 0, 1, 2 |
| **M2 — First report published** | A logged-in user publishes a report with a photo and map pin; it appears on `/reports`. | 3 |
| **M3 — Public browsing** | An anonymous visitor can browse and open every report. | 4 |
| **M4 — Community comments** | Both anonymous and identified users can comment on any report. | 5 |
| **M5 — Personal saves** | A logged-in user can save and view a list of saved reports. | 6 |
| **M6 — MVP live** | Production URL passes the full smoke test from `plan.md` success criterion 8. | 7, 8 |

## SDD workflow alignment

Each phase produces one or more SDD artifacts before any code is written. For MVP speed, multiple small changes inside one phase collapse into a single batched artifact, but each batched `tasks` artifact still lists every change.

| Phase | SDD artifact(s) | Notes |
|---|---|---|
| 0 | `tasks` (mechanical) | Skip proposal/spec/design; this is `create-next-app` boilerplate |
| 1 | `proposal` + `spec` + `design` + `tasks` | Schema is foundational; design must lock column types and RLS policies |
| 2 | `proposal` + `spec` + `design` + `tasks` | Auth flow has the synthetic-email trick; design documents the auth trigger |
| 3 | `proposal` + `spec` + `design` + `tasks` | Map component and storage upload paths both need design |
| 4 | `tasks` | Pure RSC reads; spec is implicit in `plan.md` |
| 5 | `tasks` | Small surface; spec is implicit |
| 6 | `tasks` | Small surface; spec is implicit |
| 7 | `proposal` + `tasks` | Polish changes can be one proposal with several small tasks |
| 8 | `tasks` | Vercel import + env config; one batch |

For every phase the orchestrator runs `apply` then `verify`, then the native review pipeline issues an RDD receipt before merge. The receipt links the PR to its `tasks` artifact.

## Out of scope / future (v2)

- "Found person" flow with a separate form and a `status` transition (`missing` → `found`).
- Email and SMS notifications when a saved report changes status.
- Authority dashboard: moderation queue, takedown, verified accounts.
- AI face matching across uploaded photos.
- Map clustering and high-density rendering for >1k pins.
- Full-text search by name, location, or description.
- Multi-language UI (Spanish + English at minimum).
- Password reset flow (currently manual DB intervention).
- Rate limiting and abuse reporting.
- Per-report expiration and archival policy.
- Custom domain, branding, logo, and analytics.
- Native mobile app (PWA install is a possible v2 middle step).

## Open questions

These need an answer from the project owner before the corresponding phase starts. Default answers are noted where a reasonable one exists; they only apply if you do not pick.

1. **Domain name on Vercel.** Default: `desaparecidos-<random>.vercel.app` for MVP. Custom domain deferred to v2.
2. **Branding.** Logo, palette, and typography. Default: no logo, neutral Tailwind palette, system font stack.
3. **Default map view.** Center and zoom level when no reports are visible. Default: Colombia center `(4.5709, -74.2973)`, zoom 6.
4. **Photo upload limits.** Max file size and accepted MIME types. Default: 5 MB; `image/jpeg`, `image/png`, `image/webp`.
5. **Comment moderation.** Pre-publish filter, post-publish report button, or none. Default: none in MVP; v2 adds a report button.
6. **Data retention.** How long to keep reports and comments after the emergency phase ends. Default: indefinite; revisit 90 days after MVP launch.
7. **Profile deletion / right to be forgotten.** Required by Colombian Habeas Data rules eventually. Default: out of scope for MVP, manual DB delete only.
8. **Public list of accounts.** Should `profiles.display_name` be public on identified reports and comments? Default: yes — it's the whole point of identified publishing.
9. **Anonymous report limits.** Should anonymous reports be capped per IP to reduce spam? Default: trust Supabase defaults; revisit if abused.
10. **Single status field.** Confirm MVP uses only `missing`; `found` and `resolved` stay in the enum but unused. Default: yes.
11. **Browser support floor.** Confirm we ship only evergreen Chromium/Safari/Firefox on mobile. Default: yes.
12. **Cédula format.** Validate length and digit-only? Default: digits only, 6–10 chars; no checksum (Colombian cédula checksums vary by type).
