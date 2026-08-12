# Report Map Component Specification

## Purpose

Defines the `<ReportMap>` Client Component used by the report creation form to capture the geographic location of a missing person. This spec covers only the component's behavior and contract; the form that consumes it is specified separately.

## Requirements

### Requirement: Leaflet map rendering

The component MUST render an interactive Leaflet map using OpenStreetMap tile layers, centered on Colombia (`4.5709, -74.2973`) at zoom level 6 by default, and MUST expose this default view on every mount regardless of geolocation availability.

#### Scenario: Default Colombia view

- GIVEN a user opens a page that mounts `<ReportMap>` for the first time
- WHEN the component finishes initializing
- THEN the visible map center is within 50 km of `4.5709, -74.2973`
- AND the zoom level is 6

#### Scenario: Server-side rendering disabled

- GIVEN any page that imports `<ReportMap>` directly
- WHEN the page is rendered as a React Server Component
- THEN the import is rejected at the module level
- AND the consuming page MUST instead import it through `next/dynamic` with `{ ssr: false }`

### Requirement: Pin drop and drag interaction

The map MUST allow the user to pick a single location by clicking or dragging, and MUST emit the resulting coordinates through an `onPick` callback every time the picked location changes.

#### Scenario: Click drops a marker

- GIVEN the map is mounted with no existing pin
- WHEN the user taps or clicks any point on the map
- THEN a single `<Marker>` is rendered at that lat/lng
- AND `onPick` is called with `{ lat, lng }` matching the click point within 1 decimal place

#### Scenario: Dragging the marker updates the pin

- GIVEN a marker is already placed on the map
- WHEN the user finishes dragging the marker
- THEN the marker's position reflects the drop point
- AND `onPick` is called again with the new `{ lat, lng }`

#### Scenario: Marker popup language

- GIVEN a marker is placed on the map
- WHEN the marker is focused or tapped
- THEN its popup text reads "Arrastra para ajustar"

### Requirement: Mobile and touch usability

The component MUST remain usable at a 375 px viewport width, MUST NOT hijack the page's vertical scroll on touch devices, and MUST ship its required CSS so that tiles and controls render correctly.

#### Scenario: Page scroll is preserved

- GIVEN the map is embedded inside a scrollable form page on a touch device
- WHEN the user scrolls the page vertically over the map area
- THEN the page scrolls
- AND the map zoom does NOT change (`scrollWheelZoom` is disabled)

#### Scenario: Responsive fixed height

- GIVEN a viewport of 375 px width
- WHEN the map is rendered
- THEN its height is approximately 256 px (`h-64`)
- AND at viewport widths of 640 px or greater, its height is approximately 320 px (`h-80`)
- AND its width fills its container (`w-full`)

#### Scenario: Leaflet CSS and icon assets are present

- GIVEN the component is mounted
- WHEN the browser loads the page
- THEN a stylesheet from `leaflet/dist/leaflet.css` is included
- AND the default marker icon assets are bundled locally so they do NOT 404 under the Next.js bundler

### Requirement: Coordinate emission contract

The component MUST accept an `onPick` callback prop and MUST call it with an object containing numeric `lat` and `lng` properties whenever the picked location changes.

#### Scenario: Initial pick emits coordinates

- GIVEN `<ReportMap onPick={fn} />` is mounted
- WHEN the user places a pin for the first time
- THEN `fn` is called exactly once with `{ lat: <number>, lng: <number> }`
- AND both values are finite numbers within valid geographic ranges
