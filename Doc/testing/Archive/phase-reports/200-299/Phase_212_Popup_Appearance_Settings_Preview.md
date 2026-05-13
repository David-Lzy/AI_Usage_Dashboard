# Phase 212 - Popup Appearance Settings Preview

Date: 2026-04-27

Document class:

- closed evidence

## Goal

Make the new popup appearance preferences visible before the user reopens the Chrome toolbar popup.

## Why This Phase Exists

`Phase 211` added popup size, corner, and shadow settings, but the user would otherwise need to reopen the extension action after every change to understand the result. A small in-Settings preview keeps the control loop local while preserving the rule that Settings remains the full configuration surface.

## What Changed

- Added a popup appearance preview card inside Settings preferences.
- Bound the preview to the saved popup size, corner, and shadow settings through `data-popup-*` attributes.
- Added CSS preview variables for width, surface radius, inner-card radius, and shadow depth.
- Added localized preview copy in `en` and `zh_CN`.
- Added compact-width preview behavior so the preview does not overflow Settings on narrow surfaces.

## Preserved Boundaries

- No provider parser, sync, source-selection, permission, or release-package behavior changed.
- No popup runtime layout behavior changed beyond the already-shipped `Phase 211` preferences.
- No sidebar or full-page appearance setting was added.
- Provider coverage gaps remain unchanged.

## Artifacts

- `scripts/phase212-popup-appearance-preview-review.mjs`
- `tmp/phase212-popup-appearance-preview-review/popup-appearance-preview-review.json`

## Verification

- `npm run typecheck`
- `npm run phase212:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome toolbar-popup visual pass after extension reload and compare the native popup against the Settings preview for `compact`, `balanced`, and `wide` presets.
