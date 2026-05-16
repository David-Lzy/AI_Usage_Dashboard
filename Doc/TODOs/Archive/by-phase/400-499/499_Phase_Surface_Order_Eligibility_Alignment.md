# Phase 499 - Surface Order Eligibility Alignment

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status:

- completed

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

## Completion Summary

- Aligned popup provider candidates with the same visible + display-eligible contract already used by dashboard surfaces.
- Filtered Settings Provider order controls to only include providers that are both display-eligible and enabled for dashboard display.
- Preserved quota item controls for eligible providers until Phase 500 owns quota item eligibility and expansion behavior.
- Kept saved per-surface provider order preferences intact; hidden or ineligible ids are ignored at render time by the resolved visible list.
- Updated focused popup and Settings tests so the visible order model matches the rendered surfaces.

## Verification

- `npm run test -- src/popup/view-models.test.ts src/sidepanel/view-models.test.ts src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Bind quota item visibility and ordering to the same eligibility model in `Phase 500`.
