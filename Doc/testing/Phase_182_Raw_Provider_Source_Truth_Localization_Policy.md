# Phase 182 - Raw Provider Source-Truth Localization Policy

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Define the localization boundary for raw provider source-truth strings before localizing provider-source display wrappers.

## Why This Phase Exists

After `Phase 181`, the remaining `Direction 09` work moved from store screenshot helpers to provider detail and Settings source-card strings. Some of those strings are presentation-only labels, but others are adapter evidence fields or source-contract statements. This phase prevents the next runtime localization slice from translating raw provider evidence too early.

## What Changed

- [I18n_Raw_Provider_Source_Truth_Policy.md](../I18n/I18n_Raw_Provider_Source_Truth_Policy.md) now defines protected raw fields and safe presentation-only candidates
- [09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md](../Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md) now marks raw provider source-truth policy complete and queues provider-source display wrapper localization next
- [I18n_String_Inventory_Baseline.md](../I18n/I18n_String_Inventory_Baseline.md) now references the new policy boundary
- [I18n_Message_ID_Contract.md](../I18n/I18n_Message_ID_Contract.md) now records that raw provider source-truth copy is governed by the new maintained reference
- [phase182-provider-source-truth-policy-review.mjs](../../scripts/phase182-provider-source-truth-policy-review.mjs) verifies the policy and roadmap references

## Protected Raw Fields

The policy keeps these fields raw for now:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`
- non-parseable vendor or policy time-window labels
- provider source contract details, notes, and graduation-gate details
- provider labels, ids, route hints, URLs, host labels, and API names

## Next Localizable Bucket

The next safe runtime slice is provider-source display wrapper localization:

- source kind labels
- source preference labels
- rollout, availability, fidelity, connection, and contract labels
- credential, cookie, host-access, and page-binding helper labels
- generated availability summaries

## Verification

- `npm run phase182:review`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

Implement provider-source display wrapper localization while preserving raw adapter evidence fields exactly.
