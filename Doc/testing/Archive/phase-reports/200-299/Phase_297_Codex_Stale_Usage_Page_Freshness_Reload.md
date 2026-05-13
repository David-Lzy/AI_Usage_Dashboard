# Phase 297 - Codex Stale Usage Page Freshness Reload

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Codex page-session freshness fix after a real stale-but-readable
  analytics page was observed

## Scope

Phase 297 changes Codex personal session-page capture so an existing matching
Codex tab is reloaded with cache bypass before DOM capture. The change targets
stale data, not unreadable-tab recovery.

## Commands

- `npm run test -- src/providers/page-session.test.ts src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-client.test.ts src/providers/codex/adapter.test.ts --run`

## Expected Runtime Behavior

- Existing Codex usage-page tabs are reloaded before parsing.
- Chrome cache is bypassed for the reload.
- Capture waits for page-load completion, then waits briefly for the hydrated
  analytics UI before reading DOM.
- Newly opened managed tabs are not reloaded a second time before their first
  capture.
- If a capture still fails, the existing reload-after-failure fallback remains
  available.

## Manual Check

Use RDP Chrome after build:

1. Leave `https://chatgpt.com/codex/cloud/settings/analytics` open.
2. Click the extension refresh action.
3. Confirm the Codex card updates after the forced source-page reload completes.
4. If another browser already shows a lower weekly remaining percentage, confirm
   the extension follows the freshly reloaded source page rather than the stale
   pre-refresh DOM.
