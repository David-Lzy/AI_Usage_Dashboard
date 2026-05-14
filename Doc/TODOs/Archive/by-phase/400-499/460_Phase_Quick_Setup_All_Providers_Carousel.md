# Phase 460 - Quick Setup All Providers Carousel

Status: completed on 2026-05-15

## Goal

Remove the separate "More Provider" disclosure from Quick Setup and show every provider as a carousel card, even when that provider is hidden from the dashboard.

## Scope

- Make Quick Setup provider carousel include all configured providers.
- Keep the "Show on dashboard" checkbox as a card-level setting, not as a filter that removes the card from Quick Setup.
- Remove the Quick Setup more-provider disclosure and any special empty-provider reveal behavior that becomes obsolete.
- Preserve provider enable/disable state and existing Quick Setup actions.

## Preserved Boundaries

- Do not change dashboard visibility semantics outside Quick Setup.
- Do not change provider order preferences, quota item preferences, credentials, permissions, source page actions, or source truth.
- Do not change popup featured-provider filtering.

## Acceptance

- Quick Setup displays all providers in the carousel.
- Hidden providers remain editable through their cards.
- No "More Provider" disclosure remains in Quick Setup.
- Deep links to a hidden provider still focus the correct provider card.

## Planned Verification

- `npm run test -- src/sidepanel/components/QuickSetupSection.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Notes

- Quick Setup now sends every provider into the provider carousel, including providers hidden from the dashboard.
- The separate "More Provider" disclosure/list was removed from Quick Setup.
- Hidden providers remain editable through the card-level "Show on dashboard" switch and enable action.
- Zero-enabled-provider setup still starts on the recommended first provider card and preserves the `data-quick-setup-first-provider-id` deep-link target.
- Dashboard visibility semantics outside Quick Setup, provider order preferences, quota item preferences, credentials, permissions, source page actions, and popup featured-provider filtering are unchanged.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- If all-provider carousel makes Quick Setup too long, split a later phase for provider grouping or search.
