# Phase 288 - Source Chip Row And RC7 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Fix Settings source-card chip groups that stacked vertically in Chrome, wasting space on Claude, JetBrains, and similar provider source cards, then package `0.1.0-rc.7`.

## Completed Work

- Changed `.source-card__chips` from a single-column grid to horizontal wrapping flex rows.
- Kept chips right-aligned on wide Settings cards and left-aligned under the text column on narrow cards.
- Added min-width protection for source-card header text so the chip row can wrap without forcing layout overflow.
- Preserved nowrap behavior inside individual chips.
- Bumped package version to `0.1.0-rc.7`.
- Bumped Chrome manifest version to `0.1.0.7` and `version_name` to `0.1.0-rc.7`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.7.zip`.
- Updated release-facing docs and the phase index.
- Added a Phase 288 release package and CSS marker review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.7.zip`
- SHA256: `b094b9b79975f5e092f51146c3f511ae0e442d410ae5775f9da13740c8ec860d`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, host-access model, or provider coverage claim changed in this phase.
- `0.1.0-rc.7` only changes Settings source-card chip layout and distributes the existing Phase 285-287 fixes for Chrome install/review.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.6` zip remains historical evidence from Phase 287.

## Verification

- `npm run test -- src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.7.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.7.zip`
- `npm run phase288:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.7` for the next Chrome review pass. If the chip row still feels too dense in a specific viewport, tune only source-card chip wrapping constraints and preserve source/state semantics.
