# Phase 500 - Quota Item Eligibility And Popup Order QA

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

Bind quota item visibility controls to display-eligible providers and verify popup ordering, max-count, and circular row preferences still match the user model.

## Scope

- Show quota item controls only for providers that are currently display-eligible and visible.
- Keep provider quota groups collapsed by default so users can see all providers before expanding individual quota details.
- Providers with no renderable quota items should show a compact summary rather than expanded empty controls.
- Hidden providers' quota item settings must not affect popup, sidebar, or full-page rendering.
- Confirm popup max visible provider count, circular progress per-row count, and per-provider progress item order all compose correctly.

## Preserved Boundaries

- Do not turn usage facts, provider raw text, or diagnostics into progress bars.
- Do not alter provider source contracts or raw export schemas.
- Do not change progress style, color, or thickness settings unless needed for test fixtures.
- Do not remove saved quota item preferences for temporarily ineligible providers.

## Acceptance

- Quota item controls appear only under eligible displayed providers.
- Collapsed provider summaries show whether configurable quota items exist.
- Hidden or ineligible provider quota preferences do not influence rendered surfaces.
- Popup provider order matches Settings order after max-count and visibility filters are applied.
- Circular row count and progress item order keep working for eligible providers.

## Planned Verification

- Focused tests for `ProviderProgressItemPreferenceControls`.
- Focused tests for popup view-model provider and progress item ordering.
- Focused tests for sidepanel and full-page provider detail progress rendering.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Bound Settings quota item controls to the same visible + display-eligible provider list used by Provider order controls.
- Kept saved quota item preferences for hidden or temporarily ineligible providers intact while excluding those providers from current quota configuration UI.
- Preserved existing collapsed-by-default provider summaries and compact no-quota summaries.
- Confirmed popup visibility/order behavior and provider-card/provider-detail progress rendering still honor existing preferences for eligible providers.
- Added focused coverage so hidden providers no longer appear in either Provider order or quota item controls.

## Verification

- `npm run test -- src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/popup/view-models.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Close the provider setup/display model with documentation, localization, and visual QA in `Phase 501`.
