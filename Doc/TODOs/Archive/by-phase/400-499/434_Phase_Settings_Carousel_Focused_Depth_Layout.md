# Phase 434 - Settings Carousel Focused Depth Layout

Status: completed

## Goal

Polish the Settings provider carousel so it presents one primary provider card at a time, with neighboring cards visually behind the active card instead of fully competing beside it.

## Scope

- Rework `ProviderCarousel` layout and CSS so the active provider card is the only fully readable and interactive card.
- Render previous and next provider cards as background depth cues with reduced opacity, blur, scale, or offset treatment.
- Add enough vertical spacing below the active card so slide dots never overlap or visually cut into the card bottom.
- Preserve previous/next buttons, dots, pointer drag/swipe, keyboard ArrowLeft/ArrowRight, RTL support, and reduced-motion behavior.
- Keep all provider card business controls unchanged inside their current section cards.

## Preserved Boundaries

- Do not change provider order storage, visibility preferences, credentials, permissions, source preferences, or sync behavior.
- Do not add a carousel or drag dependency.
- Do not copy external image assets from the user-provided references; use them only as visual direction.
- Do not change non-provider Settings sections.

## Acceptance

- Settings carousel sections show one active card at a time at common desktop, full-page, side-panel, and narrow widths.
- Neighboring cards are visibly behind the active card and are not focusable/clickable while inactive.
- Slide dots have clear separation from the card and no card content is clipped by the dot row.
- RTL layouts keep carousel direction, buttons, focus order, and labels coherent.
- Reduced-motion users do not get sliding or depth animations.

## Planned Verification

- Focused `ProviderCarousel` render tests for active/inactive interactivity, dots, keyboard navigation, drag threshold, and RTL direction.
- Focused Settings page tests for Quick Setup, Visibility, Permissions, Credentials, and Source carousel sections.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the focused-depth layout exposes section-specific card height problems, split those card-content density fixes into a separate phase instead of folding them into this carousel container slice.

## Completion Summary

- Reworked `ProviderCarousel` from a horizontally translated multi-card strip into a stacked depth layout.
- Added slide-position classification so only the active card is fully readable and interactive while adjacent cards render as blurred, offset background layers.
- Marked inactive carousel slides with `inert` and `aria-hidden` so inactive provider card controls are not reachable by pointer or keyboard.
- Increased carousel viewport and dot spacing so card shadows and bottoms are no longer crowded by the indicator row.
- Preserved previous/next buttons, dots, keyboard arrow mapping, pointer drag threshold behavior, RTL direction mapping, and reduced-motion handling.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx`
- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx`
- `npm run typecheck`
- `npm run build`
