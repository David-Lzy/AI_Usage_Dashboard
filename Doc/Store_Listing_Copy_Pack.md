# Store Listing Copy Pack

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained Chrome Web Store copy pack for the shipped extension scope
- refresh it when the popup story, provider truth boundary, first archived screenshot set, or store positioning changes materially

Purpose:

- turn the current shipped toolbar story into one concise store-listing copy pack
- keep store claims aligned with the first archived screenshot set and the current provider truth boundary
- give future localization work one stable source pack instead of ad-hoc listing prose

## Source Anchors

- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- screenshot storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- toolbar competitive-fit decisions:
  - [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](./Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- current extension manifest:
  - [src/manifest.json](../src/manifest.json)

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
  - `Get a quick popup summary of visible AI tools, see the next setup step when access or credentials are missing, and open the side panel for deeper provider and contract review.`

## Feature Bullets

- `Quick glance in one click from the Chrome toolbar popup.`
- `Clear setup guidance when host access or credentials are blocking live sync.`
- `Honest provider coverage that keeps policy-only and partial live paths explicit.`
- `Settings and provider detail live in the side panel instead of overloading the popup.`
- `Real extension-mode screenshots and review archives keep store assets tied to shipped runtime states.`

## Screenshot Caption Pack

### 1. Toolbar-first quick glance

- screenshot:
  - [01-toolbar-first-quick-glance.png](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/01-toolbar-first-quick-glance.png)
- caption:
  - `Check visible AI tool status in one quick popup glance.`
- claim:
  - one click shows a compact snapshot instead of a second full dashboard

### 2. Setup guidance

- screenshot:
  - [02-setup-guidance.png](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/02-setup-guidance.png)
- caption:
  - `Know the next setup step when access or credentials are missing.`
- claim:
  - the popup explains the next action instead of only surfacing raw warning cards

### 3. Honest contract-only or policy-only state

- screenshot:
  - [03-honest-contract-or-policy-only.png](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/03-honest-contract-or-policy-only.png)
- caption:
  - `See honest provider coverage without faking unsupported live usage.`
- claim:
  - the product keeps contract-only or policy-only states explicit

### 4. Settings and setup depth

- screenshot:
  - [04-settings-and-setup-depth.png](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/04-settings-and-setup-depth.png)
- caption:
  - `Use the side panel for setup ownership and deeper controls.`
- claim:
  - setup belongs in Settings, not in an overloaded popup

### 5. Provider or dashboard depth

- screenshot:
  - [05-provider-or-dashboard-depth.png](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/05-provider-or-dashboard-depth.png)
- caption:
  - `Open deeper provider review when the popup needs more context.`
- claim:
  - detailed provider and contract review belongs to the side panel

## Claim Guardrails

- do not claim live usage for providers that currently ship `policy only`
- do not claim exact remaining quota where the shipped path is still `partial` or `window-only`
- do not claim full multilingual product support before `Direction 09` ships pilot locales
- do not claim JetBrains live support in the current RC
- do not market the popup as a second full dashboard

## Follow-up Use

- use this pack as the source document for future store listing updates
- use this pack as the English source for future listing-localization work
- keep the localization handoff aligned with [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)
- refresh this pack whenever a future screenshot archive replaces the current first archived set
