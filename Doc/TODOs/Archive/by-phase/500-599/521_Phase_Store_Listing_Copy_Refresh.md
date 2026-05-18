# Phase 521 - Store Listing Copy Refresh

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Refresh Chrome Web Store listing copy for the RC24 resubmission candidate.

## Scope

- Prepare four primary store locales: English, Simplified Chinese, Traditional Chinese, and Japanese.
- Keep Spanish and Brazilian Portuguese drafts as optional existing references.
- Add a concise abstract at the top of each description so the collapsed store view shows the most important message.

## Preserved Boundaries

- Do not claim official provider affiliation.
- Do not claim exact quota when a provider source is partial, window-scoped, policy-only, or unavailable.
- Mention `favicon` only for the provider-matched toolbar icon feature.

## Result

- Store listing copy and four product-description files are aligned to RC24.

## Verification

- `npm run docs:check`
- `npm run i18n:check`
- `git diff --check`

## Follow-Up

- Localize more store languages only after the four primary upload fields are accepted.
