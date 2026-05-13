# Phase 286 - RC5 Release Packaging

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.5` package closeout after Phase 285 post-rc4 smoke polish

## Scope

Phase 286 packages the next release candidate so the Chrome review artifact includes the Phase 285 provider-card, Settings navigation, full-page FAB, and host-access refresh fixes.

Included:

- package version `0.1.0-rc.5`
- Chrome manifest version `0.1.0.5`
- release zip `release/ai-usage-dashboard-0.1.0-rc.5.zip`
- release docs and TODO priority alignment
- explicit preservation of the current provider truth boundaries

Out of scope:

- provider parser behavior
- sync behavior
- source truth labels
- host permission semantics
- store screenshot capture/import/archive execution

## Review Coverage

- `npm run release:check`
  - verifies TypeScript, unit tests, and release build
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase286:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.5.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.5.zip`
- `npm run phase286:review`
- `npm run docs:check`
- `git diff --check`
