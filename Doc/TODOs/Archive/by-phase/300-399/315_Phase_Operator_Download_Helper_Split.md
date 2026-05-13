# Phase 315 - Operator Download Helper Split

## Goal

Remove duplicated text-file download code from the interaction-audit and theme-recovery operator pages.

## Scope

- Add one shared sidepanel helper for browser text-file downloads.
- Replace the duplicated `downloadTextFile` implementations in interaction-audit and theme-recovery routes.
- Add focused helper tests for unavailable browser APIs and successful temporary-link downloads.

## Preserved Boundaries

- Do not change exported artifact content, filenames, schemas, request binding, or archive behavior.
- Do not change operator page copy or layout.
- Do not change provider runtime behavior or release artifacts.

## Acceptance

- Both operator pages call the same shared download helper.
- The helper safely returns `false` when browser download APIs are unavailable.
- Existing special-route and interaction-audit helper tests still pass.
- TypeScript verifies both operator pages after the extraction.

## Planned Verification

- `npm run test -- --run src/sidepanel/download-text-file.test.ts src/sidepanel/interaction-audit-frame-actions.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/download-text-file.ts` as the shared browser download helper.
- Added `src/sidepanel/download-text-file.test.ts` covering unavailable browser APIs and successful temporary-link creation/click/revocation.
- Replaced duplicated route-local download helpers in `InteractionAuditPage.tsx` and `ThemeRecoveryReviewPage.tsx`.

Verification:

- `npm run test -- --run src/sidepanel/download-text-file.test.ts src/sidepanel/interaction-audit-frame-actions.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
