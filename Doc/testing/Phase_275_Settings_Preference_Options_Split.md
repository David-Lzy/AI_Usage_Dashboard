# Phase 275 - Settings Preference Options Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 275 Settings preference options split and regression checks

## Scope

Phase 275 moved Settings preference option assembly from `src/sidepanel/components/SettingsPreferencesSection.tsx` into:

- `src/sidepanel/settings-preference-options.ts`

`SettingsPreferencesSection` still renders the same Material controls, popup appearance preview, and theme customization card with the same prop contract.

## Review Coverage

- `npm run test -- src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
  - verifies the extracted option builder emits localized locale, theme, sync interval, warning threshold, and action badge option values
  - verifies zh-CN numeric helper copy remains bound to the existing validation ranges
  - verifies the Settings preferences section still renders the same Material select, editable number combobox, popup preview, and theme customization markers
- `npm run phase275:review`
  - verifies `phase275:review` package script wiring
  - verifies preference option assembly moved out of `SettingsPreferencesSection.tsx`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run phase275:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
