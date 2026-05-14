# Phase 425 - Progress Item Inventory Model

Status: queued

## Goal

Create a shared progress-item inventory so primary quotas, usage windows, and usage balances can be configured and rendered consistently.

## Scope

- Add `buildProviderProgressItems(provider)`.
- Emit stable ids for:
  - primary quota
  - usage windows
  - usage balances
- Preserve render payload, label, kind, availability, and tone metadata.
- Leave usage facts as non-progress context.

## Preserved Boundaries

- Do not translate or rewrite raw provider evidence.
- Do not change export schemas, archive payloads, or diagnostic raw bodies.
- Do not change visible UI rendering yet.

## Acceptance

- Codex multi-window usage produces stable per-window ids.
- Balance cards produce stable ids without becoming the primary quota.
- Policy-only or unavailable providers do not fabricate progress items.
- Item normalization can drop unknown ids and append new known ids.

## Planned Verification

- `npm run test -- src/shared/provider-progress-items.test.ts src/shared/display-preferences.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 426 adds Settings controls for per-surface progress item visibility and order.
