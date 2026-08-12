# Proposal: Phase 4 — Browse + detail

## Intent

Phases 1–3 shipped schema, RLS, auth, and the report-creation write path, but nothing reads `reports` yet. Phase 4 delivers the public browse and detail pages so any visitor (anon or authed) can scan every missing-person report and open its full record. **M3 (Public browsing)** in the roadmap; the read path for Phase 5 (comments) and Phase 6 (saves).

## Scope

**In**: `/reports` list (RSC, grid of `<ReportCard>`), `/report/[id]` detail (RSC, hero + contact + publisher + static map + comments placeholder), `<ReportCard>` component, `loading.tsx` + `not-found.tsx` for both routes, `<ReportMap readOnly>` refactor.

**Out**: comments (5), saves (6), polish (7), pagination (out of MVP), list-level map, search/filter, map clustering, publisher edit/delete.

## Capabilities

### New Capabilities

- **`reports-list-page`** — `app/reports/page.tsx` RSC. `createSupabaseServerClient()` → `.from('reports').select('id, person_name, person_age, person_photo_url, last_known_lat, last_known_lng, last_known_address, status, created_at').eq('status', 'missing').order('created_at', { ascending: false })`. **Contact columns MUST NOT be selected** (privacy). Tailwind grid of `<ReportCard>`s. Empty state: "Aún no hay reportes publicados" + CTA → `/report/new`. Loading: `app/reports/loading.tsx`. Route 404: `app/reports/not-found.tsx` (separate from data-empty).
- **`report-detail-page`** — `app/report/[id]/page.tsx` RSC. `await params` then `.select('*, profiles:published_by(display_name)').eq('id', params.id).single()`. `notFound()` on miss → `app/report/[id]/not-found.tsx`. Hero photo (or initials placeholder), name + age, `last_seen_at`, address, **read-only `<ReportMap>`**, `contact_phone` (always), `contact_email` (if present), publisher attribution + `created_at`, status badge, comments placeholder. Loading: `app/report/[id]/loading.tsx`.
- **`report-card-component`** — `components/ui/ReportCard.tsx` (Server Component). Accepts `ReportSummary` — typed subset of `reports` row that **structurally excludes `contact_phone` + `contact_email`** (privacy). `<Link>` to detail, thumbnail or initials-in-colored-circle, name, age badge, truncated address (~30 chars), time-ago via `Intl.RelativeTimeFormat('es')`, status badge. ≥44 px tap area. Spanish, no emoji.

### Modified Capabilities

- **`report-map-component`** — additive `readOnly?: boolean` prop (default `false`). When `true`: non-draggable marker, no `MapEvents` click, hide "(borrar pin)" + edit label. Existing `value`/`onChange` unchanged → create-form call site untouched.

## Approach

Server reads via `createSupabaseServerClient()` (anon + cookies); no RLS change. `ReportSummary` lives next to the card so privacy is **structural**. Time via `Intl.RelativeTimeFormat` (no `date-fns`). Profile join in one query. Plain `<img width height alt>` (Storage URLs aren't `next/image`-eligible in MVP). 404 semantics: route-level `not-found.tsx` for unmatched routes; data-empty renders inline; detail uses `notFound()` for missing id.

## Affected Areas

| Area | Impact |
|------|--------|
| `app/reports/page.tsx` | Replace placeholder with RSC + grid |
| `app/reports/{loading,not-found}.tsx` | New |
| `app/report/[id]/{page,loading,not-found}.tsx` | New |
| `components/ui/ReportCard.tsx` | New (Server Component) |
| `components/map/ReportMap.tsx` | Modified — additive `readOnly` prop |

## Privacy Stance (locked)

Public RLS exposes `contact_phone` + `contact_email`. **List MUST NOT show contact info** — only detail after click. Enforced structurally: (1) list `select()` omits contact columns; (2) `ReportSummary` has no contact fields. A row spread into the card yields a TypeScript error, not a privacy leak.

## Open Questions (defaults if no answer)

1. **Map on detail** → read-only map.
2. **Comments placeholder** → "Los comentarios estarán disponibles próximamente".
3. **Pagination threshold** → v2 concern; no action now. Index already in place.
4. **"Mostrando X reportes"** → no; cards communicate the count.
5. **Detail publish attribution** → both: "Reportado por {display_name}" when authed, "Publicado como anónimo" otherwise; each with `created_at`.

## Risks

| Risk | Mitigation |
|------|------------|
| List leaks phones via public contact columns | Privacy stance + `ReportSummary` type omits contact fields |
| All-reports render slow past ~100 rows | Acceptable MVP; v2 concern; index in place |
| `<ReportMap readOnly>` refactor breaks create form | Additive prop; default `false`; smoke-test `/report/new` |
| Profile join null for anonymous reports | LEFT JOIN; render "Publicado como anónimo" branch |
| Grid breaks at 375 px | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`; ≥44 px tap area |

## Rollback Plan

Purely additive + one additive map prop. Revert commits → Phase 3 state.

## Success Criteria

- [ ] `build && lint && type-check` clean
- [ ] Anonymous `/reports` shows grid of every `status='missing'` report, newest-first; no contact info on cards; empty state renders when no rows; `loading.tsx` skeleton during SSR
- [ ] Card click opens `/report/{id}` with photo/initials, name, age, address, read-only map pin, contact phone + email, publisher attribution, `created_at`
- [ ] `/report/{nonexistent-uuid}` renders Spanish `not-found.tsx` with back link
- [ ] Anon and authed see the same detail UI (no edit/delete); detail map is non-interactive
- [ ] Comments section shows placeholder — no real comments; Spanish copy, no emoji, ≥44 px targets, mobile-first at 375 px
- [ ] `/report/new` smoke still works after map refactor
