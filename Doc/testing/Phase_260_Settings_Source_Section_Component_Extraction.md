# Phase 260 - Settings Source Section Component Extraction

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 260 Settings source section component extraction and regression checks

## Scope

Phase 260 moved Settings Source Connections rendering from `SettingsPage.tsx` into:

- `src/sidepanel/components/SettingsSourceSection.tsx`

The page still owns localized shell copy, provider arrays, snapshot arrays, and dispatch handlers for source preference, source-page opening, active-page attach, and page-binding clear actions.

## Review Coverage

- `npm run test -- src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
  - verifies the extracted source section renders stable source-card hooks
  - verifies `SettingsPage` still renders its Settings navigation shell
- `npm run phase260:review`
  - verifies `phase260:review` package script wiring
  - verifies source-display/model assembly moved out of `SettingsPage.tsx`
  - verifies closeout documentation markers
  - starts Vite, opens compact Settings, captures the page, and verifies source cards, detail toggles, Material source preference controls, title rendering, and horizontal overflow

## Commands

- `npm run test -- src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase260:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
