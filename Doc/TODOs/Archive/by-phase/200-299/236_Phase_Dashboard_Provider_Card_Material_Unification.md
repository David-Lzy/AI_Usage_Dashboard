# Phase 236 - Dashboard Provider Card Material Unification

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- follow-up maintenance should split oversized UI/theme files without reopening this visual slice

## Goal

Make dashboard provider cards match the Material 3 visual language already used by Settings controls and the toolbar popup.

The visible Codex card gap is not a context rollback. It is a remaining dashboard provider-card coverage gap after Settings selects, editable numeric controls, popup appearance controls, and Settings sticky navigation moved farther into the shared Material system.

## Scope

- update dashboard provider-card layout so the card reads as one Material surface instead of an older broad text stack
- improve header and status hierarchy:
  - provider name
  - plan or contract subtitle
  - status badge placement
- tighten structured usage-window progress rows without removing visible Codex weekly, 5-hour, model-specific, or supplemental context
- align meta chips with the existing compact chip system
- replace the current evenly spaced text-action footer with a clearer Material action hierarchy
- verify compact side-panel and full-page dashboard widths
- keep provider-detail and popup behavior unchanged unless a shared style adjustment is required to keep progress/chip language consistent

## Preserved Boundaries

- do not change provider data models
- do not change sync behavior, refresh behavior, tab binding, or managed Codex source-tab behavior
- do not change source-selection order or fallback behavior
- do not change Codex or Cursor truth labels:
  - Codex personal remains `Window-only vendor value`
  - Cursor personal remains billing-period context, not exact remaining included requests
- do not mix broad file-splitting or theme architecture refactors into this phase
- do not make store-screenshot archive claims before the remaining native toolbar popup captures are completed

## Acceptance Criteria

- dashboard provider cards read as Material cards in both light and dark theme modes
- cards remain overflow-free at approximately `360px`, `420px`, and full-page dashboard widths
- Codex structured usage-window progress remains visible and scannable
- warning and error provider cards preserve their state-toned surfaces without flattening all content into one text color
- footer actions no longer look like an old full-width text-row spread across the card
- the implementation keeps all provider truth, diagnostics, and source-boundary copy intact

## Planned Verification

- focused component tests for provider-card rendering where existing coverage is affected
- Playwright visual review for dashboard provider cards at compact side-panel widths and full-page width
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

After this visual contract is stable, plan a separate maintenance phase to split oversized implementation files:

- `src/sidepanel/theme/material-theme.css`
- `src/sidepanel/routes/SettingsPage.tsx`
- `src/sidepanel/App.tsx`
- `src/shared/localized-copy.ts`

## Completed Work

- Reworked dashboard `ProviderCard` markup into a clearer Material card hierarchy:
  - identity and status header
  - usage summary supporting surface
  - quota progress supporting surface
  - compact chip context row
  - footer action row with a primary refresh action
- Updated the provider-card CSS so dashboard cards keep Material surface shape, internal supporting surfaces, state-toned warning/error content, responsive footer actions, and compact progress rows.
- Added focused component coverage for the new provider-card hierarchy while preserving existing parse-failure, indeterminate-progress, and source-page recovery checks.
- Added `npm run phase236:review`, which validates code/doc markers and runs a Playwright dashboard visual review for light and dark provider cards at `360px`, `420px`, and full-page width.

## Verification

- `npm run phase236:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

The Playwright review stores its screenshots and machine-readable report under:

- `tmp/phase236-dashboard-provider-card-material-review/`
