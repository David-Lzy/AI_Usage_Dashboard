# Phase 171 - Runtime Localization Layer And First Shell Strings

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

Land the first real runtime localization slice by adding one shared popup/sidepanel i18n helper, persisting locale preference in app state, and localizing one narrow shell slice instead of pretending the full app is translated.

## Why This Slice Existed

- `Phase 170` only localized the manifest contract and left the React runtime truthfully English-only
- the repo needed one shared runtime lookup layer before more settings or provider-detail strings could move under i18n
- popup and dashboard shell strings were the smallest high-signal slice that could prove the architecture without over-claiming translation coverage

## What Changed

- added runtime locale preference to app settings:
  - `AppSettings.locale` now persists `system | en | zh-CN`
  - storage normalization now backfills missing locale to `system`
- added one shared runtime localization helper:
  - [src/shared/i18n.ts](../../src/shared/i18n.ts)
  - runtime locale resolution now prefers Chrome UI language, then browser language
- localized the first runtime shell slice:
  - popup loading and error shell
  - popup header shell and top summary labels
  - dashboard top bar, hero, providers section, empty state, and summary labels
  - quick theme-toggle labels for popup and standard sidepanel/full-page top bars
- kept summary view-model builders backwards-compatible by adding label overrides instead of rewriting their English defaults
- added verification coverage:
  - [src/shared/i18n.test.ts](../../src/shared/i18n.test.ts)
  - [phase171-runtime-i18n-layer-review.mjs](../../scripts/phase171-runtime-i18n-layer-review.mjs)
- updated maintained references, `Direction 09`, README, the strategic index, and the phase index to reflect the new runtime truth boundary

## Result

The extension is no longer runtime-English-only at the shell level. Manifest surfaces plus a narrow popup/dashboard shell slice now localize to `en` and `zh_CN`, while the repo also has one persisted locale preference and one reusable runtime i18n helper for later rollout work.

## Truth Boundary

- this slice does not yet add a locale selector UI in Settings
- this slice does not yet localize most settings copy, provider-detail copy, popup explanatory cards, or operator workspaces
- this slice does not yet add locale-aware formatting for counts, dates, or durations
- `zh_CN` now covers manifest surfaces plus the first popup/dashboard shell slice, not the whole runtime app

## Verification

- `npm run phase171:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- add locale-aware formatting for counts, dates, and durations
- continue moving settings, provider-detail, and popup explanatory copy under the runtime i18n layer
- then harden compact-width and RTL review for the broader `en` plus `zh_CN` pilot rollout
