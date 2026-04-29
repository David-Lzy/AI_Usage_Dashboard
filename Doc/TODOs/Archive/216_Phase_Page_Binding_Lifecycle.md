# Phase 216 - Page Binding Lifecycle

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Keep session-page binding state honest when a bound provider tab closes or navigates away from the supported usage-page route.

## Completed Work

- Added background lifecycle reconciliation for bound provider tabs.
- Wired `tabs.onRemoved` to mark matching bound page bindings stale.
- Wired `tabs.onUpdated` URL changes to mark bindings stale when the new URL no longer matches the provider's session-page route hints.
- Preserved matching route changes such as query or hash updates.
- Synced the action badge after lifecycle-driven binding changes.

## Preserved Boundaries

- No provider parser, source-selection order, credential storage, host permission, or provider support claim changed.
- No raw cookies, auth headers, or page credentials are stored.
- Store-screenshot locked runtime still avoids lifecycle mutation.
- Manual refresh and sync-engine binding reconciliation remain intact.

## Verification

- `npm run test -- --run src/background/page-binding-lifecycle.test.ts src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase216:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use this lifecycle behavior during the next real Codex or Cursor operator pass: bind the usage page, close or navigate the bound tab, and confirm Settings moves the page binding into stale state without waiting for a later manual refresh.
