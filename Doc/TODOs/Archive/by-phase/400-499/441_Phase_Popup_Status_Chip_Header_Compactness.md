# Phase 441 - Popup Status Chip Header Compactness

Status: completed on 2026-05-14

## Goal

Move the popup provider-card status badge, such as Healthy, Warning, or Sync issue, into the provider title row so quota-first popup cards use less vertical space.

## Scope

- Update the popup featured provider-card header layout so the status badge sits to the right of the provider name instead of on its own vertical block.
- Keep the status label and tone source exactly as today.
- Preserve the provider plan/subtitle behavior for cards that do not render quota progress.
- Adjust popup CSS only where needed for compact, balanced, and wide popup sizes.

## Preserved Boundaries

- Do not change provider ordering, provider visibility, quota item selection, progress values, or status classification.
- Do not change provider support claims or source-truth semantics.
- Do not introduce new popup actions or Settings controls.
- Do not package a new release candidate in this phase.

## Acceptance

- Popup compact, balanced, and wide provider cards keep the status badge on the provider-title row.
- Long provider names can wrap without overlapping the badge or progress area.
- Chinese, English, German, and Arabic popup labels do not overlap or clip.
- Existing popup featured-provider behavior and action routing remain unchanged.

## Planned Verification

- Focused popup provider-card render tests.
- Popup compact, balanced, and wide preview or Playwright checks.
- Representative locale checks for `en`, `zh-CN`, `de`, and `ar`.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 442` for progress appearance settings after the popup header compactness is stable.

## Completion Notes

- Moved the popup featured-provider status chip into a dedicated provider title row so quota-first popup cards no longer spend a separate header column on status.
- Added popup-only CSS for the title row, provider identity wrapper, and status-chip width behavior so long provider names can wrap beside the status chip without overlapping the progress area.
- Added focused server-rendered tests proving the status chip lives in the title row and non-progress cards still keep the plan below that row.
- Ran a targeted Playwright preview check for `en`, `zh-CN`, `de`, and `ar` across compact, balanced, and wide popup widths; screenshots and JSON were written under `tmp/phase441-popup-status-chip/`.
- The older `phase129:review` helper is no longer a reliable current-gate because it waits for the historical English `Quick glance` string; the Phase 441 preview check used structural selectors instead.

## Verification

- `npm run test -- src/popup/PopupFeaturedProviderList.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- Playwright popup structural/overflow check for `en`, `zh-CN`, `de`, and `ar`
