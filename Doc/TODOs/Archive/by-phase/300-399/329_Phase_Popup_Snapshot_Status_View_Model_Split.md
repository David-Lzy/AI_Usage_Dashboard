# Phase 329 - Popup Snapshot Status View Model Split

## Goal

Move popup snapshot-status view-model logic out of the large `src/popup/view-models.ts` aggregator and add focused tests for its status decisions.

## Scope

- Extract newest/oldest visible-provider snapshot selection and snapshot-status construction into a dedicated popup view-model module.
- Preserve no-provider, aligned, mixed-state, warning, and error semantics.
- Keep `src/popup/view-models.ts` as the public aggregator import path.
- Add focused pure-unit tests for the extracted snapshot-status builder.

## Preserved Boundaries

- Do not change popup copy or localized copy behavior.
- Do not change provider sorting, visible-provider construction, or setup coverage behavior.
- Do not change popup rendering.

## Acceptance

- `view-models.ts` imports snapshot-status logic from the new module.
- Existing popup view-model behavior remains unchanged.
- Focused tests cover empty, aligned, mixed, warning, and error snapshot-status outcomes.

## Planned Verification

- `npm run test -- --run src/popup/snapshot-status-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/snapshot-status-view-models.ts` to own raw and localized popup snapshot-status construction.
- Updated `src/popup/view-models.ts` to import snapshot-status builders while preserving the public aggregator API.
- Added focused tests for no-provider, aligned single/multiple providers, mixed timestamps, missing permission warnings, and sync-error dominance.

Verification:

- `npm run test -- --run src/popup/snapshot-status-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
