# Phase 235 - Settings Sticky Nav

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-05-03

## Goal

Improve Settings navigation for long pages by keeping section jumps available during scroll and adding a quick return-to-top affordance.

## Completed Work

- Converted the Settings section chips into the existing sticky top bar's second row, creating one merged sticky top bar instead of two stacked sticky surfaces.
- Added current-section tracking and active chip styling.
- Added a lower-right extended Material floating action button for returning to the top, with a visible label in the full-page tab and icon-only density on narrow side-panel widths.
- Added localized accessible labels and short visible labels for the return-to-top action.
- Added focused static rendering coverage for the merged sticky top bar navigation and FAB.
- Added a Phase 235 review script.

## Preserved Boundaries

- The merged sticky top bar only affects Settings; dashboard, provider-detail, popup, and audit workspaces are unchanged.
- The FAB uses the existing page scroll surface and does not introduce a second scroll container.
- Section jumps still honor the existing reduced-motion scroll behavior.

## Verification

- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use RDP Chrome to visually check the merged sticky top bar and extended FAB across side-panel and full-page surfaces.
