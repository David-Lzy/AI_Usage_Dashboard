# Phase 283 - Codex Page Session Capture Reload Retry

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 283 Codex page-session capture reload retry plus regression checks

## Scope

Phase 283 added one optional page-session recovery path:

- first capture failure records the original `capture_failed` attempt
- when `reloadOnCaptureFailure` is enabled and `tabs.reload` exists, the client reloads the same tab with `bypassCache: true`
- when `tabs.get` exists, the client waits for the reloaded tab to report `complete`
- the client retries capture once on the same tab before returning `capture_unavailable`

Codex personal page capture enables this option for its live routes.

## Review Coverage

- `npm run test -- src/providers/page-session.test.ts src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-client.test.ts src/providers/codex/adapter.test.ts --run`
  - verifies page-session reload-and-retry behavior after a first script capture failure
  - verifies Codex personal page capture passes the reload recovery option into route captures
  - preserves existing Codex personal parsing/client/adapter behavior
- `npm run phase283:review`
  - verifies `phase283:review` package script wiring
  - verifies page-session reload recovery markers
  - verifies Codex personal capture enables the recovery option
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/providers/page-session.test.ts src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-client.test.ts src/providers/codex/adapter.test.ts --run`
- `npm run phase283:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
