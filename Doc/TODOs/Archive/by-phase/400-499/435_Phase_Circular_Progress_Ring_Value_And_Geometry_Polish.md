# Phase 435 - Circular Progress Ring Value And Geometry Polish

Status: completed

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

## Completion Summary

- Changed circular progress labels so classic, soft, and gauge rings always render compact numeric center text such as `76%`, even when the source value label includes `remaining` or localized equivalents.
- Preserved full `aria-valuetext` and line-progress display semantics so assistive technology and non-circular rows still expose remaining/used context.
- Removed the separate radial background groove from SVG ring variants so the visible groove comes from the same SVG circle geometry as the foreground fill.
- Added shared ring size and stroke variables, non-scaling SVG strokes, and numeric isolation on ring center text to reduce perceived track/fill drift and RTL punctuation risk.
- Added focused regression coverage for circular center labels, aria text, SVG geometry markers, and popup/appearance preview progress paths.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgress.test.tsx`
- `npm run test -- src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/shared/progress-display.test.ts src/sidepanel/settings-preference-options.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- Playwright static ring smoke screenshot: `tmp/phase435-progress-ring-smoke/static-ring-geometry.png`

Note:

- The ordinary HTTP popup preview loaded provider cards without circular percent rings in this local profile, so the visual smoke used a static ring fixture with the built CSS. Extension-mode visual QA remains queued for `Phase 439`.
