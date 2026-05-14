# Phase 463 - Popup Circular Progress Row Count

Status: queued

## Goal

Let users choose how many circular quota items can appear per row in the popup, with a default of two.

## Scope

- Add a popup circular-progress row-count preference to settings storage.
- Scope the preference to circular styles only: `circle`, `circle-soft`, and `circle-gauge`.
- Add Settings UI under UI appearance controls.
- Make popup progress rendering consume the preference for circular layouts while line progress remains unchanged.
- Add 14-locale labels and helper copy.

## Preserved Boundaries

- Do not change quota item visibility/order preferences.
- Do not change provider cards, quota values, warning/diagnostic semantics, or raw evidence.
- Do not change sidebar or full-page progress layout unless explicitly required for shared component correctness.

## Acceptance

- Fresh/default settings render two circular items per popup row.
- Users can choose at least one, two, or three items per row if the popup width allows.
- Line-style progress ignores the circular row-count preference.
- Compact popup widths avoid overflow by clamping or stacking safely.

## Planned Verification

- `npm run test -- src/providers/settings.test.ts src/popup/components/PopupProviderCard.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- Popup visual check for circular styles and compact/balanced/wide presets.
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If users later need per-provider row counts, design that separately; this phase is one global popup preference only.
