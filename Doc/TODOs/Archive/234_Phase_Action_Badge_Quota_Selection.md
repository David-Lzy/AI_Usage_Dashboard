# Phase 234 - Action Badge Quota Selection

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-05-03

## Goal

Make the extension action badge configurable so it can show the existing attention count or a user-selected remaining-quota value from current provider data.

## Completed Work

- Added normalized `actionBadgeSelection` app settings with `attention` as the default.
- Added dynamic quota candidates from enabled providers that have concrete remaining values.
- Supported usage-window candidates so Codex 5-hour, weekly, and model-specific windows can be selected independently.
- Added a Settings MaterialSelect for the badge selection.
- Updated badge rendering to show compact quota text and multiline hover details.
- Added focused tests for candidate generation, fallback behavior, storage normalization, and selected quota badge rendering.
- Added a Phase 234 review script.

## Preserved Boundaries

- Providers without current remaining data do not appear as dynamic quota candidates.
- A saved quota selection falls back to the attention-count badge if the underlying candidate disappears.
- The badge still uses cached extension state only; this phase does not add a new sync source or hidden page scrape.

## Verification

- `npm run phase234:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use RDP Chrome to check the real toolbar hover title after selecting a Codex usage window in Settings.
