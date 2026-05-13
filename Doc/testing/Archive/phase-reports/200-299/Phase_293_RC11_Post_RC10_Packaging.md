# Phase 293 - RC11 Post-RC10 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.11` package closeout after the post-rc10 Cursor, usage-window, and action-badge tooltip fixes

## Scope

Phase 293 packages the current source tree as `0.1.0-rc.11`.

Included:

- package version `0.1.0-rc.11`
- Chrome manifest version `0.1.0.11`
- release zip `release/ai-usage-dashboard-0.1.0-rc.11.zip`
- rebuilt `dist`
- release-facing README, release guide, top-level TODO, roadmap, and phase-index updates
- package boundary for:
  - Cursor usage-page logged-out detection fix
  - Cursor visible billing/spend context rendered as structured usage facts
  - line-style usage-window reset copy compacted into the title row
  - action badge hover tooltip formatted into selected-badge and visible-provider sections, including Cursor visible usage facts when Cursor is enabled

Out of scope:

- provider data model changes
- exact Cursor personal remaining included-request parsing
- plan-wide absolute Codex personal remaining balance claims
- raw token, cookie, or auth-header handling
- store screenshot capture/import/archive execution
- provider coverage changes for Claude, JetBrains, or Gemini

## Review Coverage

- `npm run typecheck`
  - verifies TypeScript source after the version bump
- `npm run test -- --run`
  - verifies the full unit and integration test suite
- `npm run build`
  - verifies the extension bundle is rebuilt into `dist`
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.11.zip`
  - confirms the packaged artifact contains the expected extension files
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.11.zip`
  - records the package checksum
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `npm run docs:check`
- `git diff --check`

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.11.zip`
- SHA256: `f7d19b7bb84975b25c0d9291460f6ca418006c0e93edd36fe063ac5870f2907e`
