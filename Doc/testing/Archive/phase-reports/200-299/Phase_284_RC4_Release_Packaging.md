# Phase 284 - RC4 Release Packaging

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.4` package closeout after Phase 283 RDP Chrome validation

## Scope

Phase 284 packages the next release candidate after the user confirmed the Phase 283 Codex reload-and-retry path in RDP Chrome.

Included:

- package version `0.1.0-rc.4`
- Chrome manifest version `0.1.0.4`
- release zip `release/ai-usage-dashboard-0.1.0-rc.4.zip`
- release docs and TODO priority alignment
- explicit clarification that provider closure is account-gated and real operator evidence is archive/export proof, not runtime feature work

Out of scope:

- provider parser behavior
- sync behavior
- source truth labels
- host permissions
- store screenshot capture/import/archive execution

## Review Coverage

- `npm run release:check`
  - verifies TypeScript, unit tests, and release build
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase284:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.4.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.4.zip`
- `npm run phase284:review`
- `npm run docs:check`
- `git diff --check`
