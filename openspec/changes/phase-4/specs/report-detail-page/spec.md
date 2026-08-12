# report-detail-page Specification

## Purpose

Defines `/report/[id]` — the public React Server Component route that renders the full record for a single missing-person report, including contact details, publisher attribution, and a read-only map pin. It is the canonical destination of every `<ReportCard>` link and is reachable anonymously.

## Requirements

### Requirement: Public Server-Component rendering

The page MUST be a React Server Component at `app/report/[id]/page.tsx`, MUST accept `params` asynchronously (`await params.id`), and MUST resolve the row via `createSupabaseServerClient()`. The rendered UI MUST NOT differ between anonymous and authenticated visitors except for publisher attribution.

#### Scenario: Anonymous request resolves a row

- GIVEN an anonymous request to `/report/{valid-id}`
- WHEN the page renders
- THEN the response is HTTP 200 with the full detail HTML

### Requirement: Single-row fetch with profile join

The query MUST `.select('*, profiles:published_by(display_name)').eq('id', params.id).single()` and MUST tolerate a NULL `profiles` join when the report is anonymous.

#### Scenario: Identified publisher profile is joined

- GIVEN report `R` has `published_by = U` and `profiles(U).display_name = "Ana"`
- WHEN the page renders
- THEN the fetched row exposes `profiles.display_name` equal to `"Ana"`

#### Scenario: Anonymous report has NULL profile

- GIVEN report `R` has `published_by = NULL`
- WHEN the page renders
- THEN the fetched row's `profiles` is NULL

### Requirement: Missing-row 404

When `.single()` resolves no row, the page MUST call `notFound()` so Next.js renders `app/report/[id]/not-found.tsx` with an HTTP 404 status.

#### Scenario: Unknown UUID

- GIVEN a request to `/report/00000000-0000-0000-0000-000000000000`
- WHEN the page renders
- THEN Next.js returns HTTP 404 with Spanish not-found content
- AND a link back to `/reports` is present

### Requirement: Hero photo with initials fallback

The page MUST render the person's photo when `person_photo_url` is present and MUST render an initials-in-colored-circle placeholder (using the first letters of `person_name`) when it is not. The placeholder MUST occupy the same hero region.

#### Scenario: Photo available

- GIVEN `person_photo_url = "https://.../photo.jpg"`
- WHEN the page renders
- THEN a plain `<img>` with `alt` text of the person's name is rendered

#### Scenario: Photo missing

- GIVEN `person_photo_url = NULL` and `person_name = "Ana Pérez"`
- WHEN the page renders
- THEN a colored circle with the initials "AP" is rendered
- AND no broken image appears

### Requirement: Core fields rendering

The page MUST render `person_name`, an age badge when `person_age` is present, `last_seen_at` formatted in Spanish when present, and `last_known_address` when present. All copy MUST be in Spanish with no emoji.

#### Scenario: Optional fields omitted gracefully

- GIVEN `person_age = NULL` and `last_known_address = NULL`
- WHEN the page renders
- THEN no empty age or address label appears
- AND the map pin still shows the location

### Requirement: Read-only embedded map

The page MUST render a `<ReportMap>` instance in read-only mode — non-draggable marker, no click-to-pick, no edit label, no borrar-pin control — centered on `last_known_lat`/`last_known_lng`.

#### Scenario: Map is non-interactive

- GIVEN a detail page renders
- WHEN the user clicks anywhere on the embedded map
- THEN no marker is dropped or moved
- AND no edit UI is rendered

### Requirement: Contact details visibility

The page MUST render `contact_phone` for every report and MUST render `contact_email` only when present. Both MUST be plain text — no `mailto:` or `tel:` links in MVP.

#### Scenario: Email column absent

- GIVEN `contact_email = NULL`
- WHEN the page renders
- THEN only the phone section is visible

#### Scenario: Email column present

- GIVEN `contact_email = "ana@example.com"`
- WHEN the page renders
- THEN both phone and email sections are visible
- AND neither is a clickable link

### Requirement: Publisher attribution

The page MUST render attribution that reads "Reportado por {display_name}" when `profiles.display_name` is present and MUST render "Publicado como anónimo" otherwise. Each variant MUST be paired with `created_at` formatted in Spanish via `Intl.DateTimeFormat('es')`.

#### Scenario: Identified publisher

- GIVEN `profiles.display_name = "Ana"`
- WHEN the page renders
- THEN the attribution reads "Reportado por Ana" followed by the Spanish-formatted `created_at`

#### Scenario: Anonymous publisher

- GIVEN `profiles` is NULL
- WHEN the page renders
- THEN the attribution reads "Publicado como anónimo" followed by the Spanish-formatted `created_at`

### Requirement: Status badge

The page MUST render a visible Spanish status badge reflecting the row's `status`. The badge MUST read "Desaparecido" when `status = "missing"`.

#### Scenario: Default status

- GIVEN `status = "missing"`
- WHEN the page renders
- THEN the badge reads "Desaparecido"

### Requirement: Comments placeholder

The page MUST render a "Los comentarios estarán disponibles próximamente" placeholder where the comments list will live in Phase 5. The placeholder MUST NOT issue any query against `comments`.

#### Scenario: No comments table touched

- GIVEN a detail page renders
- WHEN the network panel is inspected
- THEN no Supabase query targets `comments`

### Requirement: Loading skeleton

`app/report/[id]/loading.tsx` MUST render a Spanish, accessibility-friendly skeleton approximating the detail layout during the streaming response.

#### Scenario: Streaming fallback

- GIVEN the route is requested
- WHEN the data is still streaming
- THEN the detail-page skeleton is rendered before the resolved content

### Requirement: No edit or delete affordances

The page MUST NOT render edit or delete controls regardless of viewer identity. Those affordances are deferred to a future phase.

#### Scenario: Authenticated viewer cannot edit

- GIVEN the publisher is logged in and viewing their own report
- WHEN the page renders
- THEN no edit or delete button is shown
