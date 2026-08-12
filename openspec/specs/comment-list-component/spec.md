# Comment List Component Specification

## Purpose

Defines the `<CommentList>` Server Component that renders the chronological thread of comments for a single report. It fetches all comments server-side, resolves author display names in a single batched query, and renders each comment with an author label, relative Spanish timestamp, and preserved whitespace.

## Requirements

### Requirement: Chronological fetch ordered oldest first

The component MUST fetch every comment whose `report_id` matches the supplied report id and MUST order them by `created_at` ASC so the thread reads as a chronological conversation.

#### Scenario: Empty report shows the empty state

- GIVEN a report with no comments
- WHEN the component renders
- THEN a Spanish empty-state message is rendered
- AND no comment rows appear

#### Scenario: Multiple comments render oldest first

- GIVEN comments at `t = 10:00`, `t = 10:05`, `t = 10:02`
- WHEN the component renders
- THEN the DOM lists them in the order 10:00, 10:02, 10:05

### Requirement: Batched author display name resolution

When at least one comment has a non-null `author_id`, the component MUST resolve all author display names with a single batched query (one `select` against `profiles` filtered by an `IN` of distinct author ids) and MUST NOT issue a per-comment query.

#### Scenario: One batched profile query regardless of comment count

- GIVEN a report with 50 comments spread across 8 distinct authors
- WHEN the component renders
- THEN exactly one query against `profiles` is issued
- AND each comment author label is resolved from the batched result

#### Scenario: Anonymous comments render as "Anónimo"

- GIVEN a comment with `author_id = NULL`
- WHEN the component renders
- THEN the author label reads "Anónimo"
- AND no `profiles` query is required for that row

### Requirement: Author label rendering

For each comment the component MUST render "Anónimo" when `author_id` is NULL and MUST render "Por {display_name}" when the resolved profile has a `display_name`. When `display_name` is missing for an identified author the component MUST render "Por usuario".

#### Scenario: Identified author with display name

- GIVEN a comment with `author_id = U` and `profiles(U).display_name = "Ana"`
- WHEN the component renders
- THEN the author label reads "Por Ana"

#### Scenario: Identified author without display name

- GIVEN a comment with `author_id = U` and `profiles(U).display_name = NULL`
- WHEN the component renders
- THEN the author label reads "Por usuario"

### Requirement: Relative Spanish timestamps

The component MUST render each comment's `created_at` as a relative time string in Spanish (for example "hace 5 minutos") and MUST use `Intl.RelativeTimeFormat` so localization is delegated to the runtime.

#### Scenario: Recent comment uses relative format

- GIVEN a comment created 5 minutes ago
- WHEN the component renders
- THEN the timestamp reads "hace 5 minutos"

### Requirement: Body rendering with preserved whitespace

The component MUST render the comment `body` exactly as stored, MUST preserve newlines and consecutive spaces, and MUST apply `whitespace-pre-wrap` to the rendered element.

#### Scenario: Multiline body preserves line breaks

- GIVEN a comment `body` containing two lines separated by `\n`
- WHEN the component renders
- THEN the rendered text shows both lines on separate visual lines
- AND no `<br>` injection or other transformation is applied

### Requirement: Accessibility and copy

All copy MUST be in Spanish, MUST NOT contain emoji, each comment MUST be wrapped in a semantic element (for example `<article>` or `<li>`), and the list MUST expose a meaningful label to assistive technologies.
