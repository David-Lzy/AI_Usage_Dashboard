# Phase 169 - Request-Bound Manual Screenshot Finalize Command

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Turn the last repo-backed screenshot workflow chain into one operator-facing finalize command so popup import, archive-readiness validation, and request completion no longer have to be run as separate manual repo steps.

## Why This Slice Existed

- `Phase 166` already provided one repo-backed popup import command
- `Phase 167` already generated the popup notes template and checklist for the final popup pass
- `Phase 168` already made request completion default to the request package itself
- the remaining avoidable friction was that the operator still had to remember a separate `import -> check handoff -> complete` sequence after the real popup capture existed

## What Changed

- added one repo-backed finalize helper script:
  - `scripts/finalize-store-screenshot-manual-request.mjs`
- generated manual handoff files now expose:
  - `manualFinalizeCommand`
  - `manualFinalizeWithNotesCommand`
- added one repeatable review:
  - `scripts/phase169-store-screenshot-manual-finalize-review.mjs`
- updated the screenshot runbook plus `Direction 10.3` docs so the supported operator path is now `capture -> edit template -> finalize`

## Result

The repo now proves, through one temp request-bound review fixture, that once the real native-toolbar popup files exist one operator-facing command can:

- import the popup screenshots into the pending request package
- merge the popup note overlay
- validate archive readiness against the request-bound handoff
- complete the archive from that same request package

The supported command is now:

- `npm run store:finalize-manual-screenshot-request -- --request-id <pending-request-id> --source-dir <native-toolbar-popup-capture-dir>`

## Truth Boundary

- this slice does not archive the real refreshed request in the repo
- current screenshot truth still remains `1 pending request / 1 archived set`
- it only removes the last avoidable repo-bookkeeping step after the real popup capture exists
- the remaining real-world work is still the actual native-toolbar popup capture for slots `1` through `3`

## Verification

- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run phase169:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- perform the real manual native-toolbar popup capture pass for slots `1` through `3`
- run the new finalize command with the popup capture directory and optional popup notes overlay
- archive the refreshed request into the second truthful screenshot archive once the real popup files exist
