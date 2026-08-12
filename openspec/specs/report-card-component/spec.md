# report-card-component Specification

## Purpose

Defines `<ReportCard>`, the Server Component tile used by `/reports` to render a single missing-person summary. The component exists to make list scanning fast and to enforce privacy structurally: its `ReportSummary` prop type excludes contact fields so any attempt to spread a full row into a card fails at the type system rather than at runtime.

## Requirements

### Requirement: Server Component tile

`<ReportCard>` MUST be implemented as a React Server Component at `components/ui/ReportCard.tsx` and MUST NOT carry a `'use client'` directive.

#### Scenario: Module has no client directive

- GIVEN the component source
- WHEN read
- THEN the file's first non-comment line is NOT `'use client'`

### Requirement: Privacy-preserving prop type

The component MUST accept a `ReportSummary` prop whose TypeScript type structurally excludes `contact_phone` and `contact_email`. The type MUST be declared in the same file as the card so the privacy contract travels with the component.

#### Scenario: TypeScript rejects full row spread

- GIVEN a developer writes `<ReportCard {...fullRow} />` where `fullRow` includes `contact_phone`
- WHEN the TypeScript compiler runs
- THEN it MUST report an excess-property error

#### Scenario: TypeScript accepts ReportSummary

- GIVEN a developer writes `<ReportCard summary={row} />` where `row: ReportSummary`
- WHEN the TypeScript compiler runs
- THEN no error is reported

### Requirement: Link to detail

The card's outermost interactive element MUST be a Next.js `<Link>` to `/report/{id}` where `{id}` is the report's UUID.

#### Scenario: Click navigates

- GIVEN a card with `id = R`
- WHEN the user clicks any visible area of the card
- THEN the browser navigates to `/report/R`

### Requirement: Photo or initials fallback

The card MUST render `person_photo_url` as a thumbnail (plain `<img>` with explicit `width`, `height`, and `alt`) when present, and MUST render an initials-in-colored-circle placeholder when not. Storage URLs are not `next/image`-eligible in MVP, so a plain `<img>` is required.

#### Scenario: Photo rendered

- GIVEN `person_photo_url = "https://.../photo.jpg"`
- WHEN the card renders
- THEN a thumbnail `<img>` appears with explicit `width` and `height` attributes

#### Scenario: Initials placeholder rendered

- GIVEN `person_photo_url = NULL` and `person_name = "Ana Pérez"`
- WHEN the card renders
- THEN a colored circle with the initials "AP" appears
- AND no broken image appears

### Requirement: Visible summary fields

The card MUST render the person's name, an age badge when `person_age` is present, the truncated address (about 30 characters) when present, the Spanish relative timestamp, and the status badge. All copy MUST be in Spanish with no emoji.

#### Scenario: Address truncated

- GIVEN `last_known_address = "Calle 123 #45-67, Barrio Largo, Ciudad"`
- WHEN the card renders
- THEN the visible address is at most ~30 characters followed by an ellipsis

#### Scenario: Age omitted when null

- GIVEN `person_age = NULL`
- WHEN the card renders
- THEN no age badge appears

### Requirement: Relative timestamp

The card MUST render `created_at` as a Spanish relative-time string via `Intl.RelativeTimeFormat('es')`. The component MUST NOT depend on `date-fns` or any other date library.

#### Scenario: Hours ago formatting

- GIVEN `created_at = now() - 2h`
- WHEN the card renders
- THEN the relative timestamp includes "horas"

#### Scenario: Days ago formatting

- GIVEN `created_at = now() - 3d`
- WHEN the card renders
- THEN the relative timestamp includes "días"

### Requirement: Touch target and accessibility

The card's interactive area MUST be at least 44 by 44 CSS pixels, MUST expose a meaningful `alt` for any image, and MUST be reachable by keyboard with a visible focus indicator.

#### Scenario: 44 px tap area

- GIVEN a card renders at 375 px
- WHEN the DOM is inspected
- THEN the clickable region's bounding box is at least 44×44 px

#### Scenario: Keyboard focus

- GIVEN a keyboard user tabs through the page
- WHEN focus reaches the card
- THEN a visible focus indicator is rendered
