# Phase 361 - Page Session Script Capture Helper

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move page-session script execution and page snapshot helpers out of `page-session.ts` into one focused helper.

## Scope

- Add a dedicated page-session script-capture helper under `src/providers/`.
- Move script-result execution, isolated page snapshot reading, main-world window-value reading, and local string normalization helpers.
- Keep network observer bridge installation/reading and provider result flow owned by `page-session.ts`.
- Add focused helper tests for the moved script-capture behavior.

## Preserved Boundaries

- No provider adapter, storage, routing, Settings, popup, release package, or Chrome automation changes.
- No change to page-session DOM snapshot shape, main-world execution, truncation semantics, invalid snapshot handling, or network observer behavior.
- No raw cookie/session-token handling.

## Acceptance

- `page-session.ts` uses the helper for script capture and shared script-result execution.
- Existing page-session tests continue to pass.
- New focused tests cover missing script results, invalid isolated snapshots, script selector capture normalization, empty window-key handling, and serialized window-value truncation.

## Planned Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-script-capture.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `page-session-script-capture.ts` for script-result execution, isolated DOM snapshots, main-world window-value reads, and selector/key normalization.
- Kept network observer bridge installation/reading and provider result flow owned by `page-session.ts`.
- Added focused script-capture tests for missing script results, invalid isolated snapshots, script map normalization, empty window-key handling, and serialized window-value truncation.

## Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-script-capture.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future script-capture behavior changes should use a behavior phase if they alter DOM snapshot shape, main-world execution, boot-data serialization, truncation, or network observer capture.
