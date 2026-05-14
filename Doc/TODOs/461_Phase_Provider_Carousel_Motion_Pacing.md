# Phase 461 - Provider Carousel Motion Pacing

Status: active

## Goal

Make provider carousel transitions feel stable and consistent across viewport widths.

## Scope

- Audit `ProviderCarousel` transition timing and transform distance.
- Ensure slide duration does not become visually faster on wide pages.
- Slightly slow the card transition from the current perceived speed.
- Preserve reduced-motion behavior and keyboard/pointer interaction semantics.

## Preserved Boundaries

- Do not change carousel card business controls or provider data.
- Do not reintroduce a carousel dependency.
- Do not change carousel accessibility roles, focus-visible states, or `inert` inactive-card semantics unless needed to fix a bug.

## Acceptance

- Wide full-page Settings and narrow sidepanel Settings use a consistent-feeling carousel duration.
- Quick Setup provider changes show a visible but restrained transition.
- Reduced-motion mode still disables movement.
- Drag threshold and ArrowLeft/ArrowRight behavior remain covered.

## Planned Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/components/QuickSetupSection.test.tsx --run`
- `npm run typecheck`
- Playwright or RDP visual check for sidepanel and full-page Settings carousel.
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If duration alone cannot stabilize the wide-page feel, split a follow-up for transform distance or inactive-card depth tokens.
