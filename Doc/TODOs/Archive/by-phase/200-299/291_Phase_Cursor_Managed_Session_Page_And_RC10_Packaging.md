# Phase 291 - Cursor Managed Session Page And RC10 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Make Cursor personal usage follow the proven Codex managed session-page pattern, then package `0.1.0-rc.10`.

## Completed Work

- Added `https://cursor.com/cn/dashboard/usage` as the preferred Cursor personal usage open route while preserving locale-free and locale-prefixed matching.
- Added Cursor page-session `openWhenMissing` support so manual and eligible alarm syncs can open a managed non-active tab.
- Added reload-on-capture-failure with `bypassCache: true` for unreadable Cursor usage tabs.
- Added Cursor hydration retry in the personal page client so newly opened dashboards get another parse attempt after first-page load.
- Threaded sync `trigger` from the provider registry into the Cursor adapter.
- Added the same alarm gating used by Codex: bootstrap does not auto-open pages, and repeated alarm opens stop after a logged-out page-session diagnostic.
- Added Cursor personal-page client and adapter regression tests.
- Bumped package version to `0.1.0-rc.10`.
- Bumped Chrome manifest version to `0.1.0.10` and `version_name` to `0.1.0-rc.10`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.10.zip`.
- Updated release-facing docs, Cursor provider notes, and the phase index.
- Added a Phase 291 release package and runtime marker review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.10.zip`
- SHA256: `cce07ba5e6a37548a18b0d0502fdfbeb303ff7823d254ad29a0e9664cb12f091`

## Preserved Boundaries

- Cursor personal usage still does not claim an exact remaining included-request counter.
- Cursor Admin API behavior, request mapping, and credential semantics were not changed.
- No raw cookies, auth headers, or session credentials are stored.
- The managed page is a non-active Chrome tab, not a truly hidden background webview.
- Provider closure for Claude, JetBrains, and Gemini remains account-gated.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.

## Verification

- `npm run test -- src/providers/cursor/personal-page-capture.test.ts src/providers/cursor/personal-page-client.test.ts src/providers/cursor/personal-page-parser.test.ts src/providers/cursor/adapter.test.ts --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.10.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.10.zip`
- `npm run phase291:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.10` in the RDP Chrome profile, log into Cursor, grant `cursor.com` host access if prompted, then refresh Cursor from the extension. The expected path is a non-active managed Cursor usage tab that can be reloaded and retried automatically when the first capture is unreadable or still hydrating.
