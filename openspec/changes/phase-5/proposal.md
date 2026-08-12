# Proposal: Phase 5 — Comments

## Intent

Phase 4 shipped the public detail page with a placeholder for comments. Phase 5 turns that placeholder into a working read/write comment thread on every report. No schema changes — Phase 1 already has `comments` table with RLS in place.

## Scope

**In**: one Server Component (`CommentList`), one Client Component (`CommentForm`), one Server Action (`createCommentAction`), updated `app/report/[id]/page.tsx` to mount the components in place of the placeholder, batched `display_name` lookup for comment authors.

**Out**: replies/threading, edit, delete UI, moderation, real-time updates, @mentions, markdown, notifications. All out of MVP scope per `plan.md`.

## Capabilities

### New
1. **`comment-form-component`** — Client `components/forms/CommentForm.tsx`: single `body` textarea (1–2000 chars, char counter), anónimo (default) ↔ identificarme toggle, submit via `createCommentAction`, success toast + textarea clear + scroll to new comment.
2. **`comment-list-component`** — Server `components/ui/CommentList.tsx`: fetches all comments ordered by `created_at` ASC, batches `display_name` lookup for one batch query (no N+1), "Anónimo" or "Por {display_name}" author label, relative Spanish time.
3. **`create-comment-action`** — Server Action `app/actions/comments.ts`: re-validates body length and reportId UUID, resolves `auth.uid()` server-side, sets `author_id` (NULL for anon, user.id for identified), inserts via `supabase.from('comments').insert(...)`, calls `revalidatePath('/report/' + reportId)`.

### Modified
4. **`detail-page-update`** — `app/report/[id]/page.tsx`: replace the placeholder section with `<CommentList comments={...} />` (server-fetched in page) + `<CommentForm reportId={params.id} isAuthed={!!user} />` (client component).

## Approach

- **Body length**: 2000 chars max, enforced client + server + DB CHECK (defense in depth)
- **Anónimo default**: privacy-first, consistent with Phase 3 ReportForm toggle
- **Identificarme requires auth**: if user is not signed in and toggles, show "Iniciá sesión para identificarte" link → /login?redirect=/report/<uuid>
- **Author display name lookup**: one batch query `select display_name where id = any(author_ids)` after fetching comments; maps the results in the Server Component
- **No N+1**: the batch is one IN query, not per-comment
- **Time formatting**: `Intl.RelativeTimeFormat('es', { numeric: 'auto' })` for "hace 5 minutos"
- **Body preservation**: `whitespace-pre-wrap` on the rendering so newlines from `body` survive
- **Empty state**: "Sin comentarios todavía. Sé el primero en comentar."
- **Optimistic UI**: on submit success, the textarea clears and a "Comentario publicado" toast shows; the list re-renders via `revalidatePath`

## Open Questions

1. **Sort order**: oldest-first (chronological, "thread" feel) or newest-first ("recent" feel)? Default: oldest first.
2. **Profile photo next to author**: skip (no profile photos in MVP)? Default: skip.
3. **Anonymous deletion**: RLS allows owner-only; with `author_id = NULL` the helper returns false everywhere. Default: anonymous comments are truly immutable (just don't expose a delete UI in MVP).
4. **Body counter UI**: show "X/2000" character counter? Default: yes (gives users feedback).

## Success Criteria

- Anon can post a comment from any authenticated OR anonymous state with `author_id = NULL`
- Identified (logged-in) user can post with `author_id = auth.uid()`
- Submitting from unauthenticated context with toggle on "identificarme" shows login link instead of error
- POST of body > 2000 chars returns Spanish error (client + server check)
- `<CommentList>` shows all comments for the report, oldest first, with author labels
- Comments with `author_id` show "Por {display_name}" via batched profile lookup
- Comments with `author_id IS NULL` show "Anónimo"
- After successful submit, the list re-renders without manual refresh (Next revalidate)
- Detail page response time < 500ms with 50 comments
- Mobile-first at 375 px: textareas stack, comment cards stack, form adapts

## Out of Scope (explicit)

- **Comment reply/threading** (flat list only per MVP)
- **Comment editing** (immutable; no edit UI)
- **Comment delete UI** (RLS allows; no button in MVP — defer to Phase 7 polish)
- **Comment moderation / report button** (out of MVP per plan.md)
- **Real-time / WebSocket** (no SSE/pusher; page refresh only)
- **@mentions** (out of MVP)
- **Markdown / formatting** (plain text only)
- **Email / push notifications on new comments** (no notification infrastructure)

## Persistence

- Engram topic `sdd/phase-5/proposal`
- OpenSpec `openspec/changes/phase-5/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT modify the `comments` table schema (already in place from Phase 1)
- DO NOT introduce edit/delete UI (out of MVP)
- All client-side validation is mirrored server-side (defense in depth)
- Use Server Component for `CommentList` (no interactivity needed)
- Use Client Component for `CommentForm` (toggle state, form handling)
- All Spanish UI copy
- 44 px touch targets on form inputs/buttons
- No emoji

## Return

Standard proposal output envelope with final state at close.

## Next

`sdd-spec` to write the detailed delta spec for each of the 4 capabilities.
