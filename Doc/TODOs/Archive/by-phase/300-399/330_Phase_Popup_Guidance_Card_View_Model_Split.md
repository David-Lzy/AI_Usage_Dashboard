# Phase 330 - Popup Guidance Card View Model Split

## Goal

Move popup guidance-card view-model logic out of the large `src/popup/view-models.ts` aggregator and add focused tests for its user-task decisions.

## Scope

- Extract raw and localized guidance-card builders into a dedicated popup view-model module.
- Preserve first-provider setup, missing host access, missing credentials, blocked-provider, policy-only, and healthy-null decisions.
- Keep `src/popup/view-models.ts` as the public aggregator import path.
- Add focused pure-unit tests for the extracted raw guidance-card builder.

## Preserved Boundaries

- Do not change popup copy, routing target kinds, or action labels.
- Do not change provider sorting, setup coverage, featured-card, snapshot-status, or rendering behavior.
- Do not change provider source truth semantics.

## Acceptance

- `view-models.ts` imports guidance-card logic from the new module.
- Existing popup view-model behavior remains unchanged.
- Focused tests cover the major guidance-card decision branches.

## Planned Verification

- `npm run test -- --run src/popup/guidance-card-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/guidance-card-view-models.ts` to own raw and localized popup guidance-card construction.
- Updated `src/popup/view-models.ts` to import guidance-card builders while preserving the public aggregator API.
- Added focused tests for first-provider setup, missing host access, missing credentials, blocked-provider review, policy-only providers, and ready-provider null guidance.

Verification:

- `npm run test -- --run src/popup/guidance-card-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
