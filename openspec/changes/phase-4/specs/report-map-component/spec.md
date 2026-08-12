# Delta for report-map-component

## ADDED Requirements

### Requirement: Read-only display mode

The component MUST accept an optional `readOnly?: boolean` prop. When `readOnly` is `true`, the component MUST render a marker at the supplied `value` coordinates as a non-draggable marker, MUST NOT attach a click handler that mutates state, MUST NOT render any editing UI ("Ubicación última conocida" label or "(borrar pin)" control), and MUST NOT invoke `onChange` for any user interaction with the map surface. When `readOnly` is omitted or `false`, the component MUST behave as before.

The existing `value` and `onChange` props MUST remain required and unchanged so the create-form call site continues to compile without edits.

#### Scenario: Default remains editable

- GIVEN `<ReportMap value={null} onChange={fn} />` (no `readOnly` prop)
- WHEN the component mounts
- THEN the user can click the map to drop a pin
- AND the user can drag an existing pin
- AND `onChange` is called when the pin changes

#### Scenario: Read-only shows marker at value

- GIVEN `<ReportMap value={{ lat: 4.7, lng: -74.1 }} onChange={fn} readOnly />`
- WHEN the component mounts
- THEN a single non-draggable marker appears at the supplied coordinates

#### Scenario: Read-only ignores clicks

- GIVEN `<ReportMap value={{ lat: 4.7, lng: -74.1 }} onChange={fn} readOnly />`
- WHEN the user taps or clicks any point on the map surface
- THEN no new marker is placed
- AND the existing marker does NOT move
- AND `onChange` is NOT called

#### Scenario: Read-only hides edit UI

- GIVEN `<ReportMap value={{ lat: 4.7, lng: -74.1 }} onChange={fn} readOnly />`
- WHEN the component renders
- THEN the "(borrar pin)" button is NOT in the DOM
- AND the "Ubicación última conocida" edit label is NOT in the DOM

#### Scenario: Prop signature is additive

- GIVEN a consumer passes only `value` and `onChange` (no `readOnly`)
- WHEN TypeScript compiles
- THEN no type error occurs
- AND the create-form call site continues to work without changes
