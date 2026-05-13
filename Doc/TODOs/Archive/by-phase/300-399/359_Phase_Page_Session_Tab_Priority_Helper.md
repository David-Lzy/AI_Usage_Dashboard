# Phase 359 - Page Session Tab Priority Helper

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

Move page-session tab priority scoring and sorting out of `page-session.ts` into one focused helper.

## Scope

- Add a dedicated page-session tab-priority helper under `src/providers/`.
- Keep page-session capture, reload, open-tab, network observer, and extraction behavior owned by `page-session.ts`.
- Preserve existing priority semantics: exact matched URL, hash-stripped URL, prefix match, matched title, active-tab score boost, plus `lastAccessed`.
- Add a focused helper test so tab priority behavior is covered outside the large page-session client test.

## Preserved Boundaries

- No provider adapter, storage, routing, Settings, popup, release package, or Chrome automation changes.
- No change to page-session matching, capture, reload, binding, or tab-opening semantics.
- No raw cookie/session-token handling.

## Acceptance

- `page-session.ts` uses the helper for candidate tab sorting.
- Existing page-session tests continue to pass.
- New focused tab-priority tests cover exact URL, hash-only URL, prefix URL, active-tab boost, recency, and matched-title precedence.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `page-session-tab-priority.ts` for page-session tab priority scoring and sorting.
- Kept page-session capture, reload, open-tab, network observer, and extraction behavior owned by `page-session.ts`.
- Added focused tab-priority tests covering exact matched URL, hash-only URL, prefix match, matched title, active-tab score boost, and `lastAccessed`.

## Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-tab-priority.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future tab-selection behavior changes should use a behavior phase if they alter exact URL, hash-stripped URL, prefix URL, matched-title, active-tab, or recency weighting.
