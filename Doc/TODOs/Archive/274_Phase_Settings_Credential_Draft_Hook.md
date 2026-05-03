# Phase 274 - Settings Credential Draft Hook

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a Settings container maintainability slice; it extracts credential draft state without changing Settings UI behavior or credential dispatch semantics

## Goal

Continue the Settings page maintenance queue by moving credential and Codex workspace draft state out of `src/sidepanel/routes/SettingsPage.tsx`.

## Scope

- add `src/sidepanel/use-settings-credential-drafts.ts`
- move provider API key draft state, Codex analytics key draft state, Codex workspace id draft state, and related save/clear/input handlers out of `SettingsPage.tsx`
- keep `SettingsPage` props, `SettingsCredentialsSection` props, and parent dispatch wiring unchanged
- keep theme custom seed draft state in `SettingsPage.tsx`

## Preserved Boundaries

- do not change Settings visual layout, Material controls, credential persistence semantics, Codex workspace config dispatch, provider data models, source truth labels, or runtime locale behavior
- do not change credential storage or request raw cookies/session secrets
- do not split preferences/source/visibility rendering in this slice

## Completed Work

- Added `src/sidepanel/use-settings-credential-drafts.ts`.
- Moved credential and Codex workspace config draft handlers into the new hook.
- Reduced `src/sidepanel/routes/SettingsPage.tsx` from `460` lines to `413` lines.
- Added `npm run phase274:review` to verify runtime markers, closeout docs, and split-boundary preservation.

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run phase274:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- reassess whether Settings custom-seed draft state should move into a small hook
- reassess `src/sidepanel/components/SettingsPreferencesSection.tsx`, currently the largest Settings-adjacent file
- avoid mixing Settings state extraction with visual redesign work
