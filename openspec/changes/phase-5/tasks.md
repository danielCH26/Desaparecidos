# Phase 5 Tasks

## Dependency Chain
1. Add types → 2, 3, 5
2. CommentList (server) → 5
3. createCommentAction → 4
4. CommentForm (client, depends on action type) → 5
5. Update /report/[id]/page.tsx → 6, 7
6. Smoke tests
7. Commit

## Atomic Tasks (7)

### T1 — Extend `lib/types.ts` with Comment types
- **Files**: `lib/types.ts`
- Add `CommentSummary` and `CommentWithAuthor` interfaces (per design.md)
- **Verify**: `grep "CommentSummary\|CommentWithAuthor" lib/types.ts`

### T2 — Create `components/ui/CommentList.tsx` (Server Component)
- **Files**: `components/ui/CommentList.tsx` (new)
- Fetches comments by `report_id`, batches `display_name` lookup, renders Spanish UI
- **Verify**: dev server, /report/<valid-uuid> renders list with author labels

### T3 — Create `app/actions/comments.ts` (Server Action)
- **Files**: `app/actions/comments.ts` (new)
- Exports `createCommentAction` with full server-side validation
- **Verify**: TypeScript compiles; exports match

### T4 — Create `components/forms/CommentForm.tsx` (Client Component)
- **Files**: `components/forms/CommentForm.tsx` (new)
- Textarea + char counter + anónimo toggle + submit handler
- **Verify**: dev server, form renders with all fields

### T5 — Update `app/report/[id]/page.tsx`
- **Files**: `app/report/[id]/page.tsx` (modify)
- Add comment fetch; replace placeholder with `<CommentForm>` + `<CommentList>`
- **Verify**: /report/<valid-uuid> HTML contains "Comentarios" + form

### T6 — Smoke tests (REST API + curl)
- **Build / lint / type-check**: all green
- **Create a test report** via REST API
- **Anon INSERT comment** → 201
- **Authed INSERT comment** → 201 (with author_id)
- **Anon SELECT comments for report** → 200, returns comments
- **Cleanup** test rows

### T7 — Commit
- **Files**: all changed files
- Conventional commit: `feat(comments): comment thread on /report/[id] with anon + identified`
- NO AI attribution
- **Verify**: `git status` clean

## Review Workload Forecast

- **Estimated changed lines**: ~280 (3 new files ~230 lines, page update ~30 lines, types extension ~10 lines)
- **Chained PRs recommended**: No (single cohesive PR)
- **600-line budget risk**: Low (well under budget)
- **Decision needed before apply**: No

## Action Type Summary

- Orchestrator-actions: T1, T2, T3, T4, T5, T6, T7 (7 of 7)
- User-actions: 0

## Hard Rules

- DO NOT modify source files except the 4 in the task list
- DO NOT touch `comments` table schema or RLS
- DO NOT introduce edit/delete UI
- Server Action validates everything authoritatively
- All Spanish copy
- 44 px touch targets
- No emoji
