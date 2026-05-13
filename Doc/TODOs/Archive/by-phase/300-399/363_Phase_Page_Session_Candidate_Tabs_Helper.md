# Phase 363 - Page Session Candidate Tabs Helper

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

Move page-session candidate tab selection out of `page-session.ts` into one focused helper.

## Scope

- Add a dedicated page-session candidate-tabs helper under `src/providers/`.
- Move bound-tab lookup, auto-tab query filtering, binding-missing reporting, and priority sorting.
- Keep page-session capture orchestration, tab lifecycle, script capture, network observer, and provider result flow owned by `page-session.ts`.
- Add focused helper tests for bound and auto candidate behavior.

## Preserved Boundaries

- No provider adapter, storage, routing, Settings, popup, release package, or Chrome automation changes.
- No change to bound-tab precedence, bound-tab missing fallback, duplicate tab filtering, or auto candidate priority sorting.
- No raw cookie/session-token handling.

## Acceptance

- `page-session.ts` uses the helper for candidate tab selection.
- Existing page-session tests continue to pass.
- New focused tests cover bound tab precedence, missing bound-tab reporting, query-only bound fallback, duplicate filtering, and priority-sorted auto candidates.

## Planned Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-candidate-tabs.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `src/providers/page-session-candidate-tabs.ts` for bound-tab lookup, auto-tab query filtering, duplicate filtering, binding-missing reporting, and priority sorting.
- Kept page-session capture orchestration, tab lifecycle, script capture, network observer, and provider result flow owned by `page-session.ts`.
- Added focused candidate-tab tests for bound precedence, missing bound-tab reporting, query-only bound fallback, duplicate filtering, and priority-sorted auto candidates.

## Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-candidate-tabs.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Any change to bound-tab precedence, missing fallback, duplicate filtering, or auto sorting should use a behavior phase instead of this maintenance helper boundary.
