# Phase 459 - Settings Overview Locale Theme Promotion

Status: queued

## Goal

Promote application language and theme mode into the Settings overview so the most important global preferences are visible before deeper Appearance controls.

## Scope

- Move or duplicate the application language and theme mode controls into Settings overview.
- Keep one canonical update path for each setting; avoid two independently maintained control implementations.
- Decide whether the Appearance & Sync section should keep secondary copies or replace them with overview-owned controls.
- Preserve the responsive display-level helper layout from `Phase 446`.

## Preserved Boundaries

- Do not change locale registry, locale normalization, theme mode storage, or runtime `lang`/`dir` behavior.
- Do not change provider settings, permissions, credentials, source preferences, or release packaging.

## Acceptance

- Settings overview shows language and theme mode near display level.
- Changing either overview control persists through the existing settings update path.
- There is no contradictory second language/theme state in Appearance & Sync.
- Settings render tests cover the new control placement.

## Planned Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsOverviewSection.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If overview becomes too tall at sidepanel width, open a small responsive-density phase instead of reverting the promotion.
