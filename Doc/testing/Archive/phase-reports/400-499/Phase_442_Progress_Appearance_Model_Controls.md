# Phase 442 - Progress Appearance Model Controls QA

Date: 2026-05-14

## Summary

Phase 442 added the model and Settings controls for global progress thickness and remaining-percent color bands. The change is preference-model and Settings-UI only: progress renderers still use their existing visual behavior until Phase 443 consumes the new settings.

## Checks

- Storage normalization now accepts bounded integer progress thickness and falls back invalid, missing, or out-of-range values to the default.
- Storage normalization now accepts only valid color-band records with `#RRGGBB` colors, integer ranges, unique ids, no gaps, no overlaps, and full `0-100` coverage.
- Settings now renders localized controls for progress thickness and color-band add/remove/reorder/edit workflows.
- `warningThresholdPercent` remains a separate preference and still controls provider warnings/diagnostics independently from color-band display preferences.
- Structured Settings progress-appearance copy now covers all 14 runtime locales.

## Preserved Boundaries

- No provider adapter output changed.
- No provider tone, diagnostic, action-badge, raw evidence, export schema, or source-truth label changed.
- No progress renderer consumes the new thickness or color-band settings yet; that is the Phase 443 boundary.

## Verification

- `npm run test -- src/shared/progress-appearance.test.ts src/shared/storage.test.ts src/shared/settings-localized-copy.test.ts src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Notes

The production build still emits the known sidepanel chunk-size warning. This phase did not introduce a new packaging boundary and does not change the accepted chunk-size audit decision.
