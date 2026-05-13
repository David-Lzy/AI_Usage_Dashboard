# Phase 279 - Settings Source Card Component

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 279 Settings source-card component extraction plus regression checks

## Scope

Phase 279 moved Source Connections card article rendering from `src/sidepanel/components/SettingsSourceSection.tsx` into:

- `src/sidepanel/components/SettingsSourceCard.tsx`

`SettingsSourceSection` still owns the section shell, provider iteration, and snapshot lookup.

## Review Coverage

- `npm run test -- src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
  - verifies the extracted source card keeps the source-card article shell, provider id marker, source preference Material select, and detailed diagnostics disclosure
  - verifies the section wrapper still renders source cards through the existing provider and snapshot path
- `npm run phase279:review`
  - verifies `phase279:review` package script wiring
  - verifies source display, view-model, Material select, session action, and diagnostic rendering markers live in `SettingsSourceCard.tsx`
  - verifies `SettingsSourceSection.tsx` is now a section wrapper instead of an article-rendering component
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run phase279:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
