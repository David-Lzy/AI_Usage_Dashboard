# Phase 291 - Cursor Managed Session Page And RC10 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.10` package closeout after the Cursor managed session-page sync update

## Scope

Phase 291 aligns Cursor personal usage with the Codex managed session-page capture flow.

Included:

- preferred Cursor personal route `https://cursor.com/cn/dashboard/usage`
- managed non-active tab opening when manual or eligible alarm sync has no readable Cursor usage page
- reload-on-capture-failure for unreadable Cursor usage pages
- hydration retry for freshly opened Cursor dashboards
- sync trigger threading through the provider registry and Cursor adapter
- package version `0.1.0-rc.10`
- Chrome manifest version `0.1.0.10`
- release zip `release/ai-usage-dashboard-0.1.0-rc.10.zip`
- release docs, Cursor provider note, and TODO priority alignment

Out of scope:

- exact remaining included-request parsing for Cursor personal accounts
- Cursor Admin API credential or endpoint behavior
- raw token or cookie access
- truly hidden background webviews
- provider coverage changes for Claude, JetBrains, or Gemini
- store screenshot capture/import/archive execution

## Review Coverage

- focused Cursor provider tests
  - keeps the personal page parser, capture summary, client hydration retry, and adapter source-selection behavior stable
- `npm run build`
  - verifies the extension bundle is rebuilt into `dist`
- `npm run release:package`
  - verifies package/manifest version alignment and creates the release zip from `dist`
- `npm run phase291:review`
  - verifies package, lockfile, source manifest, built manifest, zip artifact, package script, Cursor runtime markers, and release documentation markers
- `npm run docs:check`
  - verifies documentation taxonomy and latest completed phase alignment
- `git diff --check`
  - verifies patch whitespace

## Commands

- `npm run test -- src/providers/cursor/personal-page-capture.test.ts src/providers/cursor/personal-page-client.test.ts src/providers/cursor/personal-page-parser.test.ts src/providers/cursor/adapter.test.ts --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.10.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.10.zip`
- `npm run phase291:review`
- `npm run docs:check`
- `git diff --check`
