# Phase 511 - Popup Weekly Reset Weekday-Time Label

Date: 2026-05-17

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Show weekly popup quota reset times as weekday plus time instead of a bare calendar date when the provider supplies a timestamp.

## Scope

- Format weekly and model-weekly compact popup reset timestamps like `Tue 09:15` / `周二 09:15`.
- Keep monthly and daily compact reset labels date-based.
- Align the popup appearance preview sample with the same weekly reset format.

## Preserved Boundaries

- No quota math, provider parser, reset source value, or raw evidence changed.
- No detailed side-panel reset display changed.
- No localization catalog ids changed.

## Acceptance

- Codex weekly popup labels no longer show only `19/05` when the timestamp includes a reset time.
- Claude weekday reset labels keep their existing weekday-time style.
- Popup appearance preview no longer teaches the old date-only weekly format.

## Verification

- `npm run test -- src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- During the next visual smoke pass, confirm Codex weekly labels fit in compact, balanced, and wide popup sizes.
