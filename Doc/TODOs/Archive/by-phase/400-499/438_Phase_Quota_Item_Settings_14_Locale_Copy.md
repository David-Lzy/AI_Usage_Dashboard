# Phase 438 - Quota Item Settings 14-Locale Copy

Status: completed

## Goal

Localize the new quota item visibility/order Settings controls so "Quota items" and related helper text no longer appear as English-only UI in localized Settings.

## Scope

- Move quota item Settings labels, helper text, empty states, count chips, surface labels, kind labels, availability labels, shown/hidden labels, and move button labels into the maintained localized-copy path.
- Cover all 14 runtime locales: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`.
- Preserve product names, provider names, route ids, progress item ids, and raw diagnostic/evidence strings.
- Keep surface terminology aligned with existing `popup`, `sidebar`, and `full-page tab` language in Settings.
- Add tests that prevent these controls from silently falling back to English for non-English locales.

## Preserved Boundaries

- Do not change progress item selection, visibility, ordering, defaults, or storage normalization.
- Do not translate provider raw text, diagnostic raw bodies, archive/export payloads, storage ids, data attributes, or provider evidence fields.
- Do not add new runtime locales.
- Do not change Chrome manifest or store listing localization in this phase.

## Acceptance

- The quota item Settings section renders localized headings, helper copy, labels, buttons, and empty states for all 14 runtime locales.
- Arabic copy respects the existing RTL direction rules without reversing numeric progress semantics.
- Existing English UI remains semantically unchanged.
- `npm run i18n:check` continues to pass.

## Planned Verification

- Focused localized-copy tests for quota item Settings copy in representative locales.
- Focused `ProviderProgressItemPreferenceControls` render tests for non-English locale output.
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Broader Settings display-preference copy gaps should remain a separate inventory phase; this slice only localized quota/progress item controls.

## Completion Notes

Completed on 2026-05-14.

Implementation:

- Added `src/shared/settings-progress-items-localized-copy.ts` with 14-locale quota/progress item Settings copy.
- Wired `buildSettingsLocalizedCopy(i18n).progressItems` through `SettingsPreferencesSection` into `ProviderProgressItemPreferenceControls`.
- Replaced hard-coded quota item headings, helper text, empty states, surface labels, count chips, kind/availability labels, shown/hidden labels, checkbox aria labels, row aria labels, move button labels, and all-hidden fallback text.
- Preserved provider names, progress item labels/ids, provider source truth, raw evidence, diagnostics, and storage behavior.

Verification:

- `npm run test -- src/shared/settings-localized-copy.test.ts src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
