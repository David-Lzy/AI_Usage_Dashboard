# Store Helper Error Presentation Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 410`
- records the localized display wrapper for store-helper error messages
- preserve raw helper error text as debugging evidence inside the localized wrapper

## Purpose

`Phase 405` localized store-helper route labels, headings, captions, and happy-path feedback for all 14 runtime locales. It intentionally left helper-adjacent error strings raw because invalid preset, malformed seed, and native popup background failures can be debugging evidence.

`Phase 410` adds a narrow presentation split:

- the UI now shows a localized error wrapper
- the original raw error message remains embedded exactly inside that wrapper
- automation document titles, preset ids, route hashes, request/archive identities, capture-plan fields, filenames, generated evidence, and final screenshot surfaces remain unchanged

## Runtime Scope

Implementation files:

- `src/shared/store-workflow-localized-copy.ts`
- `src/shared/store-workflow-localized-copy.test.ts`
- `src/sidepanel/routes/StoreScreenshotSeedPage.tsx`
- `src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx`

Copy bucket:

- `buildStoreWorkflowLocalizedCopy(i18n).screenshotSeed.errorDetail(rawMessage)`
- `buildStoreWorkflowLocalizedCopy(i18n).nativePopupProbe.errorDetail(rawMessage)`

## Localized Presentation

The wrapper is localized for every shipped runtime locale:

- `en`
- `zh-CN`
- `zh-TW`
- `ja`
- `ko`
- `es-419`
- `pt-BR`
- `fr`
- `de`
- `it`
- `ru`
- `ar`
- `hi`
- `id`

The raw message argument is not translated, normalized, redacted, or rephrased by this helper.

## Preserved Raw Error Inputs

These raw strings can still appear inside the localized wrapper:

- invalid or missing `?preset=` errors from `StoreScreenshotSeedPage.tsx`
- malformed seed definition errors such as a preset without `appState`
- unexpected seed route fallback errors
- background/runtime errors returned through `app:open-action-popup`
- `chrome.action.openPopup` fallback failure messages from the background message bus

## Preserved Automation And Evidence Boundary

Do not change these as part of store-helper error presentation:

- automation document titles:
  - `AI Usage Dashboard Screenshot Seed Running`
  - `AI Usage Dashboard Screenshot Seed Applied`
  - `AI Usage Dashboard Screenshot Seed Cleared`
  - `AI Usage Dashboard Screenshot Seed Failed`
  - `AI Usage Dashboard Native Popup Probe`
- route hashes:
  - `#debug-store-screenshot-seed`
  - `#debug-native-popup-probe`
- preset ids:
  - `toolbar-first-quick-glance`
  - `setup-guidance`
  - `honest-contract-or-policy-only`
  - `settings-and-setup-depth`
  - `provider-or-dashboard-depth`
  - `unlock`
- generated capture-plan filenames
- request ids, archive ids, manifest fields, manual-handoff fields, and generated archive package README content
- `captureTruth`, `stateSummary`, and `operatorNote` values in store screenshot capture plans and archives
- final popup, side-panel, and full-page screenshot pixels
- Chrome Web Store listing source or 14-locale listing draft text

## Test Contract

The focused helper tests must keep proving:

- store-helper route copy exists for every shipped runtime locale
- unknown preset headline/detail fallback still returns the provided fallback
- unsupported caption lookup still returns an empty string
- error presentation wrappers include the exact raw error message
- the legacy `src/shared/localized-copy.ts` re-export path still works

