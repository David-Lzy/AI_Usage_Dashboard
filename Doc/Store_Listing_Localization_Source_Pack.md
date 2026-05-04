# Store Listing Localization Source Pack

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current English source pack for future Chrome Web Store listing localization work
- after `Phase 296`, treat it as the current English source pack anchored to the refreshed RC11 screenshot archive
- `Phase 296` anchors the screenshot-caption source strings to the user-approved mixed screenshot archive
- refresh it when the maintained store-listing copy pack, screenshot selection pack, refreshed screenshot archive, or shipped truth boundary changes materially

Purpose:

- turn the current English store-listing copy into one stable source pack for future localization work
- keep future translated listing work anchored to the same refreshed screenshot archive, manifest text, and truth boundary as the maintained English copy pack
- make listing-localization work explicit without implying that the in-product UI is localized today

## Source Anchors

- maintained listing-copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- current refreshed screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- screenshot storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- screenshot selection pack:
  - [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
- current extension manifest:
  - [src/manifest.json](../src/manifest.json)

## English Source Strings

### Core Listing Fields

- `store.title`
  - `AI Usage Dashboard`
- `store.short_description`
  - `Track usage, setup blockers, and sync health across AI coding tools.`
- `store.overview`
  - `Get a quick popup summary of visible AI tools, see the next setup step when access or credentials are missing, and open the side panel for deeper provider and contract review.`

### Feature Bullets

- `store.feature.quick_glance`
  - `Quick glance in one click from the Chrome toolbar popup.`
- `store.feature.setup_guidance`
  - `Clear setup guidance when host access or credentials are blocking live sync.`
- `store.feature.honest_coverage`
  - `Honest provider coverage that keeps policy-only and partial live paths explicit.`
- `store.feature.sidepanel_depth`
  - `Settings and provider detail live in the side panel instead of overloading the popup.`
- `store.feature.runtime_evidence`
  - `Real extension-mode screenshots and review archives keep store assets tied to shipped runtime states.`

### Screenshot Captions

- `store.screenshot_caption.01_toolbar_first`
  - `Check Codex and Cursor status from one Chrome toolbar popup.`
- `store.screenshot_caption.02_setup_guidance`
  - `Use one dashboard to collect AI coding quota and sync health.`
- `store.screenshot_caption.03_honest_contract_or_policy_only`
  - `Review usage windows and reset timing without fake precision.`
- `store.screenshot_caption.04_settings_and_setup_depth`
  - `Keep partial provider contracts visible before you trust a number.`
- `store.screenshot_caption.05_provider_or_dashboard_depth`
  - `Open the side panel for compact provider review.`

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
  - evidence anchor: `01-toolbar-first-quick-glance.png`
  - truth note: current archive uses a user-reviewed native toolbar popup runtime capture from RDP Chrome
- `store.feature.setup_guidance`
  - evidence anchor: `02-setup-guidance.png`
  - truth note: current candidate uses a full-page dashboard overview instead of a dedicated setup-blocker popup slot
- `store.feature.honest_coverage`
  - evidence anchor: `03-honest-contract-or-policy-only.png`
  - truth note: current candidate uses Codex window-scoped detail and Cursor personal partial source context instead of faking exact usage
- `store.feature.sidepanel_depth`
  - evidence anchor: `04-settings-and-setup-depth.png` plus `05-provider-or-dashboard-depth.png`
  - truth note: settings owns source/setup depth while provider detail owns compact review depth; the popup must stay compact
- `store.feature.runtime_evidence`
  - evidence anchor: screenshot archive package plus archive ledger
  - truth note: this claim depends on archived extension-mode evidence, not on preview-only mockups
- `store.screenshot_caption.01_toolbar_first`
  - evidence anchor: `01-toolbar-first-quick-glance.png`
- `store.screenshot_caption.02_setup_guidance`
  - evidence anchor: `02-setup-guidance.png`
- `store.screenshot_caption.03_honest_contract_or_policy_only`
  - evidence anchor: `03-honest-contract-or-policy-only.png`
- `store.screenshot_caption.04_settings_and_setup_depth`
  - evidence anchor: `04-settings-and-setup-depth.png`
- `store.screenshot_caption.05_provider_or_dashboard_depth`
  - evidence anchor: `05-provider-or-dashboard-depth.png`

## Current Asset Boundary

- the current string ids map truthfully to the maintained listing-copy pack and user-approved mixed screenshot candidate pack
- the screenshot files now live in [2026-05-04-rc11-mixed-store-candidate-archive](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
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
- refresh this pack when a later archived screenshot set replaces the refreshed RC11 archive or when the maintained listing-copy pack changes
- coordinate future listing-localization rollout with `Direction 09`, but do not wait for full in-product localization before defining truthful listing-source strings
