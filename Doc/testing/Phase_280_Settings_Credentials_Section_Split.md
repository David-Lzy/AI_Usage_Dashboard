# Phase 280 - Settings Credentials Section Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 280 Settings credentials section extraction plus regression checks

## Scope

Phase 280 moved credential card rendering from `src/sidepanel/components/SettingsSections.tsx` into:

- `src/sidepanel/components/SettingsCredentialsSection.tsx`

`SettingsSections.tsx` still re-exports the credential section and type so existing Settings page imports keep working.

## Review Coverage

- `npm run test -- src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
  - verifies API-key and Codex credential cards keep their data hooks, password fields, and save actions
  - verifies overview, visibility, and permissions sections still render from `SettingsSections.tsx`
  - verifies the Settings page still renders with the same section import contract
- `npm run phase280:review`
  - verifies `phase280:review` package script wiring
  - verifies credential rendering markers moved to `SettingsCredentialsSection.tsx`
  - verifies `SettingsSections.tsx` no longer owns credential form rendering
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase280:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
