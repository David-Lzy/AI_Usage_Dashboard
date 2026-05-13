# Phase 316 - Operator Clipboard Helper Split

## Goal

Share clipboard-write behavior across operator pages while preserving their current feedback semantics.

## Scope

- Add one shared sidepanel clipboard helper that reports `success`, `unavailable`, or `failed`.
- Replace route-local clipboard logic in interaction-audit and theme-recovery operator pages.
- Add focused tests for unavailable clipboard access, successful writes, and rejected writes.

## Preserved Boundaries

- Do not change exported artifact content, filenames, schemas, request binding, or archive behavior.
- Do not change operator page layout or copy.
- Preserve interaction-audit's distinction between unavailable clipboard access and failed clipboard writes.

## Acceptance

- Both operator pages call the same clipboard helper.
- Theme-recovery keeps its existing success/fallback behavior.
- Interaction-audit keeps its existing success, unavailable, and failed feedback messages.
- TypeScript verifies both operator pages after the extraction.

## Planned Verification

- `npm run test -- --run src/sidepanel/write-clipboard-text.test.ts src/sidepanel/download-text-file.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/write-clipboard-text.ts` with status-based clipboard write results.
- Added `src/sidepanel/write-clipboard-text.test.ts` for unavailable, success, and rejected-write behavior.
- Replaced interaction-audit inline clipboard branches and theme-recovery route-local clipboard helper with the shared helper.

Verification:

- `npm run test -- --run src/sidepanel/write-clipboard-text.test.ts src/sidepanel/download-text-file.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
