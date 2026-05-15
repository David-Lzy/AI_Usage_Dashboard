# Phase 480 - Provider Quota Items Collapsed Default

Date: 2026-05-15

Status: completed

## Goal

Make the Provider display settings scan-friendly by showing every provider first, while keeping each provider's configurable quota item details hidden until the user expands that provider.

## Scope

- Convert each quota-item provider row into a default-collapsed disclosure.
- Keep provider names and item-count summaries visible for all providers, including providers with no configurable progress items.
- Preserve the existing per-surface popup/sidebar/full-page quota item controls inside the expanded provider detail.
- Keep the existing drag, keyboard, show/hide, and move-up/down behavior for quota item rows.

## Preserved Boundaries

- Provider order settings, quota item preferences, storage normalization, provider snapshots, provider enabled state, and release packaging are unchanged.
- No new localized runtime strings are introduced in this phase.
- No provider source truth, progress item inventory, or popup/sidebar/full-page rendering behavior changes.

## Acceptance

- `Provider display settings` still shows the full provider list in the quota-item area.
- Each provider's quota item detail starts collapsed by default.
- Expanding a provider reveals the existing popup, sidebar, and full-page quota item controls.
- Providers without configurable quota items still appear as collapsed provider summaries.
- Focused render tests cover both configurable and non-configurable providers.

## Planned Verification

- `npm run test -- src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsProviderDisplaySection.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsProviderDisplaySection.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- Run a visual Settings pass before the next package if more Provider display layout changes are added to the same source boundary.
