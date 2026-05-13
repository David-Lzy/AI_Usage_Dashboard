# Phase 271 - Settings Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 271 Settings copy split and regression checks

## Scope

Phase 271 moved Settings structured localized copy from `src/shared/localized-copy.ts` into:

- `src/shared/settings-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildSettingsLocalizedCopy`, `getSettingsSourcePreferenceLabel`, and `getSettingsSourceKindLabel`, so existing Settings routes, Settings section components, and Settings view-model consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/settings-localized-copy.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
  - verifies English Settings credential/source copy and source-label helpers
  - verifies Simplified Chinese Settings helper copy
  - verifies the existing `localized-copy` re-export path still works
  - keeps existing runtime i18n, Settings view-model, and Settings section component coverage adjacent to the moved Settings copy
- `npm run phase271:review`
  - verifies `phase271:review` package script wiring
  - verifies Settings copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/settings-localized-copy.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run phase271:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
