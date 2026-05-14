# Phase 430 - Settings Provider Carousel Foundation

Status: completed

## Goal

Build a reusable Settings provider carousel that supports pointer drag, previous/next buttons, keyboard arrow navigation, and accessible status controls.

## Scope

- Add a `ProviderCarousel` component and small interaction helpers.
- Support ArrowLeft/ArrowRight navigation.
- Support pointer drag/swipe with a threshold.
- Add slide dots and previous/next buttons.
- Disable decorative motion under reduced-motion mode.

## Preserved Boundaries

- Do not migrate Settings sections yet.
- Do not add a carousel dependency.
- Do not change provider business controls.

## Acceptance

- Carousel can render arbitrary provider cards.
- Buttons and keyboard navigation keep focus visible and usable.
- Dragging changes active slide only after the threshold.
- RTL surfaces keep understandable labels and control order.

## Planned Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 431 migrates all Settings provider sections to the carousel container.

## Completion Summary

- Added reusable `ProviderCarousel` with previous/next controls, slide dots, keyboard ArrowLeft/ArrowRight navigation, pointer drag/swipe threshold handling, and empty-state rendering.
- Added pure helper coverage for index clamping, cyclic movement, keyboard direction mapping, and LTR/RTL drag semantics.
- Added provider-carousel CSS with multi-card peek sizing, focus-visible states, RTL control-order handling, and reduced-motion transition suppression.
- Preserved all existing Settings provider sections and provider business controls for the Phase 431 migration.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx`
- `npm run typecheck`
- `git diff --check`
