# Phase 428 - Progress Ring Visual Styles

Status: completed

## Goal

Add polished circular progress styles inspired by the user-provided references while preserving accessible determinate and indeterminate progress semantics.

## Scope

- Extend `ProgressDisplayStyle` to `line`, `circle`, `circle-soft`, and `circle-gauge`.
- Keep `circle` as the existing classic ring.
- Add `UsageProgressRing` for SVG-based soft and gauge rings.
- Make fresh installs default popup progress to `circle-soft`; existing stored `circle` values remain valid.
- Use Material-style tokens, rounded stroke caps, reduced-motion safeguards, and current theme colors.

## Preserved Boundaries

- Do not import user reference images or add third-party visual dependencies.
- Do not reverse numerical progress in RTL; only layout direction changes.
- Do not change provider values or thresholds.

## Acceptance

- Line, classic circle, soft circle, and gauge circle render from the same `UsageProgress` API.
- `aria-valuenow`, `aria-valuetext`, and indeterminate handling remain correct.
- Popup compact width does not overflow with four rings.
- Reduced-motion mode avoids decorative animation.

## Planned Verification

- `npm run test -- src/sidepanel/components/UsageProgress.test.tsx src/popup/PopupProviderProgress.test.tsx`
- `npm run typecheck`
- `git diff --check`

## Completion Summary

- Extended `ProgressDisplayStyle` to `line`, `circle`, `circle-soft`, and `circle-gauge`.
- Kept `circle` as the existing classic conic ring and added `UsageProgressRing` for SVG-based soft and gauge rings.
- Changed fresh popup defaults to `circle-soft` while keeping stored `circle` valid through normalization.
- Added token-driven rounded-cap ring CSS, compact popup sizing for the new ring variants, and reduced-motion-safe transition handling without importing image assets or third-party dependencies.

## Verification

- `npm run test -- src/shared/progress-display.test.ts src/shared/storage.test.ts src/sidepanel/components/UsageProgress.test.tsx src/popup/PopupProviderProgress.test.tsx`
- `npm run typecheck`

## Follow-Up

- Phase 429 exposes the new style choices in Settings and preview copy.
