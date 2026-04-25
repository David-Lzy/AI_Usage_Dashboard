# Phase 183 - Provider Source Display Wrapper Localization

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Localize provider-source display wrapper labels and helper descriptions for the `en + zh_CN` runtime pilot while preserving raw provider source-truth fields exactly.

## Why This Phase Exists

`Phase 182` separated raw provider source-truth evidence from presentation-only wrappers. This phase implements that next safe bucket so popup, sidepanel, provider detail, and Settings source cards can show localized enum/helper copy without translating adapter diagnostics or provider contract evidence.

## What Changed

- This phase is the provider-source display wrapper localization slice.
- `ProviderSourceDisplayCopy` now defines the localizable provider-source wrapper contract.
- `buildProviderSourceDisplayLocalizedCopy` now supplies `zh-CN` copy for source kind, source preference, rollout, availability, fidelity, contract, connection, credential, cookie, host-access, page-binding, source-state, and availability-summary wrappers.
- sidepanel provider view models, popup view models, and Settings source cards now accept the localized provider-source display copy.
- raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, provider source contract details, notes, and graduation-gate evidence remain raw source-truth values.
- `phase183-provider-source-display-wrapper-localization-review.mjs` verifies wiring, docs, closeouts, and raw-field passthrough markers.

## Protected Raw Fields

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`
- `ProviderSourcePlan.contractDetail`
- `ProviderSourcePlan.note`
- `ProviderSourcePlan.graduationGateLabel`
- `ProviderSourcePlan.graduationGateDetail`
- provider labels, ids, host labels, route hints, URLs, and API names

## Verification

- `npm run phase183:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe `Direction 09` slice is an adapter diagnostic typed reason-code plan before any localization of raw adapter diagnostic bodies.
