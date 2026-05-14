# Phase 429 - Progress Appearance Settings Preview

Status: queued

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
