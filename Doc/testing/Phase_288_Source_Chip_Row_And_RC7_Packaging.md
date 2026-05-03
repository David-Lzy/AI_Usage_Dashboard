# Phase 288 - Source Chip Row And RC7 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.7` package closeout after the Settings source-chip row fix

## Scope

Phase 288 fixes Settings source-card chip groups that stacked vertically and wasted space in Chrome. The change makes source, contract, fidelity, and state chips use horizontal wrapping rows.

Included:

- Settings source-card chip flex wrapping
- wide-card right alignment and narrow-card left alignment
- header min-width protection for text/chip wrapping
- package version `0.1.0-rc.7`
- Chrome manifest version `0.1.0.7`
- release zip `release/ai-usage-dashboard-0.1.0-rc.7.zip`
- release docs and TODO priority alignment

Out of scope:

- provider parser behavior
- sync behavior
- source truth labels
- host permission semantics
- progress data semantics
- store screenshot capture/import/archive execution

## Review Coverage

- focused component tests
  - keeps SettingsSourceCard and SettingsSourceSection markup semantics stable
- `npm run build`
  - verifies the extension bundle is rebuilt into `dist`
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase288:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, CSS markers, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run test -- src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.7.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.7.zip`
- `npm run phase288:review`
- `npm run docs:check`
- `git diff --check`
