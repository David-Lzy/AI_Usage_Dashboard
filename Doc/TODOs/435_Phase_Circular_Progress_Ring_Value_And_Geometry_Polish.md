# Phase 435 - Circular Progress Ring Value And Geometry Polish

Status: queued

## Goal

Make circular quota progress controls cleaner and visually symmetric by removing the inline "remaining" wording from ring centers and aligning the colored arc with the background track.

## Scope

- For circular progress styles only, render the center value as the numeric percent such as `76%` instead of `76% remaining` or `76% 剩余`.
- Preserve accessible value text so screen readers and line-style progress can still expose "remaining" semantics.
- Align `circle-soft` and `circle-gauge` track and fill geometry so the foreground arc and background groove share the same center, radius, stroke width, and stroke caps.
- Review the classic `circle` style for obvious asymmetry regressions, but keep its legacy visual identity.
- Keep determinate, indeterminate, warning, success, and reduced-motion behavior intact.

## Preserved Boundaries

- Do not change provider quota math, item selection, threshold color rules, or reset-time labeling.
- Do not remove "remaining" from line progress rows or accessibility labels where it clarifies the metric.
- Do not change stored `ProgressDisplayStyle` values or the fresh-install default.
- Do not translate raw provider evidence, diagnostic bodies, archive payloads, or export schemas.

## Acceptance

- Soft and gauge ring centers show compact numeric values in English, Chinese, and other locales without text overlap.
- Screen-reader accessible text still distinguishes remaining versus used values.
- Foreground arcs and background tracks appear concentric and symmetric in popup and dashboard card contexts.
- Gauge gaps remain intentional and visually balanced rather than caused by radius drift.

## Planned Verification

- Focused `UsageProgress` and `UsageProgressRing` tests for circular center labels and aria value text.
- Popup/provider-card focused tests for soft and gauge rendering.
- Visual smoke screenshots for popup circular styles before closeout.
- `npm run i18n:check`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- If ring geometry needs broader token changes, queue a separate visual-token phase rather than changing the full progress system here.
