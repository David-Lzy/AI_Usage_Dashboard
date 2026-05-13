# Phase 297 - Codex Stale Usage Page Freshness Reload

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

Make Codex personal usage-page sync refresh stale but readable ChatGPT Codex
analytics tabs before parsing them.

## Trigger

The user observed a real Codex usage discrepancy: another Chrome session showed
`29%` weekly remaining, while the extension refresh path and the already-open
Codex analytics page still showed `31%`. This means the page DOM can be readable
but stale; the old Phase 283 fallback only reloaded after capture failure.

## Completed Work

- Added a generic page-session `reloadBeforeCapture` option.
- Added `postLoadDelayMs` to page-session reload options so a provider can wait
  briefly after Chrome reports page load completion.
- Enabled read-before-capture reload for Codex personal page-session routes with
  `bypassCache: true`.
- Kept the existing reload-after-capture-failure path as a fallback.
- Filtered Codex page bindings by route so a bound cloud analytics tab is not
  reused across unrelated Codex usage routes and reloaded multiple times.
- Added focused tests for pre-capture reload ordering and Codex route-specific
  binding reuse.

## Preserved Boundaries

- No Codex parser semantics changed.
- No provider source preference, sync cadence, host-access requirement, cookie
  handling, or token handling changed.
- The Codex personal source still reads a real logged-in ChatGPT page document;
  it does not call an internal ChatGPT quota API.

## Verification

- `npm run test -- src/providers/page-session.test.ts src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-client.test.ts src/providers/codex/adapter.test.ts --run`

## Follow-Up

Run a real RDP Chrome smoke pass after rebuild: open or keep the Codex analytics
tab, click extension refresh, and confirm the extension value follows the page
after the forced reload completes.
