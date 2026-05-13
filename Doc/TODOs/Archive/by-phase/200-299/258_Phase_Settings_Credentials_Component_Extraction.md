# Phase 258 - Settings Credentials Component Extraction

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow SettingsPage maintainability slice; it extracts the credential section without changing credential storage or provider source behavior

## Goal

Continue splitting the oversized `SettingsPage.tsx` file by moving the provider credentials section into the existing focused Settings section component module.

## Scope

- add `SettingsCredentialsSection` to `src/sidepanel/components/SettingsSections.tsx`
- move the `CredentialProviderSection` type next to the extracted section component
- update `SettingsPage.tsx` to consume the extracted credentials section while retaining local input state and form handlers
- extend focused Settings section tests for stable credential hooks
- preserve provider credential status, localized labels, form submit/clear dispatch, Codex workspace config dispatch, and existing stored-credential truth labels

## Preserved Boundaries

- do not change credential persistence, provider source selection, sync behavior, host permission semantics, provider truth labels, or any credential value storage format
- do not change Settings CSS in this slice
- do not split preferences, sources, `App.tsx`, or `src/shared/localized-copy.ts` in this slice

## Completed Work

- Extracted `SettingsCredentialsSection` into `src/sidepanel/components/SettingsSections.tsx`.
- Kept `SettingsPage.tsx` responsible for local draft state, credential save/clear handlers, Codex workspace config handlers, and localized copy selection.
- Extended `src/sidepanel/components/SettingsSections.test.tsx`.
- Added `npm run phase258:review` to verify runtime markers, tests/docs markers, compact Settings visual behavior, credential-card rendering, form rendering, password inputs, and horizontal overflow.

## Verification

- `npm run test -- src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase258:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split another self-contained `SettingsPage.tsx` section or helper group, likely preferences or source cards
- split `App.tsx`
- split `src/shared/localized-copy.ts`
