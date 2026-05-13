# Store Helper 14-Locale Copy Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 403`
- implementation input for `Phase 405`

## Purpose

Define the safe 14-locale implementation boundary for store-helper runtime copy, covering the screenshot seed helper route and native popup probe helper route without translating automation titles, preset ids, route hashes, capture-plan truth fields, final screenshot surfaces, request ids, archive ids, filenames, generated capture evidence, or Chrome Web Store listing source text.

## Current Runtime State

- `src/shared/store-workflow-localized-copy.ts` currently has one explicit `zh-CN` branch plus English fallback for every other runtime locale.
- `src/shared/localized-copy.ts` re-exports `buildStoreWorkflowLocalizedCopy`; this public path must remain stable.
- `src/shared/store-workflow-localized-copy.test.ts` currently guards English, Simplified Chinese, and the legacy re-export path.
- The helper feeds:
  - `src/sidepanel/routes/StoreScreenshotSeedPage.tsx`
  - `src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx`
- The helper routes are internal operator routes. They may appear during RDP/store screenshot workflows, but they are not final Chrome Web Store screenshot surfaces.

## Phase 405 Approved Helper Buckets

These buckets are stable helper UI copy and should receive explicit copy for all 14 shipped runtime locales in `Phase 405`:

### Screenshot Seed Route

Source:

- `src/shared/store-workflow-localized-copy.ts`
- `src/sidepanel/routes/StoreScreenshotSeedPage.tsx`

Approved copy:

- `screenshotSeed.sectionLabel`
- running, failed, route-contract, and internal-tooling labels
- `applyingDetail(preset)` pattern, with the raw preset id preserved
- contract detail explaining the helper is not a store-facing screenshot surface
- temporary seed-lock, unlock-restored, and unlock-no-backup details
- submission-support caption label and boundary detail
- `presetHeadline(preset, fallback)` localized map
- `presetDetail(preset, fallback)` localized map
- `submissionCaption(preset)` localized map
- generic seed-route failure fallback

Approved preset-copy keys:

- `toolbar-first-quick-glance`
- `setup-guidance`
- `honest-contract-or-policy-only`
- `settings-and-setup-depth`
- `provider-or-dashboard-depth`
- `unlock` for seed headline/detail only

Preserve:

- preset ids
- query parameter name `preset`
- storage keys
- seed lock behavior
- app-state seed payloads
- provider snapshot warning/source-truth strings inside seeded `AppState`

### Native Popup Probe Route

Source:

- `src/shared/store-workflow-localized-copy.ts`
- `src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx`

Approved copy:

- `nativePopupProbe.sectionLabel`
- opening, requested, failed, did-not-open, route-contract, and internal-tooling labels
- opening detail explaining `chrome.action.openPopup`
- accepted message
- contract detail explaining the probe route is not a store-facing screenshot surface

Preserve:

- the `PROBE_TITLE` document title automation signal
- `app:open-action-popup` message type
- `chrome.action.openPopup` behavior
- popup capture/probe process detection logic

## Consumer Copy To Keep Raw Or Defer

The following visible strings are intentionally not part of the first 14-locale store-helper implementation unless a later phase adds a display/error presentation split:

- `StoreScreenshotSeedPage.tsx`
  - document titles:
    - `AI Usage Dashboard Screenshot Seed Running`
    - `AI Usage Dashboard Screenshot Seed Applied`
    - `AI Usage Dashboard Screenshot Seed Cleared`
    - `AI Usage Dashboard Screenshot Seed Failed`
  - invalid-preset error text from `readPresetFromLocation()`
  - missing app-state error text for a malformed preset definition
- `StoreScreenshotNativePopupProbePage.tsx`
  - document title `AI Usage Dashboard Native Popup Probe`
  - background/runtime error text returned by `sendAppMessage`
- `src/sidepanel/store-screenshot-seed.ts`
  - preset definitions' English headline/detail source values, which remain fallback/source-truth values until the helper maps them for display
  - seeded provider snapshot labels, warning reasons, source-selection raw messages, reset labels, and sync labels
- `scripts/lib/store-screenshot-rdp-capture.mjs`
  - capture-plan filenames, route paths, expected titles, dimensions, capture-truth values, state summaries, and operator notes

## Protected Automation And Evidence Boundary

Do not translate or rewrite these in `Phase 405`:

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
- generated capture-plan filenames:
  - `01-toolbar-first-quick-glance.png`
  - `02-setup-guidance.png`
  - `03-honest-contract-or-policy-only.png`
  - `04-settings-and-setup-depth.png`
  - `05-provider-or-dashboard-depth.png`
- request ids, archive ids, capture-notes JSON fields, manifest fields, manual-handoff fields, and generated archive-package README content
- `captureTruth`, `stateSummary`, and `operatorNote` values in store screenshot capture plans and archives
- final popup, side-panel, and full-page screenshot pixels
- Chrome Web Store listing source text and 14-locale listing draft text under `Doc/Store/`
- provider names and product names: AI Usage Dashboard, Chrome, Cursor, Codex, Claude Code, Gemini, JetBrains
- raw provider evidence strings, diagnostic bodies, source-selection/fallback strings, vendor page text, URLs, host labels, and seeded fixture values

## Phase 405 Implementation Checklist

1. Keep `buildStoreWorkflowLocalizedCopy(i18n)` and the `src/shared/localized-copy.ts` re-export stable.
2. Replace the current `resolvedLocale === "zh-CN"` branch with a locale catalog or structured map for all 14 runtime locales.
3. Include explicit `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id` entries for the approved helper buckets.
4. Preserve the fallback behavior for unknown preset headlines/details: `presetHeadline(preset, fallback)` and `presetDetail(preset, fallback)` must still return the provided fallback for unknown preset ids.
5. Keep `submissionCaption(preset)` returning an empty string for unknown or unsupported preset ids.
6. Do not change route configs, capture plan entries, request/archival scripts, generated ledgers, release packaging, or final screenshot surfaces.
7. Add tests proving representative non-English and Arabic store-helper copy does not fall back to English for the approved buckets.
8. Add or preserve tests proving unknown preset fallback, legacy re-export, automation titles, and capture-plan identity values stay unchanged.

## Planned Verification For Phase 405

- `npm run i18n:check`
- `npm run test -- src/shared/store-workflow-localized-copy.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- focused store route or RDP route tests if helper consumers change
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up Boundary

If `Phase 405` cannot translate every visible helper-adjacent label without touching automation or evidence contracts, it should prioritize the `buildStoreWorkflowLocalizedCopy` helper-owned buckets and leave invalid-preset/error-message localization to a later typed presentation split.
