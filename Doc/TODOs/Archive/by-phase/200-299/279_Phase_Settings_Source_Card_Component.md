# Phase 279 - Settings Source Card Component

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a Settings maintainability slice; it extracts source-card article rendering without changing source-selection, diagnostics, or session-page behavior

## Goal

Continue the remaining Settings component split by moving Source Connections card rendering out of `src/sidepanel/components/SettingsSourceSection.tsx`.

## Scope

- add `src/sidepanel/components/SettingsSourceCard.tsx`
- keep `SettingsSourceSection.tsx` as the section wrapper, snapshot lookup owner, and provider list mapper
- move source display construction, source card view-model construction, source preference Material select rendering, session-page actions, and detailed diagnostic rendering into the new component
- add focused component coverage for the extracted card

## Preserved Boundaries

- do not change provider source preference semantics, provider data models, source truth labels, diagnostic presentation, session-page action availability, page-binding behavior, sync behavior, CSS class names, or Material select behavior
- do not change Settings route callback ownership or source preference dispatch wiring
- do not split `SettingsSourceCard.tsx` further in this slice

## Completed Work

- Added `src/sidepanel/components/SettingsSourceCard.tsx`.
- Added `src/sidepanel/components/SettingsSourceCard.test.tsx`.
- Reduced `src/sidepanel/components/SettingsSourceSection.tsx` from `394` lines to `93` lines.
- Added `npm run phase279:review` to verify the section wrapper no longer owns source-card article rendering and closeout docs stay current.

## Verification

- `npm run test -- src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run phase279:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the remaining file-splitting queue with narrow phases:

- reassess `src/sidepanel/components/SettingsSections.tsx`, which now carries several Settings section components in one module
- reassess `src/sidepanel/App.tsx` and standard app action modules after the Settings component queue is below the current largest-file threshold
- keep source truth, sync behavior, and Material visual contracts unchanged while doing maintenance splits
