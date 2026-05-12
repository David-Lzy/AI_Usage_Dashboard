# Phase 333 - Popup Localized View Model Split

## Goal

Move popup view-model localization orchestration out of `src/popup/view-models.ts` while preserving the public `localizePopupViewModel` export path.

## Scope

- Add a dedicated popup localized view-model module.
- Keep `src/popup/view-models.ts` as the public aggregator for `buildPopupViewModel`, `localizePopupViewModel`, and popup view-model types.
- Preserve existing localized popup copy, summary labels, guidance, setup coverage, featured section, source-route, and snapshot-status behavior.

## Preserved Boundaries

- Do not change popup rendering, route actions, copy strings, provider source semantics, or locale selection behavior.
- Do not change the popup runtime or message-bus behavior.
- Do not change release package versions or provider support claims.

## Acceptance

- `view-models.ts` re-exports `localizePopupViewModel` from the new module.
- Existing popup localized view-model tests still pass.
- The new module owns the localized builder imports instead of the public aggregator file.

## Planned Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/popup/localized-view-models.ts` for popup view-model localization orchestration.
- Kept `localizePopupViewModel` available from `src/popup/view-models.ts` through a public re-export.
- Reduced `src/popup/view-models.ts` to the raw popup model builder, public exports, and first-setup-provider selection.

Verification:

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

Follow-up:

- None for this slice. Further popup test or runtime splits should stay behavior-preserving and driven by concrete maintenance risk.
