# Phase 280 - Settings Credentials Section Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a Settings maintainability slice; it extracts credential card rendering without changing credential storage, draft state, or Settings route callback ownership

## Goal

Continue the Settings component split by moving credential card rendering out of `src/sidepanel/components/SettingsSections.tsx`.

## Scope

- add `src/sidepanel/components/SettingsCredentialsSection.tsx`
- move API-key credential cards, Codex analytics credential card, credential form rendering, and `CredentialProviderSection` type ownership into the new component
- keep `SettingsSections.tsx` as the low-risk overview, visibility, and permissions section module with a compatibility re-export for the credentials section
- move focused credential rendering coverage into `SettingsCredentialsSection.test.tsx`

## Preserved Boundaries

- do not change credential draft state, credential save/clear dispatch semantics, Codex workspace config dispatch, stored-credential truth labels, Settings route imports, form class names, or data hooks
- do not change provider settings, source preferences, page-binding behavior, sync behavior, or Material control styling

## Completed Work

- Added `src/sidepanel/components/SettingsCredentialsSection.tsx`.
- Added `src/sidepanel/components/SettingsCredentialsSection.test.tsx`.
- Reduced `src/sidepanel/components/SettingsSections.tsx` from `394` lines to `142` lines.
- Added a compatibility re-export from `SettingsSections.tsx` so `SettingsPage.tsx` keeps its existing import path.
- Added `npm run phase280:review` to verify credential rendering no longer lives in `SettingsSections.tsx`.

## Verification

- `npm run test -- src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase280:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the remaining split queue with narrow phases:

- reassess `src/sidepanel/App.tsx` and `src/sidepanel/standard-app-actions.ts`
- reassess medium-sized UI route files only after the current Settings/App split queue is closed
- keep maintenance splits separate from provider behavior or visual redesign work
