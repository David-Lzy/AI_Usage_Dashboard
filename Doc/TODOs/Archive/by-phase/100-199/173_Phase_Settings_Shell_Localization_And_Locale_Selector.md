# Phase 173 - Settings Shell Localization And Locale Selector

Date: 2026-04-24

Status: completed and archived

Depends on:

- [170_Phase_Manifest_Locale_Bootstrap_And_Message_ID_Contract.md](./170_Phase_Manifest_Locale_Bootstrap_And_Message_ID_Contract.md)
- [171_Phase_Runtime_Localization_Layer_And_First_Shell_Strings.md](./171_Phase_Runtime_Localization_Layer_And_First_Shell_Strings.md)
- [172_Phase_Locale_Aware_Runtime_Value_Formatting.md](./172_Phase_Locale_Aware_Runtime_Value_Formatting.md)

## Summary

This phase extended the runtime i18n pilot into the first Settings shell slice and added one persisted locale selector for `system | en | zh-CN`.

## Completed Work

- localized the Settings top bar, overview card, section navigation, summary-strip labels, global-preferences labels, locale selector labels, theme preset labels, and top-level section headings
- localized the preferences-saved toast
- added localized settings-summary label wiring
- added the runtime locale selector to Settings
- refreshed the i18n references, roadmap direction, README, strategic index, and phase index

## Verification

- `npm run phase173:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Remaining Truth

- most provider-detail copy still remains English
- most popup explanatory copy still remains English
- deeper settings helper copy still remains English
- localized durations and relative freshness phrasing still remain future work
