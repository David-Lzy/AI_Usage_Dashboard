# I18n Store Runtime Helper Copy

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the localization boundary for store-screenshot helper runtime routes
- refresh it when store screenshot helper routes, capture automation signals, or screenshot-adjacent runtime captions change
- `Phase 181` adds localized submission-support captions to the seed helper route while keeping final screenshot surfaces unchanged
- `Phase 403` adds a 14-locale implementation inventory for the existing helper route copy
- `Phase 410` adds localized error presentation wrappers while keeping raw helper error text visible inside the wrapper

## Goal

Keep store-screenshot helper routes understandable in the `en + zh_CN` runtime pilot without weakening the automation contract that screenshot capture scripts depend on.

## Runtime Routes In Scope

- `src/sidepanel/index.html#debug-store-screenshot-seed`
- `src/sidepanel/index.html#debug-native-popup-probe`

These routes are internal helpers. They can appear during store screenshot capture and RDP probing, but they are not final store-facing screenshot surfaces.

## Localized Scope

`Phase 180` and `Phase 181` localize:

- helper route section labels
- helper route headings
- preset application status copy
- route-contract explanatory copy
- native popup probe status copy
- generic success copy shown to the operator
- submission-support captions mapped from screenshot preset ids
- helper-only caption boundary copy that states the caption is not injected into final popup, side-panel, or full-page screenshots

Implementation lives in:

- [localized-copy.ts](../../src/shared/localized-copy.ts)
- [StoreScreenshotSeedPage.tsx](../../src/sidepanel/routes/StoreScreenshotSeedPage.tsx)
- [StoreScreenshotNativePopupProbePage.tsx](../../src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx)

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
- submission-support captions are operator aids only and are not injected into final popup, side-panel, or full-page screenshots

## Follow-Up

`Phase 181` closes the first screenshot-adjacent submission-support caption slice by showing localized preset-to-caption guidance inside the seed helper route. Generated store-listing source docs remain maintained separately and should not be translated inside runtime code unless the text is shown by the extension.

`Phase 182` moved that next policy boundary into [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md).

`Phase 403` inventories the 14-locale implementation boundary in [I18n_Store_Helper_14_Locale_Copy_Inventory.md](./I18n_Store_Helper_14_Locale_Copy_Inventory.md). The next store-helper-specific runtime change should use that inventory and preserve automation titles, preset ids, route hashes, capture-plan truth fields, final screenshot surfaces, request/archive ids, filenames, generated capture evidence, and Chrome Web Store listing source text.

`Phase 410` adds [I18n_Store_Helper_Error_Presentation_Split.md](./I18n_Store_Helper_Error_Presentation_Split.md). Store helper errors now have localized presentation wrappers, while raw invalid-preset, malformed-seed, and native popup probe error strings remain embedded exactly inside the rendered helper message.
