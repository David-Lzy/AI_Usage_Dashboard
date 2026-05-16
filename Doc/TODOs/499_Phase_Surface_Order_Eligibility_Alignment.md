# Phase 499 - Surface Order Eligibility Alignment

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status:

- queued

## Goal

Make `popup`, `sidebar`, and `fullPage` provider ordering use the same eligible and visible provider list that the surfaces actually render.

## Scope

- Update provider order view-models so each surface only sorts providers that are display-eligible for that surface and currently visible.
- Keep saved order preferences per surface, but ignore ineligible or hidden ids at render time.
- Append newly eligible or restored providers to the end of each surface order.
- Ensure popup provider cards do not use a broader shipped-provider source list that bypasses the display model.
- Keep default health/warning sorting when no user order exists.

## Preserved Boundaries

- Do not change provider health calculation or diagnostic status semantics.
- Do not change the maximum popup provider count behavior except where it now applies to eligible and visible providers.
- Do not delete stored order ids for temporarily ineligible providers unless the storage normalizer already owns that migration.
- Do not change quota item ordering in this phase.

## Acceptance

- The Settings popup order list matches the popup card order.
- The Settings sidebar order list matches side panel dashboard ordering.
- The Settings full-page order list matches full-page tab ordering.
- Hidden or ineligible providers do not occupy visible ordering positions.
- New and restored providers append predictably after existing visible order.

## Planned Verification

- Focused tests for `ProviderOrderPreferenceControls`.
- Focused tests for popup and sidepanel view-model ordering.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Bind quota item visibility and ordering to the same eligibility model in `Phase 500`.
