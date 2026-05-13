# Phase 176 - Locale-Aware Duration And Freshness Labels

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Extend the shipped `en + zh_CN` runtime pilot into duration-bearing freshness and reset labels so popup and dashboard status copy no longer falls back to English while the surrounding shell is localized.

## Why This Slice Existed

- `Phase 172` localized generated counts, percentages, and parseable timestamp primitives, but it did not yet localize relative freshness or duration-bearing reset phrasing
- `Phase 174` and `Phase 175` made popup explanatory copy, provider-detail shell copy, and deeper settings helper copy visibly bilingual, which made the remaining English freshness labels stand out more clearly
- the next honest i18n slice needed to widen the same shared runtime architecture instead of jumping to more locales or pretending operator workspaces were ready

## What Changed

- extended [src/shared/i18n.ts](../../../../../src/shared/i18n.ts) with locale-aware helpers for duration-bearing freshness and reset labels
- updated [src/popup/view-models.ts](../../../../../src/popup/view-models.ts) so popup snapshot-status freshness labels and featured-provider freshness chips now localize under the shipped `en + zh_CN` pilot
- updated [src/sidepanel/components/ProviderCard.tsx](../../../../../src/sidepanel/components/ProviderCard.tsx) so dashboard provider cards now localize freshness plus duration-bearing reset labels
- extended verification in:
  - [src/shared/i18n.test.ts](../../../../../src/shared/i18n.test.ts)
  - [src/popup/view-models.test.ts](../../../../../src/popup/view-models.test.ts)
  - [phase176-locale-aware-duration-review.mjs](../../../../../scripts/phase176-locale-aware-duration-review.mjs)
- refreshed the maintained i18n references, `Direction 09`, README, the strategic index, the top-level TODO, and the phase index to reflect the broader but still partial runtime pilot boundary

## Result

The runtime i18n pilot now covers popup/dashboard shells, popup explanatory copy, the first settings-shell rollout, deeper settings helper copy, provider-detail shell/static copy, locale-aware generated values, and duration-bearing runtime freshness/reset labels under one shared `en + zh_CN` architecture.

## Truth Boundary

- this slice does not yet harden compact-width translation QA for the longer localized duration phrases
- this slice does not yet complete explicit RTL review
- this slice does not yet localize operator workspaces
- this slice still leaves raw provider source-truth detail strings closer to the current product/source contract when translating them would risk misrepresenting the underlying state
- non-parseable vendor-owned strings still remain raw source-truth values

## Verification

- `npm run phase176:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- harden compact-width translation QA for the shipped `en + zh_CN` pilot
- then perform explicit RTL review before any broader locale-tier expansion
- then revisit how much raw provider source-truth detail should remain intentionally untranslated
