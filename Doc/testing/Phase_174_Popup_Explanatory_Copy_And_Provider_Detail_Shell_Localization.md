# Phase 174 - Popup Explanatory Copy And Provider Detail Shell Localization

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Extend the `en + zh_CN` runtime i18n pilot beyond shell labels so popup explanatory copy and provider-detail shell/static copy are no longer left almost entirely English.

## Why This Slice Existed

- `Phase 171` shipped only popup plus dashboard shell localization
- `Phase 172` added locale-aware generated-value formatting but not broader explanatory copy
- `Phase 173` localized the first settings-shell slice and added the locale selector, but still left most popup explanatory copy and provider-detail shell copy outside the shipped pilot
- the next honest runtime i18n slice had to move one layer deeper without pretending the entire provider-detail source contract was ready for translation

## What Changed

- added [src/shared/localized-copy.ts](../../src/shared/localized-copy.ts) as one shared structured runtime-copy helper for popup explanatory text and provider-detail shell/static copy
- updated [src/popup/view-models.ts](../../src/popup/view-models.ts) so popup explanatory sections can be localized after the base view model is built
- updated [src/popup/PopupApp.tsx](../../src/popup/PopupApp.tsx) so popup runtime now consumes the localized popup view model and localized explanatory aria labels
- updated [src/sidepanel/routes/ProviderDetailPage.tsx](../../src/sidepanel/routes/ProviderDetailPage.tsx) so provider-detail shell/static copy now localizes:
  - top bar subtitle and action labels
  - section labels
  - field labels
  - note labels and prefixes
  - status badge labels
  - helper values such as granted, missing, and unknown
  - the hero explanatory paragraph
- kept raw provider source-truth detail strings untouched where this slice would otherwise risk translating current source semantics or vendor-owned wording too aggressively
- extended verification in:
  - [src/popup/view-models.test.ts](../../src/popup/view-models.test.ts)
  - [src/shared/i18n.test.ts](../../src/shared/i18n.test.ts)
  - [phase174-popup-provider-detail-runtime-copy-review.mjs](../../scripts/phase174-popup-provider-detail-runtime-copy-review.mjs)
- refreshed the maintained i18n references, `Direction 09`, README, the strategic index, the top-level TODO, and the phase index to reflect the broader but still partial runtime pilot boundary

## Result

The runtime i18n pilot now reaches popup shell, popup explanatory copy, dashboard shell, the first settings-shell slice, provider-detail shell/static copy, and locale-aware generated values under one shared `en + zh_CN` architecture.

## Truth Boundary

- this slice does not yet localize deeper settings helper copy such as source-card diagnostics or most credential help paragraphs
- this slice does not yet localize durations or relative freshness phrasing
- this slice does not yet localize operator workspaces
- this slice still leaves raw provider source-truth detail strings closer to the current product/source contract when translating them would risk misrepresenting the underlying state
- non-parseable vendor-owned strings still remain raw source-truth values

## Verification

- `npm run phase174:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- continue the `en + zh_CN` runtime pilot into deeper settings helper copy where the wording is stable enough to avoid churn
- then localize durations plus relative freshness phrasing
- then harden compact-width translation QA and explicit RTL review before any broader locale tier expansion
