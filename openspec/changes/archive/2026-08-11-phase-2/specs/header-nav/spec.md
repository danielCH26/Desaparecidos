# header-nav Specification

## Purpose

Mounts the global navigation in `app/layout.tsx` so every route shows the right links for the current auth state. The component must avoid the common "flash of wrong nav" bug by hydrating with the server-resolved state and then subscribing to client-side auth changes.

## Requirements

### Requirement: Header mounted in the root layout

`app/layout.tsx` MUST render a `<Header />` component. The component MUST live in `components/ui/Header.tsx`.

#### Scenario: header is present on every route

- GIVEN any page rendered under the root layout (`/`, `/reports`, `/report/[id]`, `/register`, `/login`, `/profile`)
- WHEN the page HTML is parsed
- THEN a `<header>` element MUST be present (Playwright spot-check across the listed routes).

### Requirement: Server resolves initial auth state

`Header` MUST be a Server Component that calls `supabase.auth.getUser()` via the server client and passes the resulting `user` (or `null`) to the Client Component as a prop. This is the initial render — no client flash.

#### Scenario: anonymous initial render shows login/register

- GIVEN an anonymous request
- WHEN the layout renders for the first time
- THEN the HTML MUST contain `<a href="/login">Iniciar sesión</a>` and `<a href="/register">Registrarse</a>`.

#### Scenario: authenticated initial render shows profile/logout

- GIVEN an authenticated user
- WHEN the layout renders for the first time
- THEN the HTML MUST contain `<a href="/profile">Mi perfil</a>` and a logout form/button labeled "Cerrar sesión".

### Requirement: Client subscribes to auth state changes

The Client Component portion of `Header` MUST subscribe to `supabase.auth.onAuthStateChange` and re-render when the event fires (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED). The supabase browser client is reused, not re-instantiated per render.

#### Scenario: header updates without a full reload after in-tab login

- GIVEN an anonymous user on `/`
- WHEN they complete the `/login` flow and return to `/`
- THEN the header MUST show "Mi perfil" + "Cerrar sesión" without a full page reload (Playwright assertion: same `window.performance.navigation.type` is `navigate` at most once).

#### Scenario: header updates after in-tab logout

- GIVEN an authenticated user on `/`
- WHEN they click "Cerrar sesión" (triggers the Server Action from `logout-action`)
- THEN the redirect target `/` MUST render with the anonymous header.

### Requirement: Spanish copy only

Every visible label in the header MUST be in Spanish:

- Anon: "Iniciar sesión", "Registrarse".
- Auth: "Mi perfil", "Cerrar sesión".
- No English fragments like "Login", "Sign out", "Profile".

#### Scenario: no English text in header

- GIVEN any rendered header
- WHEN the visible text is scanned for the substrings `Login`, `Sign out`, `Sign in`, `Profile` (case-insensitive)
- THEN zero matches MUST appear (snapshot / regex smoke test).

### Requirement: Accessibility and touch-target contract

- Link and button hit areas MUST be ≥ 44×44 px.
- Tab order MUST follow the visual order.
- The logout button MUST be a `<button type="submit">` inside a `<form>` whose `action` is the Server Action — it MUST be operable without JavaScript.

#### Scenario: logout works with JavaScript disabled

- GIVEN an authenticated user with JS disabled in the browser
- WHEN they click the "Cerrar sesión" submit button
- THEN the request MUST POST to the Server Action endpoint and complete the sign-out (Playwright with `--disable-javascript` or equivalent).

### Requirement: No emoji in the header

The rendered header MUST NOT contain any emoji glyph.

#### Scenario: header text contains no emoji

- GIVEN the rendered header HTML
- WHEN scanned for emoji code points (regex over the `\u{1F300}-\u{1FAFF}` and `\u{2600}-\u{27BF}` ranges)
- THEN zero matches MUST be found.
