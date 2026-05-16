# Phase 498 - Dashboard Display Eligibility Model

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

Add a single eligibility model for providers that may appear in dashboard, popup, side panel, full-page tab, provider order, and quota item controls.

## Scope

- Define a shared display eligibility helper or view-model layer.
- A provider is display-eligible when it is:
  - successfully connected with displayable status or quota data
  - shipped as policy-only with useful status text
  - explicitly displayable through a supported fallback state
- A deferred provider is not display-eligible until it has displayable data or a truthful policy-only surface.
- Quick Setup continues to list all configurable providers even when they are not display-eligible.
- Background sync/source configuration remains separate from dashboard display visibility.

## Preserved Boundaries

- Do not break existing background sync, permission prompts, or page-session attachment behavior.
- Do not remove stored provider settings for currently ineligible providers.
- Do not translate or rewrite raw provider evidence.
- Do not treat `provider.enabled` alone as display eligibility.

## Acceptance

- Provider display sections list only display-eligible providers.
- Quick Setup still lists every configurable provider.
- Deferred providers do not appear in provider ordering or quota item ordering.
- Policy-only providers have an explicit, tested display rule.
- Tests cover connected, hidden, policy-only, deferred, and unknown provider states.

## Planned Verification

- Focused tests for provider display eligibility helpers.
- Focused tests for Settings provider display sections.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added a shared provider display eligibility helper that separates displayability from `provider.enabled`.
- Marked shipped live-source providers and shipped policy-only providers as display eligible.
- Kept deferred and planned providers out of dashboard/provider-display surfaces until their product contract graduates.
- Applied the eligibility helper to sidepanel visible providers, popup provider candidates, and Settings Provider Display controls.
- Confirmed Quick Setup still lists all configurable providers independently from display eligibility.

## Verification

- `npm run test -- src/shared/provider-display-eligibility.test.ts src/sidepanel/view-models.test.ts src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Apply the eligibility model to surface ordering in `Phase 499`.
