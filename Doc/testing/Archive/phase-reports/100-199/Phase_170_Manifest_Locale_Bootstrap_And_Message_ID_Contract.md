# Phase 170 - Manifest Locale Bootstrap And Message ID Contract

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

Start `Direction 09` with one real localization baseline by localizing the manifest contract, adding baseline locale catalogs, and defining one stable message-id model before the runtime React layer ships.

## Why This Slice Existed

- the repo had already formalized `Direction 09` and `Direction 09.2` but no executable i18n slice had landed yet
- the manifest still lacked `default_locale` and `_locales/`
- popup and sidepanel runtime copy is still moving enough that the first safe step is the manifest contract plus the naming model, not a rushed full React translation pass

## What Changed

- `src/manifest.json` now ships:
  - `default_locale = en`
  - localized `name`
  - localized `description`
  - localized `action.default_title`
- added baseline locale catalogs:
  - `public/_locales/en/messages.json`
  - `public/_locales/zh_CN/messages.json`
- added maintained i18n reference docs:
  - [I18n_Message_ID_Contract.md](../../../../I18n/I18n_Message_ID_Contract.md)
  - [I18n_String_Inventory_Baseline.md](../../../../I18n/I18n_String_Inventory_Baseline.md)
- added one repeatable review:
  - [phase170-manifest-locale-bootstrap-review.mjs](../../../../../scripts/phase170-manifest-locale-bootstrap-review.mjs)
- updated `Direction 09`, `Direction 09.2`, README, the strategic index, and the phase index so the active repo-owned engineering line now moves into the runtime localization layer

## Result

The extension is no longer manifest-English-only. Chrome-facing manifest surfaces now have one locale baseline in `en` and `zh_CN`, while the repo also has one explicit message-id contract and one baseline inventory for the future runtime extraction work.

## Truth Boundary

- this slice does not localize the popup, sidepanel, settings, or provider-detail runtime copy
- the runtime app still remains effectively English-only after `Phase 170`
- `zh_CN` currently covers manifest-level Chrome surfaces only

## Verification

- `npm run phase170:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- start the runtime localization layer for React surfaces
- wire locale-aware formatting for counts, dates, and durations
- then move into the `en` plus `zh_CN` runtime pilot rollout
