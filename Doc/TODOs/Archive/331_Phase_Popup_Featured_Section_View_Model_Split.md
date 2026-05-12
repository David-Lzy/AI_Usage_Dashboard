# Phase 331 - Popup Featured Section View Model Split

## Goal

Move popup featured-section view-model logic out of `src/popup/view-models.ts` and add focused tests for its section-story decisions.

## Scope

- Extract raw and localized featured-section builders into a dedicated popup view-model module.
- Preserve zero-provider, needs-attention, all-policy-only, and all-clear section decisions.
- Keep `src/popup/view-models.ts` as the public aggregator import path.
- Add focused pure-unit tests for the extracted raw featured-section builder.

## Preserved Boundaries

- Do not change popup copy, provider card selection, action routing, or rendering.
- Do not change setup coverage, guidance cards, snapshot status, or provider source truth semantics.

## Acceptance

- `view-models.ts` imports featured-section logic from the new module.
- Existing popup view-model behavior remains unchanged.
- Focused tests cover the major featured-section decision branches.

## Planned Verification

- `npm run test -- --run src/popup/featured-section-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/featured-section-view-models.ts` to own raw and localized popup featured-section construction.
- Updated `src/popup/view-models.ts` to import featured-section builders while preserving the public aggregator API.
- Added focused tests for zero-provider first setup, needs-attention, policy-only, and all-clear section stories.

Verification:

- `npm run test -- --run src/popup/featured-section-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
