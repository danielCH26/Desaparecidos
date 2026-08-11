# Archive Report — Phase 1

**Change**: phase-1 (Supabase schema + RLS)
**Project**: desaparecidos
**Archive Date**: 2026-08-11
**Status**: ✅ Complete

## Summary

Phase 1 successfully deployed the Supabase schema, Row Level Security policies, auth trigger, and storage bucket to the live project. All 4 capabilities (database-schema, row-level-security, auth-trigger, photo-storage) are implemented and verified. 47/54 scenarios were runtime-verified; 7 auth-trigger scenarios were verified by source inspection only (deferred to Phase 2 for runtime proof).

## Archive Contents

| Artifact | Status |
|----------|--------|
| proposal.md | ✅ |
| tasks.md | ✅ (12/12 complete) |
| design.md | ✅ |
| apply-progress.md | ✅ |
| verify-report.md | ✅ |
| archive-report.md | ✅ (this file) |
| specs/database-schema/spec.md | ✅ |
| specs/row-level-security/spec.md | ✅ |
| specs/auth-trigger/spec.md | ✅ |
| specs/photo-storage/spec.md | ✅ |

## Main Specs Created

| Capability | Main Spec Path |
|------------|----------------|
| database-schema | openspec/specs/database-schema/spec.md |
| row-level-security | openspec/specs/row-level-security/spec.md |
| auth-trigger | openspec/specs/auth-trigger/spec.md |
| photo-storage | openspec/specs/photo-storage/spec.md |

## Key Decisions & Notes

- **Migration applied via dashboard**: The user applied `0001_init.sql` via the Supabase dashboard SQL Editor (no CLI in sandbox). A prior partial attempt caused a duplicate table error; the live DB already had all tables from that attempt.
- **person_photo_url nullable**: Per user decision, anonymous reports publish without a photo. Migration file is canonical; user's dashboard paste may differ in formatting but produces equivalent state.
- **Auth-trigger deferred**: 7 auth-trigger scenarios verified by migration source only. Runtime proof requires Phase 2 Next.js signUp flow.
- **Working tree clean**: Latest commit `31ed532` on main; untracked files are only the SDD artifacts in archive.

## Review Receipt

- Receipt: `review-19ec122bbed8a68c`
- Terminal state: **approved**
- Evidence outcome: **passed**
- Risk level: **high**
- Selected lenses: risk, resilience, readability, reliability

## Risks

- **WARNING**: auth-trigger scenarios verified by source only; deferred to Phase 2 Next.js signUp flow for runtime proof.

## Next Recommended

Phase 2 — Supabase auth flow with cédula-based signUp via Next.js client.
