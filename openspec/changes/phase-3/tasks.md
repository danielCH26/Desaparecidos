# Phase 3 Tasks

## Task Breakdown

The 6 tasks below cover the full Phase 3 implementation. Each task has dependencies on prior tasks in the chain. Tasks are atomic and verify-able independently where possible.

### Setup (T1)

**T1** — Install Leaflet + react-leaflet + types
- *Orchestrator-action* | `package.json`, `package-lock.json`
- Run: `npm install leaflet react-leaflet && npm install --save-dev @types/leaflet`
- Verify: `npm ls leaflet react-leaflet` returns valid versions; `npm ls @types/leaflet` (dev) returns valid version
- Dependency: None
- Risk: None

### Map Component (T2)

**T2** — Create `components/map/ReportMap.tsx` (Client Component)
- *Orchestrator-action* | `components/map/ReportMap.tsx` (new)
- 'use client' + dynamic import strategy (Leaflet needs `window`)
- Default center: Colombia (`lat: 4.5709, lng: -74.2973, zoom: 6`)
- OpenStreetMap tile layer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Click handler drops a pin; drag to refine; callback `onLocationChange(lat, lng)`
- `scrollWheelZoom={false}` for mobile scroll safety
- Explicit `L.icon` with CDN URLs (Next bundler breaks default marker paths)
- Height: `h-72 md:h-96` (responsive)
- Verify: dev server renders `/report/new`; map visible with Colombia center; clicking drops a pin
- Dependency: T1
- Risk: LOW (well-trodden Leaflet patterns)

### Server Action (T3)

**T3** — Create `app/actions/reports.ts` (Server Action `createReportAction`)
- *Orchestrator-action* | `app/actions/reports.ts` (new)
- `'use server'` directive
- Authoritative server-side validation:
  - `person_name`: non-empty, 1–200 chars
  - `person_age`: optional, 0–130 if present
  - `last_known_lat`: -90 to 90
  - `last_known_lng`: -180 to 180
  - `last_seen_at`: optional ISO date
  - `contact_phone`: required, 7–20 chars
  - `contact_email`: optional, valid email if present
- Reads `isAnonymous` form field (boolean)
- Reads `photoUrl` form field (string, client-uploaded if present)
- `await createSupabaseServerClient()` then `supabase.auth.getUser()`
- If `isAnonymous=true`: `published_by=null`, reject any photoUrl
- If `isAnonymous=false`: requires authenticated user, `published_by=user.id`
- INSERT via `supabase.from('reports').insert({...}).select('id').single()`
- On success: `redirect('/')`
- On error: returns `{ error: '...' }` in Spanish
- Verify: TypeScript compiles; file has `'use server'` at top; all branch paths handled
- Dependency: None (independent of T1/T2)
- Risk: LOW

### Form Component (T4)

**T4** — Create `components/forms/ReportForm.tsx` (Client Component)
- *Orchestrator-action* | `components/forms/ReportForm.tsx` (new)
- 'use client'
- All form fields with Spanish labels per spec:
  - `person_name` (text, required)
  - `person_age` (number, optional)
  - `last_known_address` (textarea, optional)
  - `last_seen_at` (datetime-local, optional)
  - `contact_phone` (tel, required, placeholder "3001234567")
  - `contact_email` (email, optional)
  - `person_photo` (file input, accept `image/jpeg,image/png,image/webp`, max 5 MB)
  - `last_known_lat/lng` (hidden, populated by map)
- Toggle group: "Publicar como anónimo" (default) vs "Identificarme (con foto)"
- When anónimo: hide photo input entirely
- When identificarme: show photo input + preview (using `URL.createObjectURL`)
- Photo upload (if identifying): `await supabaseBrowserClient.storage.from('report-photos').upload(path, file)` with path `${auth.user.id}/${Date.now()}-${random}.jpg`
- After upload: get public URL via `.getPublicUrl(path)`
- Submit handler: orchestrates photo upload (if applicable) → collects all form fields → calls `createReportAction(formData)` via `useFormState`
- After successful submit (state.success): `router.push('/')`
- Client-side validation (HTML5 + JS for file size, MIME type, lat/lng range)
- Verify: renders all fields; clicking "Identificarme" shows photo input; submitting valid form calls Server Action
- Dependency: T2 (uses ReportMap) + T3 (calls createReportAction)
- Risk: MEDIUM (file upload + Server Action orchestration is delicate)

### Page (T5)

**T5** — Create `app/report/new/page.tsx` (Server Component shell)
- *Orchestrator-action* | `app/report/new/page.tsx` (new)
- Server Component
- Calls `await createSupabaseServerClient()` and `supabase.auth.getUser()`
- If authed: fetches `display_name` via `supabase.from('profiles').select('display_name').eq('id', user.id).single()`
- Imports ReportForm via standard import (Client Component on the client side)
- Heading "Publicar reporte de persona desaparecida"
- If authed: shows "Hola, {display_name}" greeting
- If anon: shows "Estás publicando como anónimo" tip
- Verify: `/report/new` returns 200, page contains greeting or tip
- Dependency: T4 (uses ReportForm)
- Risk: LOW

### Smoke Tests (T6)

**T6** — End-to-end smoke tests via REST API + curl
- *Orchestrator-action* | None (verification only)
- 6a. **Anon INSERT**: Use REST API with anon key, POST a `reports` row with `published_by=null`, verify 201
- 6b. **Anon INSERT with photoUrl**: same but include fake photoUrl, verify rejected (RLS)
- 6c. **Authed INSERT with photoUrl**: use service_role to simulate authed user (bypass RLS for test), insert with `published_by=<some-uuid>` and `person_photo_url=<some-url>`
- 6d. **Storage anon upload**: Use REST API to upload to `report-photos` with anon key, verify 401/415 (anon blocked)
- 6e. **Checklist**: `npm run build` green, `npm run lint` clean, `npm run type-check` clean
- 6f. **Curl GET**: `/report/new` returns 200; page contains form
- Verify: all 6 sub-tests pass; build green
- Dependency: T5 (page must exist) + T3 (action must exist)
- Risk: LOW

### Commit & Review (T7)

**T7** — Commit: `feat(reports): form with map, photo upload, and anonymous publishing`
- *Orchestrator-action* | All changed files
- NO AI attribution. Conventional commit format.
- Verify: `git status --porcelain | wc -l` shows clean except untracked openspec/changes/phase-3/ artifacts
- Dependency: T6
- Risk: LOW

## Dependency Chain

```
T1 → T2 → T4 → T5 → T6 → T7
            ↗
       T3 ──┘
```

Linear chain from install → map → form (depends on map and action) → page (depends on form) → smoke tests → commit.

## Review Workload Forecast

- **Estimated changed lines**: ~280 (4 new files: ReportMap ~70, ReportForm ~110, page ~30, reports.ts ~70; plus leaflet imports in package.json)
- **Chained PRs recommended**: No (single PR for cohesive report creation flow)
- **600-line budget risk**: Low (well under budget)
- **Decision needed before apply**: No — all decisions are locked from the proposal

## Action Type Summary

- **Orchestrator-actions**: T1, T2, T3, T4, T5, T6, T7 (7 of 7)
- **User-actions**: 0 (no signup needed; Supabase project already created; Auth flow already implemented)

## Persistence

- This file: `openspec/changes/phase-3/tasks.md`
- Engram: `sdd/phase-3/tasks` (observation to be created)
- Use `capture_prompt: false`

## Hard Rules

- DO NOT modify any source files (the existing Phase 1 and Phase 2 files are closed)
- DO NOT include Phase 5 (comments) or Phase 6 (saves) — those are out of scope for Phase 3
- DO NOT include /report/[id] detail page or /reports list page — those are deferred to Phase 4
- DO NOT install `playwright` — save for later test setup
- Every task MUST have a verify step
