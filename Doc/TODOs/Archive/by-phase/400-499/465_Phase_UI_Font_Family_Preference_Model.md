# Phase 465 - UI Font Family Preference Model

Status: completed

## Goal

Add a user-facing UI font preference without making the extension typography inconsistent or hard to localize.

## Scope

- Define a small font-family registry using safe system stacks only.
- Add settings storage, normalization, and migration for the selected UI font.
- Apply the selected font through theme/root CSS variables so all product surfaces inherit consistently.
- Add Settings UI under UI appearance controls.
- Add 14-locale option labels and helper copy.

## Preserved Boundaries

- Do not fetch remote fonts or add font assets in this phase.
- Do not change provider data, quota math, locale registry, or extension permissions.
- Do not override code/diagnostic monospace text unless explicitly covered by the font registry.

## Acceptance

- Users can choose from a small curated list such as system default, interface/system UI, serif-friendly, and mono-friendly UI stacks.
- Invalid stored font values normalize back to the default.
- Popup, sidepanel, full-page Settings, and provider detail inherit the chosen font consistently.
- Arabic, Hindi, Japanese, Korean, and Chinese locales remain readable under each option.

## Planned Verification

- `npm run test -- src/providers/settings.test.ts src/shared/theme.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- Representative visual checks for `en`, `zh-CN`, `ja`, `ar`, and `hi`.
- `npm run docs:check`
- `git diff --check`

## Completed

- Added a safe local UI font-family registry with default, system UI, serif-friendly, and mono-friendly stacks.
- Added `uiFontFamily` to settings storage normalization, sample state, theme settings normalization, root theme sync, and the Settings appearance controls.
- Applied the selected font through Material typography CSS variables so popup, sidepanel, full-page, and provider-detail surfaces inherit the same stack.
- Added 14-locale labels and helper copy for the UI font control.
- Kept remote fonts/assets, provider data, quota math, locale registry behavior, and extension permissions unchanged.

## Verification Notes

- `npm run test -- src/shared/storage.test.ts src/shared/theme.test.ts src/shared/ui-font-family.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`

## Follow-Up

- If users need custom font-family strings, design a later advanced/developer-only option with stronger validation.
