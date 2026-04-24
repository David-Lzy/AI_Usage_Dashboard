# Phase 160 - RDP Runtime Surface Refresh And Window Cleanup

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 160` closeout for the `Direction 10.2` RDP runtime QA refresh slice

## Goal

Refresh truthful RDP Chrome runtime evidence for popup, sidepanel, and standard full-page surfaces after the shipped expand, quick-theme, and motion work, while making the capture workflow close the extension windows it opens so repeated review passes do not keep accumulating stale windows.

## Implemented

- extended the shared RDP runtime helper with explicit runtime-window close support and optional close-after-capture behavior:
  - [rdp-extension-runtime-capture.mjs](../../scripts/lib/rdp-extension-runtime-capture.mjs)
- extended the CLI smoke-capture helper to support current full-page dashboard, settings, and provider-detail routes while closing each captured window after save:
  - [capture-rdp-extension-window.mjs](../../scripts/capture-rdp-extension-window.mjs)
- added one explicit cleanup command for stale AI Usage Dashboard popup and extension windows left in the RDP Chrome session:
  - [cleanup-rdp-extension-runtime-windows.mjs](../../scripts/cleanup-rdp-extension-runtime-windows.mjs)
  - [package.json](../../package.json)
- updated the request-bound screenshot runner so seed windows and captured runtime windows do not accumulate between screenshots:
  - [capture-store-screenshot-request-from-rdp.mjs](../../scripts/capture-store-screenshot-request-from-rdp.mjs)
- added one repeatable real RDP runtime refresh review that captures current popup, sidepanel-settings, full-page-dashboard, full-page-settings, and full-page-provider-detail-codex evidence:
  - [phase160-rdp-runtime-surface-refresh-review.mjs](../../scripts/phase160-rdp-runtime-surface-refresh-review.mjs)
- refreshed the maintained runbook so the supported smoke-capture routes and cleanup expectations match the current helper behavior:
  - [Store_Screenshot_Capture_Runbook.md](./Store_Screenshot_Capture_Runbook.md)

## Verification

- `npm run phase160:review`
- `npm run typecheck`
- `npm run test`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Result

RDP Chrome runtime QA now has one current extension-mode refresh set for popup, sidepanel settings, and standard full-page dashboard/settings/provider-detail surfaces, and the helper workflow now closes the windows it opens instead of relying on manual cleanup alone. The new captures also make the current popup truth boundary more explicit: the popup smoke helper opens the popup route in its own extension app window, so that image remains QA-only evidence rather than a pixel-identical replacement for the true toolbar action bubble. The next execution line now moves to `Direction 10.3` store asset-pack refresh on top of this newer runtime evidence.
