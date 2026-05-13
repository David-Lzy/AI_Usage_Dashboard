# Phase 230 - Background Session Page Refresh

Date: 2026-04-30

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-30

## Goal

Make Codex personal session-page sync useful during background alarms after the user has already attached or successfully captured a Codex usage page.

## Completed Work

- Added an optional `openWhenMissing` flow to the shared page-session capture client.
- The managed-tab flow opens an inactive source page, waits for load, captures through the existing DOM scripting path, and keeps the tab only when capture succeeds.
- Codex personal capture now uses the managed-tab flow only for `chatgpt.com/codex/cloud/settings/analytics`.
- Codex adapter logic enables managed opening only outside bootstrap and only after saved page-binding metadata exists.
- Scheduled alarm refreshes stop auto-opening after a visible `page_session.logged_out` diagnostic, so the UI prompts for login instead of repeatedly creating source tabs.
- Added targeted tests for managed-tab capture, logged-out cleanup, Codex route scoping, and alarm gating.

## Preserved Boundaries

- No ChatGPT cookies, auth headers, localStorage, or session tokens are exported or persisted.
- First-time setup still requires the user to open or bind a logged-in Codex page.
- The official Codex analytics API path remains unchanged.
- Cursor, JetBrains, Claude, Gemini, popup appearance, Settings controls, and parser semantics are unchanged.
- Bootstrap sync does not auto-open provider pages on browser startup.

## Verification

- `npm run phase230:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Consider a visible Settings toggle only if users want to opt out of managed source tabs after this behavior is tested in a real Chrome session.
