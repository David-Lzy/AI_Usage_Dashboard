# Phase 148 - RDP Capture Timeout Hardening And Probe Cleanup

Date: 2026-04-24

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the completed `Phase 148` closeout and should not be silently edited after archival except to correct factual mistakes

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Turn the current RDP screenshot workflow from "can work when X11 helpers behave" into "fails fast and can be cleaned up safely when X11 helpers hang."

## What Changed

- added explicit X11 command timeouts to the shared RDP capture helper:
  - [rdp-extension-runtime-capture.mjs](../../scripts/lib/rdp-extension-runtime-capture.mjs)
- added one stale-probe cleanup command:
  - [cleanup-rdp-extension-capture-probes.mjs](../../scripts/cleanup-rdp-extension-capture-probes.mjs)
- documented that cleanup command in the store screenshot runbook:
  - [Store_Screenshot_Capture_Runbook.md](./Store_Screenshot_Capture_Runbook.md)
- added one repeatable timeout-and-cleanup review:
  - [phase148-rdp-capture-timeout-and-cleanup-review.mjs](../../scripts/phase148-rdp-capture-timeout-and-cleanup-review.mjs)

## Why This Matters

The current repo can already:

- define truthful screenshot storyboards
- create request packages
- apply request-bound seeded runtime states
- preserve request-bound truth notes

but a failed `xwininfo` or `import` call could still leave the shell hanging and accumulate stale helper processes.

This slice makes that failure mode explicit and recoverable.

## Verification

- `npm run docs:check`
- `npm run phase148:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

`Direction 10` now has one clearer fast-fail and cleanup contract for failed RDP capture attempts. The repo still truthfully remains at `1 pending screenshot request / 0 archived screenshot sets`; this phase did not claim that the first real store screenshot archive had been captured.
