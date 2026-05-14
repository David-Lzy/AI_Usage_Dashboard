# Phase 465 - UI Font Family Preference Model

Status: queued

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

## Follow-Up

- If users need custom font-family strings, design a later advanced/developer-only option with stronger validation.
