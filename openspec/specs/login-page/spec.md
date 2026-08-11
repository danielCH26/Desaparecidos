# login-page Specification

## Purpose

Lets an existing user authenticate with their `cédula` and password through the synthetic-email trick, set the auth cookie via the server client, and land somewhere useful afterward.

## Requirements

### Requirement: /login route exists and is anonymous-accessible

`app/login/page.tsx` MUST be a Server Component shell rendering a `<LoginForm />` Client Component. The page MUST be reachable anonymously.

#### Scenario: anonymous user loads /login

- GIVEN an anonymous request
- WHEN the browser navigates to `/login`
- THEN the response MUST be HTTP 200 with the form HTML.

### Requirement: Form fields and validation

The form MUST have two inputs: `cedula` (text) and `password` (password). Client-side validation MUST run on submit:

- `cedula` MUST match `^\d{6,10}$`.
- `password` MUST be non-empty.

#### Scenario: invalid cédula format blocks submit

- GIVEN `cedula = "abc"`
- WHEN the user submits
- THEN the form MUST show "Cédula inválida" and MUST NOT call Supabase.

#### Scenario: empty password blocks submit

- GIVEN `password = ""`
- WHEN the user submits
- THEN the form MUST show "Ingresá tu contraseña" and MUST NOT call Supabase.

### Requirement: Successful sign-in sets the session cookie

On valid input the Client Component MUST call `supabase.auth.signInWithPassword({ email, password })` where `email = syntheticEmailFor(cedula)`. On success the response MUST set the Supabase session cookies via the server client.

#### Scenario: valid login establishes a session

- GIVEN a profile with `cedula = "12345678"` and password `abcdefgh` exists
- WHEN the user submits `cedula = "12345678"` + `password = "abcdefgh"` on `/login`
- THEN the response MUST include the Supabase auth cookies
- AND the browser MUST end up at `/`.

### Requirement: Post-login redirect honors ?redirect=

If the request URL has a `?redirect=` query parameter whose value starts with `/` and does NOT start with `//`, the Client Component MUST navigate to that path after a successful sign-in.

If the parameter is missing, malformed (does not start with `/`, or starts with `//`), or external, the Client Component MUST navigate to `/`.

#### Scenario: ?redirect=/profile is honored

- GIVEN the URL `/login?redirect=/profile`
- WHEN a valid login succeeds
- THEN the browser MUST end up at `/profile`.

#### Scenario: external redirect is ignored (open-redirect guard)

- GIVEN the URL `/login?redirect=https://evil.example.com`
- WHEN a valid login succeeds
- THEN the browser MUST end up at `/`, not the external domain.

#### Scenario: protocol-relative redirect is ignored

- GIVEN the URL `/login?redirect=//evil.example.com`
- WHEN a valid login succeeds
- THEN the browser MUST end up at `/`.

### Requirement: Authentication errors do not leak which field failed

For every failed sign-in — wrong password, unknown cédula, account locked, network — the form MUST display the same generic message: "Cédula o contraseña incorrecta". No English text, no per-field distinction.

#### Scenario: wrong password surfaces the generic message

- GIVEN `cedula = "12345678"` exists with the right password
- WHEN the user submits the wrong password
- THEN the form MUST display "Cédula o contraseña incorrecta".

#### Scenario: unknown cédula surfaces the same generic message

- GIVEN no profile has `cedula = "99999999"`
- WHEN the user submits `cedula = "99999999"` with any password
- THEN the form MUST display "Cédula o contraseña incorrecta".

#### Scenario: Supabase error is suppressed in the UI

- GIVEN the Supabase error string contains the word "email" (e.g., legacy noise)
- WHEN the user submits
- THEN the form MUST NOT show any English fragment to the user.

### Requirement: Accessibility guardrails

The form MUST satisfy the same a11y contract as register:

- Every input has a `<label htmlFor>` pairing.
- 44×44 px touch targets minimum.
- Enter in the password input MUST submit the form.
- No emoji in the UI; labels and messages in Spanish.

#### Scenario: Enter on password submits the form

- GIVEN the password input is focused
- WHEN the user presses Enter
- THEN the form MUST submit (Playwright).

#### Scenario: labels match inputs

- GIVEN the rendered HTML
- WHEN parsed for label/input pairing
- THEN every input MUST have a label.
