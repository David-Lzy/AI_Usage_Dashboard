# Phase 473 - Toolbar Icon Provider Preferences

Date: 2026-05-15

Status: completed

## Goal

Add Settings controls that let the toolbar action icon stay on the default extension icon, follow the selected toolbar badge provider, use a specific provider favicon, or use a user-provided custom image.

## Scope

- Add toolbar icon settings:
  - default icon
  - match toolbar badge
  - provider icon
  - custom image
- Add provider-icon selection in Settings.
- Add custom image upload and clear controls in Settings.
- Normalize toolbar icon settings in storage.
- Add Chrome `favicon` permission so provider favicons can be loaded through Chrome's extension favicon API.
- Add background toolbar-icon synchronization through `chrome.action.setIcon`.
- Keep action badge text, background color, and tooltip behavior unchanged.

## Preserved Boundaries

- Chrome Web Store / extension-management icons still come from manifest `icons` and are not changed at runtime.
- Provider source truth, usage values, warnings, credentials, host permissions, and page-session contracts are unchanged.
- Custom images are stored only as bounded data URLs in extension storage; cookies, session tokens, and remote user data are not stored.
- No package version bump or release zip refresh in this phase.

## Acceptance

- Existing users default to the current extension toolbar icon.
- `Match toolbar badge` uses the provider attached to the selected quota badge when one exists; attention-count badges fall back to the default icon.
- `Provider icon` uses the chosen provider's site favicon through Chrome's `_favicon` API.
- `Custom image` accepts image uploads and uses `chrome.action.setIcon` when image decoding is available; invalid or unavailable icon sources fall back to the default icon.
- Runtime catalog and Settings render tests cover the new labels and conditional controls.

## Planned Verification

- `npm run test -- src/background/action-icon.test.ts src/shared/storage.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/shared/i18n.test.ts --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/background/action-icon.test.ts src/shared/storage.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/shared/i18n.test.ts --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Before packaging this source into a new release candidate, run an extension-mode Chrome pass that checks default, match-badge, provider, and custom toolbar icon modes after rebuilding and reloading `dist/`.
