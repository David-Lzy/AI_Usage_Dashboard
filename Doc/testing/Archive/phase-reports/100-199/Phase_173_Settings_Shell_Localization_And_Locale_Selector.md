# Phase 173 - Settings Shell Localization And Locale Selector

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

Extend the first runtime i18n rollout into Settings so the pilot no longer stops at popup and dashboard shell copy, while also exposing one real locale selector for `system | en | zh-CN`.

## Why This Slice Existed

- `Phase 171` shipped only popup plus dashboard shell localization
- `Phase 172` added locale-aware generated-value formatting but still left Settings almost entirely English
- the broader `en` plus `zh_CN` pilot needed one real user-facing locale control before deeper copy rollout could be exercised honestly

## What Changed

- extended [src/shared/i18n.ts](../../../../../src/shared/i18n.ts) with the first settings-shell runtime ids for:
  - top bar
  - overview card
  - section navigation
  - summary-strip labels
  - global-preferences labels
  - locale selector labels
  - theme preset labels
  - top-level credentials, sources, and permissions section headings
  - preferences-saved toast copy
- added [buildSettingsSummaryLabels](../../../../../src/shared/i18n.ts) so the settings summary strip stops hardcoding English labels
- updated [src/sidepanel/settings-view-models.ts](../../../../../src/sidepanel/settings-view-models.ts) so settings summary labels and values can be localized and formatted
- updated [src/sidepanel/routes/SettingsPage.tsx](../../../../../src/sidepanel/routes/SettingsPage.tsx) to:
  - resolve runtime locale for Settings
  - localize the first settings-shell slice
  - expose one persisted locale selector for `system | en | zh-CN`
  - localize theme mode and preset labels
- updated [src/sidepanel/App.tsx](../../../../../src/sidepanel/App.tsx) so the preferences-saved toast now uses localized runtime messages
- extended verification in:
  - [src/shared/i18n.test.ts](../../../../../src/shared/i18n.test.ts)
  - [src/sidepanel/settings-view-models.test.ts](../../../../../src/sidepanel/settings-view-models.test.ts)
  - [phase173-settings-shell-i18n-review.mjs](../../../../../scripts/phase173-settings-shell-i18n-review.mjs)
- refreshed the maintained i18n references, `Direction 09`, README, the strategic index, and the phase index to reflect the broader but still partial runtime pilot boundary

## Result

The runtime i18n pilot now reaches popup, dashboard, and the first settings-shell slice. The extension also now exposes a real persisted locale selector in Settings, so `en` and `zh_CN` can be exercised without changing the browser UI language.

## Truth Boundary

- this slice does not yet localize most provider-detail copy
- this slice does not yet localize most popup explanatory cards
- this slice does not yet localize deeper settings helper copy such as most credential help text and source-card diagnostics
- this slice does not yet localize durations or relative freshness phrasing
- non-parseable vendor-owned strings still remain raw source-truth values

## Verification

- `npm run phase173:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- continue the broader `en` plus `zh_CN` runtime pilot rollout into provider-detail copy and popup explanatory copy
- then localize deeper settings helper copy where it is stable enough to avoid churn
- then harden localized durations plus compact-width and RTL review
