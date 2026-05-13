# Phase 230 - Background Session Page Refresh

Date: 2026-04-30

Document class:

- closed evidence

## Goal

Let Codex personal session-page sync recover from a closed source tab during manual or scheduled refresh after the user has already established a page binding.

## Why This Phase Exists

The extension already has a periodic background sync alarm, but the Codex personal source was still gated by whether a matching ChatGPT Codex usage tab happened to be open. That made the scheduled sync look broken for personal users because the page-session parser needs a real logged-in document before it can read usage values.

This phase keeps the existing privacy boundary: the extension still does not store ChatGPT cookies or auth headers. It only uses Chrome tab and scripting APIs to open and read the same logged-in page the user had previously bound.

## What Changed

- Added managed-tab support to the shared page-session client:
  - create an inactive source tab when no matching tab exists
  - wait for the tab to finish loading
  - read the page with the existing DOM capture pipeline
  - keep the tab on success for future scheduled refreshes
  - close the automatically-opened tab when it lands in a logged-out or unmatched state
- Enabled this behavior only for the Codex cloud analytics route:
  - `https://chatgpt.com/codex/cloud/settings/analytics`
- Scoped automatic opening to non-bootstrap Codex refreshes after a saved page-binding fingerprint exists.
- Suppressed repeated scheduled auto-open attempts after a logged-out Codex diagnostic is already visible.

## Verification

- `npm run phase230:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

If Cursor needs the same managed-tab behavior, wire it through the same `openWhenMissing` page-session option with a provider-specific route and login-state cleanup policy.
