# Phase 441 - Popup Status Chip Header Compactness

Status: active

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
