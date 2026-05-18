# Store Listing Localization Source Pack

Date: 2026-05-18

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the public English source pack for Chrome Web Store listing localization
- personal upload handoffs, package hashes, screenshot archives, and browser-profile evidence live in ignored `.local/` history

Purpose:

- keep translated store listings anchored to the same conservative English claims
- avoid turning partial, window-scoped, policy-only, or unavailable provider data into stronger support promises
- keep public source text independent from private upload operations

## Source Anchors

- maintained listing-copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- current extension manifest:
  - [src/manifest.json](../../src/manifest.json)
- locale draft structure:
  - [Store_Listing_Localization_14_Locale_Draft.md](./Store_Listing_Localization_14_Locale_Draft.md)

## English Source Strings

### Core Listing Fields

- `store.title`
  - `AI Usage Dashboard`
- `store.short_description`
  - `Track usage, setup blockers, and sync health across AI coding tools.`
- `store.overview`
  - `AI Usage Dashboard is a small cockpit for AI coding quota, setup blockers, and sync health. Open the Chrome toolbar popup for a quick peek; open the side panel or full-page dashboard when you need details. Less tab-hunting, more coding. (^_^)`

### Feature Bullets

- `store.feature.quick_glance`
  - `Quick glance from the Chrome toolbar popup, with deeper detail in the side panel or full-page dashboard.`
- `store.feature.setup_guidance`
  - `Clear setup guidance when host access, credentials, a signed-in page, or provider policy blocks live sync.`
- `store.feature.honest_coverage`
  - `Honest provider coverage that labels exact, partial, window-scoped, policy-only, and unavailable sources.`
- `store.feature.sidepanel_depth`
  - `Provider detail, source boundaries, diagnostics, permissions, credentials, and display settings stay available without overloading the popup.`
- `store.feature.customization`
  - `Configurable language, themes, popup appearance, progress styles, provider order, toolbar badge, toolbar icon, and import/export settings.`
- `store.feature.open_source`
  - `Open-source code under AGPL-3.0-only.`

### Screenshot Captions

- `store.screenshot_caption.01_toolbar_first`
  - `Check provider status and quota rings from the toolbar popup.`
- `store.screenshot_caption.02_dashboard`
  - `Review enabled providers in one dashboard.`
- `store.screenshot_caption.03_source_boundary`
  - `Inspect source boundaries before trusting a number.`
- `store.screenshot_caption.04_settings`
  - `Tune language, theme, sync, badge, icon, and progress display.`
- `store.screenshot_caption.05_setup`
  - `Use quick setup and provider display controls without leaving the extension.`

## Translation Guardrails

- Keep the product name `AI Usage Dashboard` unchanged unless a store locale explicitly requires a translated title variant.
- Keep provider names unchanged: `Codex`, `Cursor`, `Claude Code`, `Gemini Code Assist`, and `JetBrains AI`.
- Do not claim live usage for policy-only or deferred providers.
- Do not claim exact remaining quota where the product only exposes partial or window-scoped usage.
- Preserve the distinction between toolbar popup quick glance and side-panel/full-page detail.
- Mention the `favicon` permission only for the optional provider-matched toolbar icon feature.
