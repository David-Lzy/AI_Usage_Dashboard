# Phase 218 - Page Binding Tab Replacement

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Handle Chrome `tabs.onReplaced` for saved session-page bindings.

## Completed Work

- Added pure reconciliation for a bound tab being replaced by a new tab id.
- Preserved the binding as `bound` and moved it to the replacement tab when the new URL still matches provider session-page route hints.
- Marked the binding stale when Chrome replaces the bound tab with a non-matching or unreadable route.
- Wired `tabs.onReplaced` in the background service worker.
- Refreshed the action badge after replacement-driven binding mutations.

## Preserved Boundaries

- No provider parser, source-selection order, credential storage, host permission, or provider support claim changed.
- No raw cookies, auth headers, or page credentials are stored.
- Store-screenshot locked runtime still avoids lifecycle mutation.
- Existing close and URL-navigation lifecycle behavior remains unchanged.

## Verification

- `npm run test -- --run src/background/page-binding-lifecycle.test.ts src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase218:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome operator pass to verify active-page binding through a real page reload, restore, or prerender path that may cause Chrome to replace a tab id.
