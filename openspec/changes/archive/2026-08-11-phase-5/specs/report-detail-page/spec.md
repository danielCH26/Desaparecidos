# Delta for report-detail-page

## MODIFIED Requirements

### Requirement: Comments thread

The page MUST fetch every comment for the report server-side and pass them to `<CommentList comments={...} />`, MUST resolve the current viewer from the Supabase server client, and MUST mount `<CommentForm reportId={params.id} isAuthed={!!user} />` directly under the list. After a successful comment submission the page MUST re-render the comment list without a manual refresh. The page MUST NOT issue per-comment profile lookups; the list MUST resolve all author display names via a single batched query.

(Previously: rendered a "Los comentarios estarán disponibles próximamente" placeholder and did not query `comments`.)

#### Scenario: Comments list and form are mounted on the detail page

- GIVEN a detail page renders for `reportId = R`
- WHEN the response is sent
- THEN the HTML contains the `<CommentList>` element
- AND the HTML contains the `<CommentForm>` element bound to `R`

#### Scenario: Current viewer is resolved server-side

- GIVEN the request comes from an authenticated session
- WHEN the page renders
- THEN `<CommentForm>` receives `isAuthed = true`

#### Scenario: Anonymous viewer receives isAuthed false

- GIVEN the request comes from an anonymous visitor
- WHEN the page renders
- THEN `<CommentForm>` receives `isAuthed = false`

#### Scenario: Server-side batched profile lookup avoids N+1

- GIVEN a report with 50 comments spread across 8 distinct authors
- WHEN the page renders
- THEN at most one query against `profiles` is issued by the comments rendering path
- AND each comment author label is resolved from that single batched result

#### Scenario: Successful submission re-renders the list

- GIVEN a comment is successfully inserted
- WHEN the page is re-rendered via `revalidatePath`
- THEN the new comment is visible in the list
- AND no manual page refresh is required
