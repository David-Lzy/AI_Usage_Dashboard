# Phase 209 - Popup Circular Usage Progress

Date: 2026-04-26

Document class:

- closed evidence

## Goal

Make the toolbar popup show structured usage-window progress as compact circular remaining indicators instead of long text summaries.

## Why This Phase Exists

`Phase 208` made dashboard and provider-detail usage windows match the vendor-style horizontal progress bars. The popup has less space and should not become a full usage grid, but it should still expose the same important quota signal quickly. Circular progress keeps the popup focused on progress state while preserving richer detail in the larger surfaces.

## What Changed

- Added popup-specific circular progress view-model data for structured usage windows.
- Rendered popup usage-window percentages as accessible `progressbar` rings.
- Hid the structured usage-window text block from popup cards when circular progress exists.
- Kept summary-only providers, such as Cursor billing-period context, on the existing compact text fallback.
- Preserved dashboard and provider-detail progress bars from `Phase 208`.
- Added focused view-model coverage and `npm run phase209:review`.

## Preserved Boundaries

- No provider parser, source-selection, sync, extension permission, or package behavior changed.
- Popup circular progress only uses structured usage-window remaining percentages already present in the provider snapshot.
- Usage balances remain fallback/supporting context and are not converted into circular quota rings in this phase.
- Dashboard and provider-detail bars remain unchanged.

## Artifacts

- `scripts/phase209-popup-circular-usage-progress-review.mjs`
- `tmp/phase209-popup-circular-usage-progress-review/popup-circular-usage-progress-review.json`

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run phase209:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

After the next real Codex or Cursor operator capture, verify whether popup should keep showing every structured window as rings or cap visible rings and push overflow into full-page/provider-detail surfaces.
