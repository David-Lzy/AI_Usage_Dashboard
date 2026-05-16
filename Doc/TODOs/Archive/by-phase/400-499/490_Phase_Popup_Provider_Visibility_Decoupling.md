# Phase 490 - Popup Provider Visibility Decoupling

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Keep popup provider cards independent from the Settings quick-setup dashboard visibility toggle. A user hiding a provider from the dashboard should not accidentally remove that provider from the toolbar popup.

## Scope

- Build popup provider candidates from all shipped provider contracts instead of `provider.enabled`.
- Keep deferred provider contracts, such as the retained JetBrains path, out of the popup candidate list.
- Preserve `providerOrderBySurface.popup` ordering for popup provider cards.
- Change popup "Stop showing" to hide the provider only for the current popup session instead of persisting `provider.enabled=false`.
- Remove the old popup hide-provider message helper that wrote through the dashboard visibility setting.

## Preserved Boundaries

- Do not change dashboard, side panel, or full-page provider visibility semantics.
- Do not change provider source truth, permissions, storage schema, or provider support claims.
- Do not introduce a new persistent popup visibility preference in this phase.
- Keep RC22 package bytes unchanged; this is a source-only follow-up after the packaged RC22 candidate.

## Acceptance

- If only Codex is checked in Quick Setup, popup candidates still include the other shipped providers.
- JetBrains remains excluded from popup candidates while its only retained source path is deferred.
- Popup "Stop showing" does not send `app:set-provider-enabled`.
- Focused popup and sidepanel view-model tests pass.

## Verification

- `npm run test -- src/popup/view-models.test.ts src/sidepanel/view-models.test.ts src/popup/popup-guidance-action.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If users later need persistent per-popup provider visibility, add an explicit popup visibility setting instead of reusing dashboard `provider.enabled`.
