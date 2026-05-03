# Phase 287 - Progress Row Spacing And RC6 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.6` package closeout after the provider-card linear progress-row spacing fix

## Scope

Phase 287 fixes a Chrome-visible density issue where dashboard provider-card linear progress rows could appear cramped, with divider lines and detail text visually too close to each other.

Included:

- provider-card linear usage-window row padding
- provider-card linear divider spacing
- usage-progress label/value shrink and nowrap rules
- package version `0.1.0-rc.6`
- Chrome manifest version `0.1.0.6`
- release zip `release/ai-usage-dashboard-0.1.0-rc.6.zip`
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
  - keeps ProviderCard, UsageWindowProgressList, and UsageProgress markup semantics stable
- `npm run build`
  - verifies the extension bundle is rebuilt into `dist`
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase287:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, CSS markers, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run test -- src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx src/sidepanel/components/UsageProgress.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.6.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.6.zip`
- `npm run phase287:review`
- `npm run docs:check`
- `git diff --check`
