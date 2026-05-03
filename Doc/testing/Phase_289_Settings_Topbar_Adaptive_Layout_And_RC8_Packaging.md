# Phase 289 - Settings Topbar Adaptive Layout And RC8 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.8` package closeout after the Settings top-bar adaptive layout fix

## Scope

Phase 289 fixes the Settings top app bar layout so full-page tab mode uses horizontal space better and sidebar widths center the action and section-navigation rows.

Included:

- Settings-only wide title/chips/actions top-bar grid
- centered section chips on wide surfaces
- centered action row and centered section chips at sidebar widths
- section anchor offset alignment for the broader stacked breakpoint
- package version `0.1.0-rc.8`
- Chrome manifest version `0.1.0.8`
- release zip `release/ai-usage-dashboard-0.1.0-rc.8.zip`
- release docs and TODO priority alignment

Out of scope:

- provider parser behavior
- sync behavior
- source truth labels
- host permission semantics
- progress data semantics
- store screenshot capture/import/archive execution

## Review Coverage

- focused component and route tests
  - keeps SettingsPage, SettingsNavigation, and TopBar markup semantics stable
- `npm run build`
  - verifies the extension bundle is rebuilt into `dist`
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase289:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, CSS markers, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/components/TopBar.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.8.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.8.zip`
- `npm run phase289:review`
- `npm run docs:check`
- `git diff --check`
