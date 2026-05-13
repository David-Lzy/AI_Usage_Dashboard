# Phase 161 - Store Screenshot Selection And Stale Review

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this archived phase marks the first `Direction 10.3` store-asset selection/stale-review slice as completed

Completion summary:

- added one maintained screenshot selection pack for the current store screenshot slots
- updated the maintained storyboard toward native toolbar-bubble popup capture and full-page-shell depth capture
- marked the maintained listing-copy pack and localization source pack as pre-refresh baselines anchored to the first archive
- updated `Direction 10.3` so screenshot selection/stale review is completed and the refreshed screenshot-capture request becomes the next slice
- added one repeatable review that checks the current selection pack against the `Phase 160` runtime evidence

Verification:

- `npm run docs:check`
- `npm run phase161:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

Related closeout:

- [Phase_161_Store_Screenshot_Selection_And_Stale_Review.md](../../../../testing/Archive/phase-reports/100-199/Phase_161_Store_Screenshot_Selection_And_Stale_Review.md)
