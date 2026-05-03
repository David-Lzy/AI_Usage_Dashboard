# Phase 277 - Theme Customization Card Component

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 277 theme customization card component extraction and regression checks

## Scope

Phase 277 moved Settings theme customization rendering and custom seed preview logic from `src/sidepanel/components/SettingsPreferencesSection.tsx` into:

- `src/sidepanel/components/ThemeCustomizationCard.tsx`

`SettingsPreferencesSection` still renders the same preference controls and composes the popup appearance preview plus theme customization card with the same prop contract.

## Review Coverage

- `npm run test -- src/sidepanel/components/ThemeCustomizationCard.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
  - verifies valid custom seeds render a preview grid and normalized preview copy
  - verifies invalid custom seeds do not render a preview grid and keep apply/reset disabled according to existing settings state
  - verifies zh-CN theme customization copy still comes from runtime i18n
  - verifies the Settings preferences section still renders the theme customization marker alongside preference controls and popup preview
- `npm run phase277:review`
  - verifies `phase277:review` package script wiring
  - verifies theme customization rendering moved out of `SettingsPreferencesSection.tsx`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/components/ThemeCustomizationCard.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run phase277:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
