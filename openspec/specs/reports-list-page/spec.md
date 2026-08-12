# reports-list-page Specification

## Purpose

Defines `/reports` — the public React Server Component route that lists every active missing-person report as a grid of `<ReportCard>` tiles. The route exists so anonymous and authenticated visitors can scan recent reports without authentication and click through to a single report's detail page.

## Requirements

### Requirement: Public Server-Component rendering

The page MUST be a React Server Component at `app/reports/page.tsx` reachable without authentication. It MUST fetch its data via `createSupabaseServerClient()` from `@/lib/supabase/server` and MUST render only on the server.

#### Scenario: Anonymous request returns the grid

- GIVEN an anonymous request to `/reports`
- WHEN the page renders
- THEN the response is HTTP 200 with the report grid HTML

### Requirement: Privacy-preserving report query

The query MUST select only the columns safe to expose on a public list — `id, person_name, person_age, person_photo_url, last_known_lat, last_known_lng, last_known_address, status, created_at` — and MUST NOT select `contact_phone` or `contact_email` from `reports`.

#### Scenario: Contact columns are never selected

- GIVEN the page query runs
- WHEN the Supabase request is inspected
- THEN the `select` string contains none of `contact_phone`, `contact_email`

### Requirement: Active-only newest-first ordering

The query MUST filter rows where `status = 'missing'` and MUST order them by `created_at` descending so the most recent report appears first. The query MUST NOT paginate in MVP.

#### Scenario: Newest-first ordering

- GIVEN several reports with mixed `created_at` and at least one with `status != 'missing'`
- WHEN the page renders
- THEN cards render in `created_at DESC` order
- AND no non-`missing` row is rendered

### Requirement: Card grid layout

The page MUST render the reports inside a Tailwind grid of `<ReportCard>` tiles using `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`, MUST NOT introduce horizontal scroll at a 375 px viewport, and MUST NOT use a list-level map.

#### Scenario: Responsive grid at 375 px

- GIVEN a 375 px viewport
- WHEN the grid renders
- THEN the document does NOT overflow horizontally
- AND tiles stack in a single column
- AND no Leaflet map container appears above the cards

### Requirement: Empty-state messaging

When the query returns zero rows, the page MUST render the inline message "Aún no hay reportes publicados" together with a visible link or CTA to `/report/new`. The empty state MUST be distinguishable from the route-level 404.

#### Scenario: No rows yet

- GIVEN zero `status = 'missing'` rows exist
- WHEN the page renders
- THEN the empty-state message is visible
- AND a CTA pointing to `/report/new` is present

### Requirement: Loading skeleton

The page MUST provide `app/reports/loading.tsx` that renders a Spanish, accessibility-friendly skeleton approximating the grid shape during the streaming response.

#### Scenario: Streaming fallback

- GIVEN the route is requested
- WHEN the data is still streaming
- THEN the loading skeleton is rendered before the resolved grid

### Requirement: Route-level not-found

`app/reports/not-found.tsx` MUST render a Spanish message for unmatched routes under `/reports/*` and MUST be separate from the empty-state UI rendered when the data set is empty.

#### Scenario: Unmatched sub-route

- GIVEN a request to `/reports/this-route-does-not-exist`
- WHEN Next.js resolves the route
- THEN `not-found.tsx` renders
- AND the message is in Spanish

### Requirement: Locale and accessibility

All visible copy on the page MUST be in Spanish, MUST NOT contain emoji, and the grid MUST be keyboard-navigable with a visible focus indicator on each card.

#### Scenario: Spanish copy and keyboard focus

- GIVEN the page renders for any data state
- WHEN the visible text and DOM are inspected
- THEN every label, heading, button, link, and empty-state message is in Spanish
- AND no emoji characters appear
- AND a keyboard user can Tab into the grid with a visible focus indicator on each card
