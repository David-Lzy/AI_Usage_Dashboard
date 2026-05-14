# Phase 458 - Color Band Control Copy And Row Layout

Status: completed on 2026-05-15

## Goal

Polish the remaining-color band controls so each band reads as one compact horizontal rule instead of a tall card with repeated color text.

## Scope

- Change `ColorChoiceDropdown` selection display so recommended colors show the localized color name and the hex only once.
- For custom colors not in the choice list, show the normalized `#RRGGBB` as the primary label.
- Rework the remaining-color band row in Settings so `From`, first number field, `To`, second number field, and `Color` sit on one aligned row when width allows.
- Let the number fields size to their short numeric content while the color selector remains compact and aligned.
- Preserve responsive stacking for narrow sidepanel widths.

## Preserved Boundaries

- Do not change `progressColorBands` storage shape, validation semantics, or color-band fallback behavior.
- Do not change provider warning/diagnostic thresholds or quota math.
- Do not change package or manifest versions.

## Acceptance

- Recommended colors do not display duplicated hex text in the closed selector.
- A recommended red/orange/green selection displays the localized color name, not only the code.
- A custom color that is not in the preset list displays the normalized hex once.
- Remaining-color rows align horizontally in full-page Settings and stack cleanly in narrow sidepanel Settings.
- `zh-CN`, `de`, and `ar` labels do not overlap controls.

## Planned Verification

- `npm run test -- src/sidepanel/components/ColorChoiceDropdown.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion Notes

- Color dropdown closed-state text now shows one visible value: recommended colors use their localized names, while unlisted custom colors use normalized `#RRGGBB`.
- Remaining-color-band rows now use compact inline field groups for `From`, `To`, and `Color`, preserving a narrow fallback stack below 420px.
- Progress color-band storage, validation, warning thresholds, and provider quota semantics are unchanged.

## Verification

- `npm run test -- src/sidepanel/components/ColorChoiceDropdown.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- If the compact row still feels dense after visual QA, split a follow-up phase for spacing tokens only.
