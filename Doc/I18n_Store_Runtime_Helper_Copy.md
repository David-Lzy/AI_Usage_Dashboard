# I18n Store Runtime Helper Copy

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the localization boundary for store-screenshot helper runtime routes
- refresh it when store screenshot helper routes, capture automation signals, or screenshot-adjacent runtime captions change

## Goal

Keep store-screenshot helper routes understandable in the `en + zh_CN` runtime pilot without weakening the automation contract that screenshot capture scripts depend on.

## Runtime Routes In Scope

- `src/sidepanel/index.html#debug-store-screenshot-seed`
- `src/sidepanel/index.html#debug-native-popup-probe`

These routes are internal helpers. They can appear during store screenshot capture and RDP probing, but they are not final store-facing screenshot surfaces.

## Localized Scope

`Phase 180` localizes:

- helper route section labels
- helper route headings
- preset application status copy
- route-contract explanatory copy
- native popup probe status copy
- generic success copy shown to the operator

Implementation lives in:

- [localized-copy.ts](../src/shared/localized-copy.ts)
- [StoreScreenshotSeedPage.tsx](../src/sidepanel/routes/StoreScreenshotSeedPage.tsx)
- [StoreScreenshotNativePopupProbePage.tsx](../src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx)

## Preserved Automation Boundary

The following remain stable because scripts and RDP helper flows use them as operational signals:

- `AI Usage Dashboard Screenshot Seed Running`
- `AI Usage Dashboard Screenshot Seed Applied`
- `AI Usage Dashboard Screenshot Seed Cleared`
- `AI Usage Dashboard Screenshot Seed Failed`
- `AI Usage Dashboard Native Popup Probe`
- screenshot preset ids such as `toolbar-first-quick-glance`
- route hashes such as `#debug-store-screenshot-seed` and `#debug-native-popup-probe`

## Truth Boundary

This localization slice does not claim that helper routes are final submission screenshots.

The localized copy must continue to say:

- the seed route only prepares truthful extension-mode runtime state
- the native popup probe only checks whether RDP Chrome exposes the real toolbar bubble
- popup app-window smoke evidence is not a replacement for native toolbar-bubble submission capture
- the real store-asset line still retains the manual native-toolbar popup capture dependency

## Follow-Up

The next i18n work should move from helper routes to store-facing runtime captions that can appear inside actual screenshot surfaces or submission-support material. Generated store-listing source docs remain maintained separately and should not be translated inside runtime code unless the text is shown by the extension.
