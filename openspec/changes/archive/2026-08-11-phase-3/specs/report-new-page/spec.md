# Report New Page Specification

## Purpose

Defines the `/report/new` route as a React Server Component shell that hosts the report creation form. The page resolves the current session, adapts the form for anonymous vs. authenticated users, and never embeds the map or form directly (both are Client Components imported through `next/dynamic` or `'use client'`).

## Requirements

### Requirement: Server-side session resolution

The page MUST resolve the current session server-side via `supabase.auth.getUser()` before rendering, MUST NOT depend on client-side auth state for routing decisions, and MUST pass an `isAuthenticated` boolean to the form.

#### Scenario: Authenticated user sees greeting

- GIVEN a request to `/report/new` carrying a valid Supabase session cookie
- WHEN the page renders
- THEN the form receives `isAuthenticated = true`
- AND it also receives a `displayName` string fetched from the user's `profiles` row

#### Scenario: Anonymous user reaches the same form

- GIVEN a request to `/report/new` without a session cookie
- WHEN the page renders
- THEN the form receives `isAuthenticated = false`
- AND no `displayName` is fetched or passed

### Requirement: Form variant per session

The page MUST render the same `<ReportForm>` instance for both authenticated and anonymous users, but MUST disable the photo upload branch and the "Identificarme" toggle for anonymous users, and MUST surface a link to `/login?redirect=/report/new`.

#### Scenario: Anonymous user cannot select identificarme

- GIVEN an anonymous request to `/report/new`
- WHEN the page renders
- THEN the form's identificarme option is disabled or hidden
- AND a visible link reads "Inicia sesión para identificarte" pointing to `/login?redirect=/report/new`

#### Scenario: Authenticated user can toggle identifying on

- GIVEN an authenticated request to `/report/new`
- WHEN the page renders
- THEN both anónimo and identificarme options are interactive
- AND the photo upload input is reachable through the toggle

### Requirement: Mobile-first layout

The page MUST be usable at a 375 px viewport width, MUST place the map directly above the action buttons, and MUST keep all interactive elements within reachable thumb distance without horizontal scrolling.

#### Scenario: No horizontal scroll at 375 px

- GIVEN a 375 px wide viewport
- WHEN the page is rendered
- THEN the document does NOT overflow horizontally
- AND the map, form fields, and submit button are all visible without sideways scrolling

#### Scenario: Map sits above the submit button

- GIVEN the rendered page on any viewport
- WHEN the DOM is inspected
- THEN the map container appears before the submit button in document order

### Requirement: Locale and accessibility

All visible copy on the page MUST be in Spanish, MUST NOT contain emoji, and every form control MUST be reachable by keyboard navigation with visible focus indicators.

#### Scenario: Spanish copy, no emoji

- GIVEN the page is rendered
- WHEN the visible text and labels are inspected
- THEN every label, heading, button, link, and error message is in Spanish
- AND no emoji characters appear anywhere on the page

#### Scenario: Keyboard navigation reaches the submit button

- GIVEN a keyboard-only user is on `/report/new`
- WHEN they press `Tab` repeatedly from the top of the page
- THEN focus moves through every interactive control in a logical order
- AND focus reaches the submit button without being trapped
- AND each focused control shows a visible focus indicator
