# Phase 168 - Request-Bound Store Screenshot Completion Defaults

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Remove the last avoidable path handoff from the refreshed screenshot workflow by making request completion default to the request package `captures/` directory once popup files have been imported.

## Why This Slice Existed

- `Phase 166` already provided a repo-backed popup import command
- `Phase 167` already generated the popup notes template and checklist needed for the real popup pass
- the remaining non-real-world friction was that archive completion still asked for one explicit `--captures-dir` argument even after the pending request package already owned the final screenshot set

## What Changed

- [complete-store-screenshot-capture-request.mjs](../../scripts/complete-store-screenshot-capture-request.mjs) now exports one callable completion helper and defaults `capturesDir` to the request package `captures/` folder when that flag is omitted
- the generated completion command inside the manual handoff now uses only `--request-id`
- added one repeatable review:
  - [phase168-store-screenshot-request-bound-completion-review.mjs](../../scripts/phase168-store-screenshot-request-bound-completion-review.mjs)
- updated the runbook and `Direction 10.3` docs so the final archive path is now `capture -> import -> complete request`, not `capture -> import -> manually restate path -> complete request`

## Result

The repo now proves, through one temp request-bound review fixture, that a fully imported request can be archived with:

- `npm run store:complete-screenshot-capture-request -- --request-id <request-id>`

That review fixture imports three popup screenshots into a temp request, reuses the two already-staged full-page screenshots, and then archives directly from the temp request package without passing a separate `--captures-dir`.

## Truth Boundary

- this slice does not archive the real refreshed request in the repo
- current screenshot truth still remains `1 pending request / 1 archived set`
- it only proves that once the real popup files are imported, the repo-backed completion path is already in place

## Verification

- `npm run phase168:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- perform the real manual native-toolbar popup capture pass for slots `1` through `3`
- import those real popup screenshots plus popup notes into the pending request package
- archive the refreshed request through the now-default request-bound completion command
