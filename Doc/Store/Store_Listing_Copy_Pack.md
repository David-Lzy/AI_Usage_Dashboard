# Store Listing Copy Pack

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained Chrome Web Store copy pack for the shipped extension scope
- after `Phase 495`, treat it as the current English upload-candidate copy pack anchored to the public-repository store handoff and refreshed screenshot archive
- `Phase 296` anchors the earlier mixed screenshot captions to the refreshed RC11 screenshot archive
- `Phase 299` records the upload-candidate handoff in [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- `Phase 495` records the public-repository handoff in [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)
- refresh it when the popup story, provider truth boundary, screenshot selection pack, or refreshed screenshot archive changes materially

Purpose:

- turn the current shipped toolbar story into one concise store-listing copy pack
- keep store claims aligned with the refreshed screenshot archive and the current provider truth boundary
- give future localization work one stable source pack instead of ad-hoc listing prose

## Source Anchors

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
- toolbar competitive-fit decisions:
  - [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Archive/benchmarks/Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- current extension manifest:
  - [src/manifest.json](../../src/manifest.json)

## Store Title

- preferred store title:
  - `AI Usage Dashboard`

## Short Description

- preferred short description:
  - `Track usage, setup blockers, and sync health across AI coding tools.`
- short-description length:
  - `68`
- manifest alignment:
  - matches the current `manifest.json` description exactly

## Overview Paragraph

- preferred overview paragraph:
  - `Check AI coding quota, setup blockers, and sync health from one Chrome toolbar popup, then open the side panel when provider source details matter.`

## Feature Bullets

- `Quick glance in one click from the Chrome toolbar popup.`
- `Clear setup guidance when host access or credentials are blocking live sync.`
- `Honest provider coverage that keeps policy-only and partial live paths explicit.`
- `Settings and provider detail live in the side panel instead of overloading the popup.`
- `Configurable themes, progress styles, provider order, toolbar badge, and toolbar icon.`
- `Real extension-mode screenshots and review archives keep store assets tied to shipped runtime states.`

## Screenshot Caption Pack

The current captions below target the `2026-05-16` public-readiness screenshot
archive captured from RDP Chrome.

### 1. Toolbar-first quick glance

- screenshot:
  - [01-popup-quick-glance.png](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/01-popup-quick-glance.png)
- caption:
  - `Check provider status and quota rings from the toolbar popup.`
- claim:
  - one click shows a compact snapshot instead of a second full dashboard

### 2. Dashboard overview

- screenshot:
  - [02-dashboard-overview.png](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/02-dashboard-overview.png)
- caption:
  - `Review all enabled providers in one dashboard.`
- claim:
  - the full-page dashboard gives the product promise, summary cards, and provider overview in one scannable workspace

### 3. Provider usage detail

- screenshot:
  - [03-provider-detail-contract.png](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/03-provider-detail-contract.png)
- caption:
  - `Inspect source boundaries before trusting a number.`
- claim:
  - Codex detail shows window-scoped percentages and reset timing without claiming one plan-wide remaining balance

### 4. Settings and theme controls

- screenshot:
  - [04-settings-overview-and-theme.png](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/04-settings-overview-and-theme.png)
- caption:
  - `Tune language, theme, sync, badge, icon, and progress display.`
- claim:
  - Settings keeps high-value appearance and sync controls visible in the main workspace

### 5. Quick setup and appearance

- screenshot:
  - [05-settings-quick-setup-and-appearance.png](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/05-settings-quick-setup-and-appearance.png)
- caption:
  - `Use quick setup and appearance controls without leaving the extension.`
- claim:
  - provider setup and visual preferences stay inside one extension settings surface

## Current Asset Boundary

- the current title, overview, feature bullets, and captions map to the public-readiness handoff
- the linked screenshot files point at the 2026-05-16 public-readiness screenshot archive
- the current screenshot set is dark-mode runtime evidence; a true light/dark split promotional image still requires a separate light-mode capture pass
- do not claim store submission has happened; this pack is submission-prep evidence, not a submitted listing receipt

## Claim Guardrails

- do not claim live usage for providers that currently ship `policy only`
- do not claim exact remaining quota where the shipped path is still `partial` or `window-only`
- do not claim full live quota support for providers that only expose partial, window-scoped, policy-only, or diagnostic-only paths
- do not claim JetBrains live support in the current RC
- do not market the popup as a second full dashboard

## Follow-up Use

- use this pack as the source document for future store listing updates
- use this pack as the English source for future listing-localization work
- keep the localization handoff aligned with [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)
- refresh this pack whenever a future screenshot archive replaces the current refreshed archive
