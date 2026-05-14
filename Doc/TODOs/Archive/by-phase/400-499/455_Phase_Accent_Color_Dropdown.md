# Phase 455 - Accent Color Dropdown

Status: completed on 2026-05-14

## Goal

Replace the separate custom seed card with one discoverable accent-color dropdown that keeps existing named presets while adding recommended colors and a visible custom-color entry.

## Scope

- Add `AccentColorSelect`.
- Keep Default Blue, Meadow, and Sunset as named theme presets.
- Add recommended colors inside the same dropdown.
- Route recommended and custom colors through the existing `themePreset: "custom"` plus `themeCustomSeedHex` storage path.
- Remove the old `ThemeCustomizationCard` and route-local custom seed draft hook.

## Preserved Boundaries

- Do not change theme storage shape, custom palette generation, theme preset token values, package version, or manifest version.
- Do not remove historical custom-seed evidence from archived docs.

## Acceptance

- The Settings accent field is no longer a plain text-only theme preset select.
- The old custom seed form no longer renders.
- Choosing a named preset still uses `onThemePresetChange`; choosing a color still uses the custom seed save path.

## Planned Verification

- `npm run test -- src/sidepanel/components/AccentColorSelect.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- A future packaging phase can include this source boundary in a new release candidate.

## Completion Notes

- The accent dropdown keeps the old storage compatibility boundary while changing the user-facing entry from "Custom Seed" to "Custom color".
- The visible custom entry contains a hex field and a Material-style picker button that invokes the browser color picker.

## Verification

- Covered by the Phase 457 focused test run and typecheck.
