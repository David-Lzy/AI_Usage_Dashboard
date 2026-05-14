# Phase 429 - Progress Appearance Settings Preview

Status: completed

## Goal

Expose the expanded progress style choices in Settings and make the popup appearance preview reflect the selected style.

## Scope

- Update Settings progress style options to four choices.
- Add 14-locale labels and helper copy for the new ring styles.
- Update `PopupAppearancePreview` to show line, classic circle, soft circle, and gauge circle accurately.

## Preserved Boundaries

- Do not change stored provider values or source contracts.
- Do not change release versioning or manifest locale ids.
- Do not use browser translation overlays as localization evidence.

## Acceptance

- All 14 runtime locales have the new Settings labels.
- Preview renders the selected style without layout shift.
- Existing `line` and `circle` values continue to load.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/PopupAppearancePreview.test.tsx src/shared/settings-localized-copy.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 430 adds the reusable carousel foundation for Settings provider sections.

## Completion Summary

- Added explicit 14-locale Settings labels for `circle-soft` and `circle-gauge` progress styles.
- Made Settings progress style options use localized labels for all four stored values without falling back to English option defaults.
- Updated `PopupAppearancePreview` to render the selected `UsageProgress` style directly, including line, classic circle, soft SVG ring, and gauge SVG ring.
- Preserved existing `line` and `circle` stored values, provider source truth, raw evidence, release versions, and manifest locale ids.

## Verification

- `npm run i18n:check`
- `npm run test -- src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/PopupAppearancePreview.test.tsx src/shared/settings-localized-copy.test.ts src/shared/progress-display.test.ts`
- `npm run typecheck`
- `git diff --check`
