# Phase 172 - Locale-Aware Runtime Value Formatting

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

Land the first locale-aware runtime formatting slice so popup, dashboard, and provider-detail surfaces stop hardcoding raw English-style generated counts and parseable timestamp primitives once the runtime i18n shell layer already exists.

## Why This Slice Existed

- `Phase 171` localized only one narrow shell slice and left generated values mostly unformatted per locale
- the repo needed one shared formatting contract before broader settings or provider-detail copy moved under runtime i18n
- counts, percentages, and parseable timestamp primitives were the smallest high-signal value slice that could improve `en` plus `zh_CN` without pretending the whole runtime was translated

## What Changed

- extended [src/shared/i18n.ts](../../../../../src/shared/i18n.ts) with locale-aware value helpers for:
  - percentages
  - parseable timestamp primitives
- threaded localized numeric formatting into shared summary builders:
  - [src/sidepanel/view-models.ts](../../../../../src/sidepanel/view-models.ts)
  - [src/popup/view-models.ts](../../../../../src/popup/view-models.ts)
- applied locale-aware formatting to runtime surfaces that generate values:
  - popup top-summary and setup-coverage counts
  - dashboard top-summary counts
  - provider-card numeric usage strings
  - provider-detail numeric usage strings plus parseable `resetAt` and `syncedAt` fields
- kept the truth boundary narrow:
  - non-parseable vendor-owned strings such as billing-window labels still remain raw
  - most settings, provider-detail body copy, popup explanatory copy, and operator workspaces still remain English
  - localized durations still remain future work
- added verification coverage:
  - [src/shared/i18n.test.ts](../../../../../src/shared/i18n.test.ts)
  - [src/sidepanel/view-models.test.ts](../../../../../src/sidepanel/view-models.test.ts)
  - [src/popup/view-models.test.ts](../../../../../src/popup/view-models.test.ts)
  - [phase172-locale-aware-formatting-review.mjs](../../../../../scripts/phase172-locale-aware-formatting-review.mjs)
- updated maintained references, `Direction 09`, README, the strategic index, and the phase index to reflect the tighter runtime i18n boundary

## Result

The extension now localizes one narrow runtime shell slice and also formats generated counts, percentages, and parseable timestamp primitives per locale across popup, dashboard, and provider-detail surfaces. This is still a partial runtime rollout, not a claim that the whole app is translated.

## Truth Boundary

- this slice does not yet add a locale selector UI in Settings
- this slice does not yet localize most settings copy, provider-detail body copy, popup explanatory cards, or operator workspaces
- this slice does not yet localize durations or relative freshness phrasing
- non-parseable vendor-owned window labels still remain raw source-truth strings

## Verification

- `npm run phase172:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- continue the broader `en` plus `zh_CN` runtime pilot rollout
- move settings, provider-detail, and popup explanatory copy under the runtime i18n layer
- then harden localized durations plus compact-width and RTL review for the wider pilot
