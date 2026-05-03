# Phase 283 - Codex Page Session Capture Reload Retry

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a Codex personal session-page reliability slice; it makes manual/background refresh recover one unreadable existing Codex tab by forcing a real tab reload and retrying capture once

## Goal

When an already-open Codex usage page becomes unreadable, for example after Chrome memory saver or background tab suspension, make the refresh path trigger one real page reload before returning `capture_unavailable`.

## Scope

- add a generic `reloadOnCaptureFailure` option to the page-session client
- call `chrome.tabs.reload(tabId, { bypassCache: true })` through the injected tabs API when a first capture attempt fails and reload recovery is enabled
- wait for the reloaded tab to report `complete` when `tabs.get` is available, then retry the same capture once
- enable that option for Codex personal page capture routes
- add focused page-session and Codex capture tests

## Preserved Boundaries

- do not change provider source-selection order, Codex route matching, parser semantics, sync scheduling, page-binding semantics, source truth labels, host-access requirements, or cookie/auth-header storage boundaries
- do not enable this by default for all providers; the shipped change targets Codex personal page capture
- do not claim hidden scraping; the personal Codex path still depends on a real authenticated ChatGPT tab document

## Completed Work

- Added `PageSessionReloadOnCaptureFailure` and `reloadOnCaptureFailure` support to `src/providers/page-session.ts`.
- Enabled reload-and-retry for Codex personal page capture in `src/providers/codex/personal-page-capture.ts`.
- Added test coverage proving a failed capture can reload with `bypassCache: true` and then match on retry.
- Added `npm run phase283:review` to verify runtime and documentation markers.

## Verification

- `npm run test -- src/providers/page-session.test.ts src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-client.test.ts src/providers/codex/adapter.test.ts --run`
- `npm run phase283:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use RDP Chrome to confirm a real unreadable Codex tab recovers from the toolbar popup `Refresh` button without needing a second manual click. If Cursor shows the same background-tab failure later, consider enabling the same page-session option for Cursor in a separate provider-scoped phase.
