# Phase 442 - Progress Appearance Model Controls

Status: queued

## Goal

Add user-facing progress appearance preferences for global progress thickness and progress color bands while keeping the existing warning threshold preference separate.

## Scope

- Extend `AppSettings` with one global progress thickness preference.
- Use one numeric thickness value in pixels with a safe bounded range and a default matching the current visual weight as closely as possible.
- Extend `AppSettings` with progress color bands based on remaining percentage.
- Default color bands:
  - `0-20` remaining: red
  - `21-49` remaining: brown
  - `50-100` remaining: green
- Allow users to add, remove, edit, and reorder color bands in Settings.
- Validate `#RRGGBB` colors, integer percent ranges, inverted ranges, duplicate ranges, and overlapping ranges during storage normalization.
- Keep `warningThresholdPercent` in storage and Settings; it continues to drive provider warning and diagnostic behavior, not progress-bar color selection.
- Add localized Settings copy for the new thickness and color-band controls across the 14 runtime locales.

## Preserved Boundaries

- Do not let color bands change provider `tone`, warning diagnostics, action-badge attention counts, or adapter warning logic.
- Do not remove the existing warning threshold setting.
- Do not change progress rendering in this phase except for preview/control wiring needed to prove the setting model.
- Do not change provider snapshots, raw evidence, export schemas, or source-truth labels.

## Acceptance

- Stored progress thickness normalizes unknown, too-small, too-large, non-numeric, and legacy-missing values to the default.
- Stored color bands normalize invalid colors, invalid ranges, overlaps, and unknown fields to a safe default.
- New installs receive the default thickness and default three color bands.
- Settings renders controls for thickness and color bands without using hard-coded English outside localization helpers.
- `warningThresholdPercent` still appears as an independent preference and keeps its existing validation behavior.

## Planned Verification

- Storage normalization tests.
- Settings preference option/control tests.
- Runtime catalog and Settings localized-copy tests for all 14 locales.
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 443` to apply the model to all progress renderers.
