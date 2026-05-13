# Phase 233 - Codex Hydration Retry

Date: 2026-05-03

Document class:

- closed evidence

## Goal

Stop the first refresh after opening the Codex analytics page from briefly showing a parser failure while the ChatGPT frontend is still hydrating usage-window content.

## Why This Phase Exists

Phase 232 made Codex personal sync able to open the analytics page automatically in an inactive managed tab. In real Chrome, the tab can report `complete` before the Codex usage widgets have rendered their remaining-percentage windows. The first capture can therefore match the Codex route but parse only the page shell, while a second manual refresh succeeds after the same page finishes hydrating.

## What Changed

- Added a short Codex live-client retry path for `route_drift` results when a Codex route was already matched.
- Retries use the same page-session client and binding inputs, so the already-open managed tab can finish rendering instead of requiring a second user refresh.
- Kept non-matched, logged-out, capture-unavailable, and fixture paths unchanged.
- Added a focused client test that first captures a loading shell and then captures rendered usage windows.

## Verification

- `npm run phase233:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use RDP Chrome to confirm the toolbar popup stays in its refresh state until the first managed Codex page capture either parses usage windows or exhausts the short hydration retry window.
