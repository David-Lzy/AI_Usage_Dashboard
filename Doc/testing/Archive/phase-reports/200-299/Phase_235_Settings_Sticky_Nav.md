# Phase 235 - Settings Sticky Nav

Date: 2026-05-03

Document class:

- closed evidence

## Goal

Make long Settings pages easier to navigate by keeping the section chips reachable during scroll and adding a quick return-to-top action.

## Why This Phase Exists

Settings now contains enough preferences, provider visibility, credentials, source controls, and permissions that the original one-time section-jump row becomes inconvenient after scrolling deep into the page. The requested behavior is a Material-style section chip row that remains available while the user scrolls without creating a second competing sticky bar.

## What Changed

- Moved the section chips into the existing sticky top bar as a second row, creating one merged sticky top bar instead of two stacked surfaces.
- Added current-section tracking with `IntersectionObserver`.
- Added an active Material chip state for the section currently under review.
- Added a lower-right extended Material floating action button that returns Settings to the top and remains visually obvious in the full-page tab.
- Added localized accessible labels and short visible labels for the back-to-top action.
- Added focused static rendering coverage for the merged top-bar navigation and FAB markers.

## Verification

- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run one real Chrome visual pass at side-panel and full-page widths to tune the merged sticky top bar if the browser toolbar or RDP viewport changes the available height.
