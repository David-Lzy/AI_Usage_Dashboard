# Phase 431 - Settings Carousel All Provider Sections

Status: completed

## Goal

Move all provider-shaped Settings sections onto the reusable carousel container without changing their business behavior.

## Scope

- Migrate Quick Setup provider cards.
- Migrate Visibility rows.
- Migrate Permissions prompts.
- Migrate Credentials provider sections.
- Migrate Source cards.
- Use one-card focus with next-card peek on narrow layouts and multi-card browse on wider layouts.

## Preserved Boundaries

- Do not change enabled/provider visibility semantics.
- Do not change permissions, credentials, source preference, or page binding flows.
- Do not hide advanced/debug controls from users who have enabled those levels.

## Acceptance

- Every migrated section preserves its previous controls and data attributes where tests rely on them.
- Carousel navigation works with mouse, touch, and keyboard.
- Compact and RTL layouts do not overlap or clip provider card content.

## Planned Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 432 runs visual QA, documentation closeout, and final verification.

## Completion Summary

- Migrated Quick Setup, Visibility, Permissions, Credentials, and Source provider-shaped Settings sections onto the reusable `ProviderCarousel`.
- Preserved existing provider business controls, data hooks, forms, source preference controls, permission actions, page-binding actions, and Quick Setup visibility controls.
- Kept focused Settings deep links visible by passing focused provider ids into the relevant carousel initial slide for Quick Setup, credential, and source-provider routes.
- Preserved RTL semantics by threading the runtime text direction into migrated carousel sections.

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx`
- `npm run typecheck`
- `git diff --check`
