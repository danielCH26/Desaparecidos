# Create Report Action Specification

## Purpose

Defines the Server Action `createReportAction` in `app/actions/reports.ts` — the authoritative write path for new `reports` rows. It receives `FormData`, re-validates every field, resolves identity from the session, and inserts one row.

## Requirements

### Requirement: Authoritative server-side validation

The action MUST re-validate every form field server-side, MUST NOT trust client-supplied identity or storage URL, and MUST return a Spanish error on validation failure. The `File` itself never enters the action — only the resulting URL string does, sidestepping the Server Action body limit.

#### Scenario: Invalid input is rejected

- GIVEN `FormData` with `person_name` empty, `person_age = 200`, `contact_phone = "123"`, or `last_known_lat = 95` / `last_known_lng = -200`
- WHEN the action runs
- THEN no insert is performed
- AND it returns `{ error: <Spanish message naming the offending field> }`

### Requirement: Publisher identity resolution

The action MUST resolve publisher identity from `supabase.auth.getUser()` only, MUST ignore any client-supplied publisher, and MUST set `published_by` to the session user only when both a session exists and the toggle was "Identificarme".

#### Scenario: Anonymous submission has NULL publisher

- GIVEN no session and toggle anónimo
- WHEN the action runs
- THEN `published_by = NULL`

#### Scenario: Identified submission binds to session user

- GIVEN session with `user.id = U` and toggle identificarme
- WHEN the action runs
- THEN `published_by = U`
- AND any client-supplied publisher is ignored

#### Scenario: Authenticated user choosing anónimo is anonymous

- GIVEN a session exists and toggle anónimo
- WHEN the action runs
- THEN `published_by = NULL`

### Requirement: Photo URL validation and ownership

The action MUST accept `person_photo_url` only when it starts with the project's `report-photos` public URL prefix AND its path begins with `report-photos/{auth.uid()}/`, and MUST reject any other origin.

#### Scenario: Trusted Supabase URL is accepted

- GIVEN URL starts with the `report-photos` prefix
- AND path begins with `report-photos/{auth.uid()}/`
- WHEN the action runs
- THEN the value is inserted

#### Scenario: Foreign URL is rejected

- GIVEN URL is `https://evil.example.com/x.jpg`
- WHEN the action runs
- THEN no insert occurs
- AND it returns `{ error: <Spanish message about photo> }`

#### Scenario: Anonymous submission omits photo

- GIVEN no session
- WHEN the action runs
- THEN `person_photo_url = NULL`

### Requirement: Insertion, redirect, and error handling

The action MUST insert via `.insert({ ... }).select('id').single()`, MUST redirect on success, and MUST return a Spanish error on failure without throwing.

#### Scenario: Successful insert redirects

- GIVEN validation passes and insert returns the new id
- WHEN the action completes
- THEN it redirects to `/` with a success flag

#### Scenario: Database failure returns error

- GIVEN the insert rejects (RLS, network, constraint)
- WHEN the failure is handled
- THEN it returns `{ error: <Spanish message> }`
- AND does NOT throw

### Requirement: Optional timestamp default

The action MUST default `last_seen_at` to the current server time when the form omits it.

#### Scenario: Empty last_seen_at is filled

- GIVEN `last_seen_at` is an empty string
- WHEN the action runs
- THEN the row's `last_seen_at` equals `now()` within a few seconds

### Requirement: Photo never crosses the action boundary

The Server Action MUST NOT receive the raw `File`; the form MUST upload to Supabase Storage on the client and pass only the URL string.

#### Scenario: Action body never contains file bytes

- GIVEN a client-side direct upload to `report-photos`
- WHEN the user submits
- THEN `FormData` contains a URL string for `person_photo_url`
- AND no `File` or `Blob` entry is present
