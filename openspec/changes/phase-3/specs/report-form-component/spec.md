# Report Form Component Specification

## Purpose

Defines the `<ReportForm>` Client Component used to publish a missing-person report. The form supports anonymous and identified publishing, photo upload for identified reports, and a required map pin. The Server Action that persists the submission is specified separately.

## Requirements

### Requirement: Required and optional fields

The form MUST collect the fields needed to populate a `reports` row, MUST mark `person_name` and `contact_phone` as required, and MUST allow `person_age`, `last_known_address`, `last_seen_at`, and `contact_email` to be optional.

#### Scenario: Required fields block submission

- GIVEN `person_name` or `contact_phone` is empty
- WHEN the user submits
- THEN the browser blocks submission with a per-field validation message
- AND no Server Action is invoked

#### Scenario: Optional fields accept empty values

- GIVEN all optional fields are blank and required fields are valid
- WHEN the form is submitted
- THEN the Server Action is invoked
- AND empty fields are sent as empty strings or omitted

### Requirement: Anon / identified toggle

The form MUST present a radio toggle labeled "Publicar como anónimo" and "Identificarme", MUST default to anónimo, and MUST expose the current selection to the submission payload.

#### Scenario: Default selection is anonymous

- GIVEN a fresh mount
- WHEN the toggle renders
- THEN "Publicar como anónimo" is selected
- AND the photo upload input is NOT rendered

#### Scenario: Identifying reveals the photo field

- GIVEN the form is mounted
- WHEN the user selects "Identificarme"
- THEN a photo upload input becomes visible
- AND its label is in Spanish

### Requirement: Photo input constraints

When visible, the photo input MUST accept only JPEG, PNG, and WebP, MUST refuse files larger than 5 MB before any upload, and MUST show a `URL.createObjectURL` preview that is revoked on change and on unmount.

#### Scenario: Allowed photo produces a preview

- GIVEN a 2 MB JPEG is selected
- WHEN accepted
- THEN a preview renders via `URL.createObjectURL`
- AND no upload starts

#### Scenario: Oversized or wrong-type file is refused

- GIVEN an 8 MB JPEG or any non-JPEG/PNG/WebP file is selected
- WHEN the change handler runs
- THEN the file is rejected with a Spanish error
- AND no preview renders
- AND no upload starts

#### Scenario: Preview URL is revoked

- GIVEN a preview is rendered
- WHEN the form unmounts or the photo changes
- THEN `URL.revokeObjectURL` is called for the previous URL

### Requirement: Map pin is required before submission

The form MUST populate hidden `last_known_lat` and `last_known_lng` from the map's `onPick` and MUST block submission until both hold finite numbers in valid ranges.

#### Scenario: Submit blocked without a pin

- GIVEN the map has no marker
- WHEN the user submits
- THEN submission is blocked
- AND a Spanish message indicates the location is required

#### Scenario: Pin populates hidden fields

- GIVEN the map emits `{ lat: 4.7, lng: -74.1 }`
- WHEN the form's hidden state updates
- THEN `last_known_lat` and `last_known_lng` carry those values into `FormData`

### Requirement: Accessibility and copy

All copy MUST be in Spanish, MUST NOT contain emoji, every input MUST be paired with a `<label>`, and every control MUST have a touch target of at least 44 by 44 CSS pixels. The form MUST use `useFormState` and `useFormStatus` to surface server errors and pending state.

#### Scenario: Labels and touch targets pass

- GIVEN the form renders at 375 px
- WHEN the DOM is inspected
- THEN every input has an associated `<label>` in Spanish
- AND no emoji appears
- AND each control's tap area is at least 44 px

#### Scenario: Server error is surfaced

- GIVEN the Server Action returns `{ error: <Spanish message> }`
- WHEN the response is received
- THEN the error displays next to the form in Spanish
- AND the submit button is re-enabled
