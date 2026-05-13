# Phase 362 - Page Session Network Observer Helper

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

Move page-session network observer bridge logic out of `page-session.ts` into one focused helper.

## Scope

- Add a dedicated page-session network-observer helper under `src/providers/`.
- Move network-observer entry/state types, bridge installation, and bridge snapshot reading.
- Keep page-session extraction orchestration, candidate matching, tab lifecycle, and provider result flow owned by `page-session.ts`.
- Add focused helper tests for bridge reading and installation argument defaults.

## Preserved Boundaries

- No provider adapter, storage, routing, Settings, popup, release package, or Chrome automation changes.
- No change to network observer bridge id, custom event name, fetch/XHR patching semantics, max-entry defaults, max-body defaults, or malformed snapshot fallback.
- No raw cookie/session-token handling.

## Acceptance

- `page-session.ts` uses the helper for network observer install/read behavior.
- Existing page-session tests continue to pass.
- New focused tests cover null/invalid bridge snapshots, malformed snapshot normalization, valid snapshot parsing, and default install arguments.

## Planned Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-network-observer.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `page-session-network-observer.ts` for network observer entry/state types, bridge installation, and bridge snapshot reading.
- Kept page-session extraction orchestration, candidate matching, tab lifecycle, and provider result flow owned by `page-session.ts`.
- Added focused network observer tests for missing/invalid snapshots, malformed snapshot normalization, valid snapshot parsing, and default install arguments.

## Verification

- `npm run typecheck`
- `npm test -- src/providers/page-session-network-observer.test.ts src/providers/page-session.test.ts`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future network observer behavior changes should use a behavior phase if they alter the bridge id, custom event name, fetch/XHR patching, max-entry defaults, max-body defaults, or malformed snapshot fallback.
