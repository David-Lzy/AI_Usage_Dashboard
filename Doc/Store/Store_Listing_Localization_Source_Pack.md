# Store Listing Localization Source Pack

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current English source pack for future Chrome Web Store listing localization work
- after `Phase 495`, treat it as the current English source pack anchored to the public-repository store handoff and refreshed screenshot archive
- `Phase 493` anchors the screenshot-caption source strings to the public-readiness screenshot archive
- `Phase 299` records the upload-candidate handoff in [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- `Phase 495` records the six-locale handoff in [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)
- refresh it when the maintained store-listing copy pack, screenshot selection pack, refreshed screenshot archive, or shipped truth boundary changes materially

Purpose:

- turn the current English store-listing copy into one stable source pack for future localization work
- keep future translated listing work anchored to the same refreshed screenshot archive, manifest text, and truth boundary as the maintained English copy pack
- make listing-localization work explicit without implying that the in-product UI is localized today

## Source Anchors

- maintained listing-copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](../testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- current refreshed screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- public-readiness screenshot archive:
  - [2026-05-16-public-store-readiness-request-archive/README.md](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
- upload-candidate milestone:
  - [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- screenshot storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- screenshot selection pack:
  - [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
- current extension manifest:
  - [src/manifest.json](../../src/manifest.json)

## English Source Strings

### Core Listing Fields

- `store.title`
  - `AI Usage Dashboard`
- `store.short_description`
  - `Track usage, setup blockers, and sync health across AI coding tools.`
- `store.overview`
  - `Check AI coding quota, setup blockers, and sync health from one Chrome toolbar popup, then open the side panel when provider source details matter.`

### Feature Bullets

- `store.feature.quick_glance`
  - `Quick glance in one click from the Chrome toolbar popup.`
- `store.feature.setup_guidance`
  - `Clear setup guidance when host access or credentials are blocking live sync.`
- `store.feature.honest_coverage`
  - `Honest provider coverage that keeps policy-only and partial live paths explicit.`
- `store.feature.sidepanel_depth`
  - `Settings and provider detail live in the side panel instead of overloading the popup.`
- `store.feature.customization`
  - `Configurable themes, progress styles, provider order, toolbar badge, and toolbar icon.`
- `store.feature.runtime_evidence`
  - `Real extension-mode screenshots and review archives keep store assets tied to shipped runtime states.`

### Screenshot Captions

- `store.screenshot_caption.01_toolbar_first`
  - `Check provider status and quota rings from the toolbar popup.`
- `store.screenshot_caption.02_setup_guidance`
  - `Review all enabled providers in one dashboard.`
- `store.screenshot_caption.03_honest_contract_or_policy_only`
  - `Inspect source boundaries before trusting a number.`
- `store.screenshot_caption.04_settings_and_setup_depth`
  - `Tune language, theme, sync, badge, icon, and progress display.`
- `store.screenshot_caption.05_provider_or_dashboard_depth`
  - `Use quick setup and appearance controls without leaving the extension.`

## Truth Anchor Map

- `store.title`
  - evidence anchor: current extension manifest name
  - proof surface: product title and current shipped extension package
- `store.short_description`
  - evidence anchor: current manifest description plus maintained listing-copy pack
  - proof surface: shipped extension scope, not untranslated future ambitions
- `store.overview`
  - evidence anchor: popup quick-glance story plus side-panel depth story in the maintained listing-copy pack
  - proof surface: popup handles fast state recognition while the side panel owns deeper review
- `store.feature.quick_glance`
  - evidence anchor: `01-popup-quick-glance.png`
  - truth note: current archive uses a real extension popup app-window capture from RDP Chrome and records the app-window boundary in capture notes
- `store.feature.setup_guidance`
  - evidence anchor: `02-dashboard-overview.png` plus `05-settings-quick-setup-and-appearance.png`
  - truth note: current candidate uses dashboard overview plus Settings setup controls instead of a dedicated setup-blocker popup slot
- `store.feature.honest_coverage`
  - evidence anchor: `03-provider-detail-contract.png`
  - truth note: current candidate uses Codex window-scoped detail and source-boundary context instead of faking exact usage
- `store.feature.sidepanel_depth`
  - evidence anchor: `03-provider-detail-contract.png` plus `04-settings-overview-and-theme.png`
  - truth note: settings owns source/setup depth while provider detail owns compact review depth; the popup must stay compact
- `store.feature.customization`
  - evidence anchor: `04-settings-overview-and-theme.png` plus `05-settings-quick-setup-and-appearance.png`
  - truth note: current screenshots show dark-mode settings controls; do not claim a light/dark split screenshot until that asset is captured
- `store.feature.runtime_evidence`
  - evidence anchor: screenshot archive package plus archive ledger
  - truth note: this claim depends on archived extension-mode evidence, not on preview-only mockups
- `store.screenshot_caption.01_toolbar_first`
  - evidence anchor: `01-popup-quick-glance.png`
- `store.screenshot_caption.02_setup_guidance`
  - evidence anchor: `02-dashboard-overview.png`
- `store.screenshot_caption.03_honest_contract_or_policy_only`
  - evidence anchor: `03-provider-detail-contract.png`
- `store.screenshot_caption.04_settings_and_setup_depth`
  - evidence anchor: `04-settings-overview-and-theme.png`
- `store.screenshot_caption.05_provider_or_dashboard_depth`
  - evidence anchor: `05-settings-quick-setup-and-appearance.png`

## Current Asset Boundary

- the current string ids map truthfully to the maintained listing-copy pack and public-readiness screenshot candidate pack
- the screenshot files now live in [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
- the six-locale handoff lives in [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)
- this source pack is submission-prep evidence, not a submitted listing receipt

## Translation Guardrails

- this source pack is for future store-listing localization work and is not evidence that the in-product UI is localized today
- localized listing strings must stay aligned with the current maintained [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md) and the refreshed screenshot archive
- do not translate product or provider names blindly:
  - `AI Usage Dashboard`
  - `Chrome`
  - `Cursor`
  - `Claude Code`
  - `Codex`
  - `Gemini`
- do not upgrade `policy-only`, `contract-only`, or partial live paths into claims of full live usage during translation
- preserve the distinction between popup quick glance and side-panel depth; translations must not market the popup as a second full dashboard
- re-check every localized short description against the current Chrome Web Store length limit; the English source is `68` characters but that count does not transfer across locales

## Follow-up Use

- use this pack as the English source document for future store-listing localization work
- refresh this pack when a later archived screenshot set replaces the public-readiness archive or when the maintained listing-copy pack changes
- coordinate future listing-localization rollout with the 14-locale runtime catalog, but do not wait for every store locale to receive human copy review before maintaining truthful source strings
