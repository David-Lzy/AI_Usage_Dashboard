# Phase 360 - Page Session Tab Lifecycle Helper

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

Move page-session tab lifecycle helpers out of `page-session.ts` into one focused helper.

## Scope

- Add a dedicated page-session tab-lifecycle helper under `src/providers/`.
- Move open-missing-tab, reload-tab, load-wait, reload-option normalization, and close-opened-tab helper logic.
- Keep page-session candidate matching, capture, network observer, extraction, and provider result flow owned by `page-session.ts`.
- Add focused helper tests for the moved lifecycle behavior.

## Preserved Boundaries

- No provider adapter, storage, routing, Settings, popup, release package, or Chrome automation changes.
- No change to page-session matching, capture, reload defaults, open-tab defaults, cleanup swallowing, or load-poll semantics.
- No raw cookie/session-token handling.

## Acceptance

- `page-session.ts` uses the helper for tab lifecycle operations.
- Existing page-session tests continue to pass.
- New focused lifecycle tests cover reload-option normalization, default reload bypass-cache behavior, open-missing-tab load merge behavior, and close cleanup swallowing.

## Planned Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-tab-lifecycle.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `page-session-tab-lifecycle.ts` for page-session open, reload, wait, reload-option normalization, and close cleanup helpers.
- Kept page-session candidate matching, capture, network observer, extraction, and provider result flow owned by `page-session.ts`.
- Added focused lifecycle tests for reload-option normalization, reload defaults, open-tab load merging, and cleanup failure swallowing.

## Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-tab-lifecycle.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future tab lifecycle behavior changes should use a behavior phase if they alter reload defaults, open-tab active defaults, load-wait polling, or close cleanup swallowing.
