# Comment Form Component Specification

## Purpose

Defines the `<CommentForm>` Client Component used to publish a comment on a report detail page. It supports anonymous and identified posting (gated by auth state), enforces body length, and submits via the `createCommentAction` Server Action. Reading existing comments is handled by a separate Server Component.

## Requirements

### Requirement: Required body field with length validation

The form MUST collect a single `body` textarea, MUST mark it as required, and MUST refuse submission when `body` is empty or longer than 2000 characters. The form MUST surface a Spanish error message naming the field on validation failure and MUST NOT invoke the Server Action in that case.

#### Scenario: Empty body blocks submission

- GIVEN the textarea is empty or whitespace-only
- WHEN the user submits
- THEN the browser blocks submission
- AND a Spanish message names the `body` field

#### Scenario: Oversized body blocks submission

- GIVEN `body.length > 2000`
- WHEN the user submits
- THEN the browser blocks submission
- AND a Spanish message names the `body` field

### Requirement: Anon / identificarme toggle

The form MUST present a radio toggle with the options "Anónimo" and "Identificarme", MUST default to anónimo on first mount, and MUST expose the current selection to the submission payload.

#### Scenario: Default selection is anonymous

- GIVEN a fresh mount
- WHEN the toggle renders
- THEN "Anónimo" is selected

#### Scenario: User selects identificarme

- GIVEN the form is mounted
- WHEN the user selects "Identificarme"
- THEN the toggle reflects the new selection
- AND the submitted payload identifies the author

### Requirement: Identifying requires authentication

The form MUST receive an `isAuthed` prop. When the prop is `false` and the user selects "Identificarme", the form MUST display an inline Spanish prompt linking to `/login?redirect=/report/<reportId>` instead of submitting.

#### Scenario: Unauthed user selecting identificarme is redirected to login

- GIVEN `isAuthed = false`
- WHEN the user selects "Identificarme"
- THEN the form shows a Spanish "Iniciá sesión para identificarte" link
- AND the link target is `/login?redirect=/report/{reportId}`

#### Scenario: Authed user selecting identificarme proceeds

- GIVEN `isAuthed = true`
- WHEN the user selects "Identificarme" and submits
- THEN the Server Action is invoked with the identification flag

### Requirement: Submission outcome handling

The form MUST submit via `createCommentAction`. On success the form MUST clear the textarea, MUST display a Spanish success toast, and MUST allow the page to re-render the comment list. On failure the form MUST surface the returned Spanish error and MUST keep the body intact for correction.

#### Scenario: Successful submit clears textarea and shows toast

- GIVEN a valid submission
- WHEN the action returns success
- THEN the textarea becomes empty
- AND a "Comentario publicado" toast appears

#### Scenario: Failed submit preserves body and shows error

- GIVEN a submission rejected by the server
- WHEN the action returns `{ error: <Spanish message> }`
- THEN the textarea retains its current value
- AND the Spanish error is displayed next to the form

### Requirement: Accessibility and copy

All copy MUST be in Spanish, MUST NOT contain emoji, every input MUST be paired with a `<label>`, and every control MUST have a touch target of at least 44 by 44 CSS pixels. A visible character counter SHOULD display current length against the 2000 maximum.

#### Scenario: Labels and touch targets pass at 375 px

- GIVEN the form renders at 375 px
- WHEN the DOM is inspected
- THEN every input has an associated `<label>` in Spanish
- AND no emoji appears
- AND each control's tap area is at least 44 px

#### Scenario: Character counter reflects current length

- GIVEN the user types into the textarea
- WHEN the value changes
- THEN the counter shows the current length against the 2000 maximum
