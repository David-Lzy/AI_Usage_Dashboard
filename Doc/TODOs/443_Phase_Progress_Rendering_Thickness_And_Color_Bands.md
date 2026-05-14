# Phase 443 - Progress Rendering Thickness And Color Bands

Status: active

## Goal

Apply the global thickness preference and remaining-percent color bands to every progress style: line, classic circle, soft circle, and gauge circle.

## Scope

- Thread progress appearance settings into popup, sidebar dashboard, full-page dashboard, provider detail, and preview progress rendering.
- Use remaining percentage for color-band selection whenever the progress item has a remaining value.
- Keep existing semantic tone fallback for indeterminate progress or items without a usable remaining percentage.
- Express thickness and selected color through CSS variables so line and SVG ring renderers stay small and testable.
- Keep classic circle, soft circle, and gauge circle center labels numeric-only for circular styles.
- Preserve reduced-motion handling and RTL numeric isolation.

## Preserved Boundaries

- Do not change quota math, progress item inventory, provider order, or per-surface item visibility.
- Do not let visual color bands change warning diagnostics or provider `displayTone`.
- Do not translate raw provider evidence, diagnostic raw bodies, archive payloads, or export schemas.
- Do not package a new release candidate in this phase.

## Acceptance

- Line progress height responds to the global thickness preference.
- Classic circle groove and fill thickness respond to the same preference.
- Soft and gauge SVG stroke width respond to the same preference.
- All four progress styles use the same color-band result for the same remaining percentage.
- Unknown/indeterminate progress keeps neutral visual treatment and accessible aria text.
- Popup, sidebar, and full-page surfaces all receive the same appearance settings.

## Planned Verification

- `UsageProgress` and `UsageProgressRing` render tests covering thickness and color CSS variables.
- Popup provider progress tests.
- Provider card and provider detail focused tests.
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 444` if soft and gauge rings still look too similar after the shared rendering pass.
