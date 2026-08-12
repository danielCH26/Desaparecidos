# Create Comment Action Specification

## Purpose

Defines the Server Action `createCommentAction` in `app/actions/comments.ts` — the authoritative write path for new `comments` rows. It receives `FormData`, re-validates the inputs, resolves identity from the session, inserts one row, and revalidates the report detail page.

## Requirements

### Requirement: Authoritative server-side validation

The action MUST re-validate every input server-side, MUST NOT trust client-supplied identity, and MUST return a Spanish error on validation failure. Validation MUST verify that `reportId` matches UUID syntax, that `body` length is between 1 and 2000 characters after trimming, and that `identify` is a recognized boolean token.

#### Scenario: Invalid input is rejected

- GIVEN `FormData` with `body` empty, `body` longer than 2000 characters, or `reportId` not matching UUID syntax
- WHEN the action runs
- THEN no insert is performed
- AND it returns `{ error: <Spanish message naming the offending field> }`

### Requirement: Author identity resolution

The action MUST resolve identity from `supabase.auth.getUser()` only and MUST ignore any client-supplied author. The action MUST set `author_id` to the session user id when both a session exists and `identify` is true, and MUST set `author_id` to NULL otherwise.

#### Scenario: Anonymous submission has NULL author

- GIVEN no session and `identify = false`
- WHEN the action runs
- THEN `author_id = NULL`

#### Scenario: Identified submission binds to session user

- GIVEN session with `user.id = U` and `identify = true`
- WHEN the action runs
- THEN `author_id = U`
- AND any client-supplied author is ignored

#### Scenario: Authenticated user choosing anónimo has NULL author

- GIVEN a session exists and `identify = false`
- WHEN the action runs
- THEN `author_id = NULL`

### Requirement: Report existence guard

The action MUST confirm that the referenced `reportId` exists before inserting. When the report does not exist the action MUST return a Spanish error and MUST NOT insert a comment.

#### Scenario: Unknown reportId is rejected

- GIVEN a `reportId` that does not match any `reports.id`
- WHEN the action runs
- THEN no insert is performed
- AND it returns `{ error: <Spanish message about the report> }`

### Requirement: Insertion, revalidation, and error handling

The action MUST insert via `.insert({ ... }).select('id').single()` and MUST call `revalidatePath('/report/' + reportId)` on a successful insert. The action MUST return a Spanish error on insertion failure without throwing.

#### Scenario: Successful insert revalidates the detail page

- GIVEN validation passes and the insert returns the new id
- WHEN the action completes
- THEN `revalidatePath('/report/{reportId}')` is called
- AND the function returns `{ ok: true }` or equivalent success

#### Scenario: Database failure returns error

- GIVEN the insert rejects (RLS, network, CHECK constraint)
- WHEN the failure is handled
- THEN it returns `{ error: <Spanish message> }`
- AND it does NOT throw
- AND no revalidation occurs
