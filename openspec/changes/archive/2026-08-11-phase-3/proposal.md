# Proposal: Phase 3 — Report creation

## Intent

Phases 1–2 shipped the schema, RLS, storage bucket, and the cédula-based auth flow. Nothing yet writes a `reports` row. Phase 3 delivers the single write path of the whole product: a mobile-first Spanish form at `/report/new` that lets an authenticated user publish an identified report with a photo, and a logged-out user publish an anonymous report without one. Phases 4–6 (browse, detail, comments, saves) all read rows that only this phase can create.

## Scope

**In**: `components/map/ReportMap.tsx` (Leaflet + OSM, client-only), `components/forms/ReportForm.tsx` (photo preview, pin drop, anónimo/identificarme toggle), `app/report/new/page.tsx` (RSC shell), `app/actions/reports.ts` (`createReportAction`), Leaflet dependencies + CSS wiring.

**Out**: `/report/[id]` detail and `/reports` list (both **deferred to Phase 4** — see Q4), comments (5), saves (6), polish (7), reverse geocoding, image moderation, client-side compression, multiple photos, status transitions, email/phone verification.

## Capabilities

### New Capabilities

- **`report-map-component`** — `<ReportMap>` Client Component. Colombia-centered default (`4.5709, -74.2973`, zoom 6), OSM tiles with attribution. Click drops a `<Marker>`; marker is `draggable` and fires the same callback on `dragend`; popup reads "Arrastra para ajustar". Emits `{ lat, lng }` via an `onPick` prop. Imported through `next/dynamic({ ssr: false })` because Leaflet touches `window` at module scope. Fixed responsive height (`h-64 sm:h-80`, `w-full`) so it behaves at 375 px; `scrollWheelZoom={false}` so the page still scrolls on touch.

- **`report-form-component`** — `<ReportForm>` Client Component. Fields: `person_name` (required), `person_age` (optional, 0–130), `last_known_address` (optional textarea), `last_seen_at` (optional `datetime-local`), `contact_phone` (required, 7–20 chars), `contact_email` (optional), `last_known_lat`/`last_known_lng` (hidden, populated by the map, required). Radio toggle "Publicar como anónimo" / "Identificarme" defaulting to anónimo (Q3). Photo `<input type="file">` rendered **only** in the identificarme branch, `accept="image/jpeg,image/png,image/webp"`, 5 MB client-side cap, `URL.createObjectURL` preview with `revokeObjectURL` on change/unmount. Spanish labels, no emoji, ≥44 px touch targets, `useFormState` + `useFormStatus` matching the Phase 2 form idiom.

- **`create-report-action`** — `app/actions/reports.ts`. Receives `FormData`; re-validates every field server-side (authoritative); resolves identity via `supabase.auth.getUser()`; sets `published_by = user.id` only when a session exists **and** the toggle says identificarme, else `NULL`; inserts via `.insert({...}).select('id').single()`; redirects on success; returns `{ error }` in Spanish on failure. Never trusts a client-supplied `published_by` or `person_photo_url` origin (see Critical Couplings).

- **`report-new-page`** — `app/report/new/page.tsx`, Server Component. Calls `supabase.auth.getUser()`; if authenticated, fetches `profiles.display_name` for a greeting and passes `{ isAuthenticated, displayName }` to the form. Anonymous requests render the same form with the identificarme branch disabled and a link to `/login?redirect=/report/new`.

### Modified Capabilities

None. `database-schema`, `row-level-security`, `photo-storage`, and `auth-trigger` are complete and unchanged.

## Approach

1. **Dependencies** — add `leaflet`, `react-leaflet`, `@types/leaflet`. Import `leaflet/dist/leaflet.css` in the map component; ship the marker icon explicitly (`L.icon` with local assets) because the default icon URLs break under Next's bundler.
2. **Photo upload happens client-side, before the Server Action** (Q5). The form uploads to `report-photos` with the browser client (which carries the user's session, so `owner` is set to `auth.uid()` and the INSERT policy passes), takes `getPublicUrl(path)`, and appends the resulting **URL string** — not the `File` — to the `FormData` sent to the Server Action. This sidesteps the Next.js Server Action body limit entirely (see Risks) and is the only shape the storage RLS accepts.
3. **Path** — `{auth.uid()}/{Date.now()}-{crypto.randomUUID()}.{ext}`. The user-UUID prefix is required by decision, and is what Phase 4+ cleanup will key on.
4. **Two-step failure handling** — if the upload succeeds but the insert fails, the action returns a Spanish error and the orphaned object is left in the bucket. Acceptable for MVP at $0; noted for a later sweeper.
5. **Location is required** — submit is blocked until the map has a pin. Server re-checks lat ∈ [-90, 90], lng ∈ [-180, 180].
6. **`last_seen_at`** — server fills `now()` when the field is absent.

## Affected Areas

| Area | Impact |
|------|--------|
| `components/map/ReportMap.tsx` | New |
| `components/forms/ReportForm.tsx` | New |
| `app/report/new/page.tsx` | New |
| `app/actions/reports.ts` | New |
| `package.json` | Modified — leaflet, react-leaflet, @types/leaflet |
| `app/globals.css` or map component | Modified — Leaflet CSS + icon fix |

## Findings that contradict the brief (confirm before spec)

1. **No `contact_phone` CHECK constraint exists.** `supabase/migrations/0001_init.sql:33` is a bare `contact_phone text NOT NULL`. The 7–20 char rule cited as a "Phase 1 CHECK" is not in the database. Proposal treats 7–20 as an **application-layer** rule enforced in the form and the Server Action. Adding the DB constraint would be a Phase 1 spec change — out of scope here unless you want it.
2. **No `person_age` range constraint exists either** (`person_age int`, line 27). 0–130 is likewise application-layer only.
3. **The storage policy is owner-based, not path-based.** `0001_init.sql:277` reads `bucket_id = 'report-photos' AND owner = auth.uid()`, not `(storage.foldername(name))[1] = auth.uid()::text`. The `{uid}/...` path prefix is therefore a **convention**, not an enforced invariant — a user could upload to any path. We keep the convention (it's what Phase 4 will assume), but the enforcement claim in the brief is inaccurate. Flagging in case you want the path predicate added.

## Open Questions (default if no answer)

1. **Client-side photo compression** → **no**. Enforce the 5 MB cap only. Single photo per report; compression is code we don't need at MVP.
2. **Map default view** → **Colombia center**, not `navigator.geolocation`. Predictable, no permission prompt, no friction on the one screen that must not fail.
3. **Toggle default** → **anónimo**. Privacy-first; the user opts in to identificarme to attach a photo.
4. **Post-submit redirect** → **`/`** with a success flag, because we are deferring `/report/[id]` to Phase 4. Phase 3 is already a full 4 h; adding detail + list pages would push it past 6 h and blur the phase boundary. Switch the redirect to `/report/[id]` in Phase 4 — one-line change. **This is the scope question worth an explicit answer.**
5. **Upload location** → **client-side direct upload** for authenticated users. Required by the storage RLS (the anon-key server client can upload with the session cookie, but routing a 5 MB file through a Server Action hits the body limit first). Anonymous users never upload.

## Critical Couplings

- The browser client must carry the session at upload time, or `owner` is NULL and the INSERT policy rejects it. Re-check `getUser()` client-side before uploading.
- `published_by` is resolved **server-side** from `auth.uid()`. A client-supplied value must be ignored, or the `(published_by IS NULL) OR (published_by = auth.uid())` policy is the only thing standing between a forged report and a real user's name.
- `person_photo_url` arrives from the client as a string. Validate it starts with the project's Supabase storage public URL prefix before inserting.
- Leaflet must never be imported into a Server Component; `next/dynamic({ ssr: false })` at the boundary.
- UUID-everywhere: no cédula in the storage path, in `published_by`, or in any client-side query. Phase 2's synthetic-email helper is not used in this phase.

## Risks

| Risk | Mitigation |
|------|------------|
| Server Action body limit (~1 MB default) vs. 5 MB photos | Avoided by design — the File never enters the Server Action; only the resulting URL string does |
| Leaflet default marker icons 404 under the Next bundler | Explicit `L.icon` with locally imported assets; verify at 375 px |
| Map unusable on touch: pinch-zoom fights page scroll | `scrollWheelZoom={false}`, fixed responsive height, manual test on a 375 px viewport |
| Upload succeeds, insert fails → orphaned object | Return Spanish error; accept the orphan in MVP; note a cleanup sweeper for later |
| Anonymous user toggles identificarme and hits upload RLS | Identificarme branch disabled entirely for anon; link to `/login?redirect=/report/new` |
| Phase creep via detail/list pages | Explicitly deferred to Phase 4 (Q4) |

## Rollback Plan

Purely additive: no migration, no change to existing routes or specs. Revert the commits and remove the four new files plus the Leaflet dependencies → Phase 2 state.

## Success Criteria

- [ ] `build && lint && type-check` clean
- [ ] Logged-out user publishes an anonymous report; row lands with `published_by IS NULL` and `person_photo_url IS NULL`
- [ ] Logged-in user publishes an identified report with a photo; `published_by = auth.uid()`, object stored under `{uid}/...`, public URL resolves
- [ ] Submitting without a map pin is blocked client-side and rejected server-side
- [ ] `person_age` outside 0–130 and `contact_phone` outside 7–20 chars are rejected by the Server Action, not just the browser
- [ ] Form is usable and submittable at 375 px with the on-screen keyboard; map pin can be dropped and dragged by touch
- [ ] All copy in Spanish, no emoji, every input has a paired `<label>`, ≥44 px targets
- [ ] A photo >5 MB or of a disallowed MIME type is refused before upload
