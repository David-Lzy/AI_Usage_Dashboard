# Phase 147 - Store Screenshot Seed Lock And Request-Bound RDP Capture

Date: 2026-04-24

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the completed `Phase 147` closeout and should not be silently edited after archival except to correct factual mistakes

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Turn the store screenshot workflow from "real RDP runtime capture is possible" into "request-bound storyboard states can be applied, held stable, and captured from the real unpacked extension runtime."

## What Changed

- added one request-bound screenshot seed model for the current store storyboard:
  - [src/sidepanel/store-screenshot-seed.ts](../../src/sidepanel/store-screenshot-seed.ts)
- added one dedicated sidepanel seed route:
  - [src/sidepanel/routes/StoreScreenshotSeedPage.tsx](../../src/sidepanel/routes/StoreScreenshotSeedPage.tsx)
- wired the sidepanel special-route shell so the seed route no longer races against normal `app:init` hydration:
  - [src/sidepanel/App.tsx](../../src/sidepanel/App.tsx)
- added one shared runtime lock for screenshot capture sessions:
  - [src/shared/store-screenshot-runtime-lock.ts](../../src/shared/store-screenshot-runtime-lock.ts)
- made background bootstrap, alarm sync, permission sync, credential sync, and message-bus reads respect that runtime lock:
  - [src/background/service-worker.ts](../../src/background/service-worker.ts)
  - [src/background/message-bus.ts](../../src/background/message-bus.ts)
  - [src/background/provider-permissions.ts](../../src/background/provider-permissions.ts)
  - [src/background/provider-credentials.ts](../../src/background/provider-credentials.ts)
- added one explicit app-state clear helper so screenshot unlock can restore the pre-seed baseline truthfully:
  - [src/shared/storage.ts](../../src/shared/storage.ts)
- added one RDP seed helper plus one request-bound capture runner:
  - [scripts/apply-rdp-store-screenshot-seed.mjs](../../scripts/apply-rdp-store-screenshot-seed.mjs)
  - [scripts/capture-store-screenshot-request-from-rdp.mjs](../../scripts/capture-store-screenshot-request-from-rdp.mjs)
  - [scripts/lib/store-screenshot-rdp-capture.mjs](../../scripts/lib/store-screenshot-rdp-capture.mjs)
- extended the existing RDP extension helper so it can open route-bound runtime windows even when the main Chrome process is not trivially discoverable from the shell:
  - [scripts/lib/rdp-extension-runtime-capture.mjs](../../scripts/lib/rdp-extension-runtime-capture.mjs)
- added one repeatable review:
  - [scripts/phase147-store-screenshot-seed-and-capture-review.mjs](../../scripts/phase147-store-screenshot-seed-and-capture-review.mjs)

## Why This Matters

Before this slice, the repo could:

- open real popup and sidepanel runtime windows from `RDP Chrome`
- create pending screenshot requests
- archive future screenshot sets
- preserve truthful capture notes

but it could not yet hold one stable storyboard state inside the real unpacked extension runtime without normal background sync drifting that state back toward the default app baseline.

This slice closes that gap.

## Verification

- `npm run docs:check`
- `npm run phase147:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

`Direction 10` now has one truthful request-bound seed plus capture-runner workflow for the first real screenshot set. The repo still truthfully remains at `1 pending screenshot request / 0 archived screenshot sets`; this phase did not claim that the first real RDP Chrome screenshot archive already exists.
