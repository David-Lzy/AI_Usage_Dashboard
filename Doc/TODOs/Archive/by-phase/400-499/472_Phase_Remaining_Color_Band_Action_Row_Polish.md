# Phase 472 - Remaining Color Band Action Row Polish

Date: 2026-05-15

Status: completed

## Goal

Make the remaining-color-band summary chip and reorder/remove actions share one row when the Settings width can support it, reducing vertical space while preserving narrow-width wrapping.

## Scope

- Adjust the responsive CSS for remaining-color-band rows.
- Keep wide layouts on the existing one-row Material-style arrangement.
- Use a two-column bottom row at medium/side-panel widths: range chip on the left, actions on the right.
- Fall back to stacked controls only on very narrow widths.
- Add focused CSS coverage for the responsive row behavior.

## Preserved Boundaries

- No settings storage, validation, color-band semantics, localization, provider data, release artifact, or package version changes.
- No change to the actual color-band field order: From, To, and Color stay first.
- No change to warning thresholds or progress rendering.

## Acceptance

- At side-panel-friendly widths, `xx-xx% remaining` and `Up / Down / Remove` render on the same horizontal row.
- At very narrow widths, the summary and actions can stack to avoid overlap.
- The action row remains aligned with Material-style spacing and does not overflow the band card.

## Planned Verification

- `npm run test -- src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Run an extension-mode visual pass before the next package if more Settings responsive layout polish is batched into the release candidate.
