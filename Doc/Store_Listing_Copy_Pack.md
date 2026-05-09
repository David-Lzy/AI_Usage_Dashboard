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
- after `Phase 299`, treat it as the current English upload-candidate copy pack anchored to the RC12 milestone and refreshed screenshot archive
- `Phase 296` anchors the current mixed screenshot captions to the refreshed RC11 screenshot archive
- `Phase 299` records the upload-candidate handoff in [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](./Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- refresh it when the popup story, provider truth boundary, screenshot selection pack, or refreshed screenshot archive changes materially

Purpose:

- turn the current shipped toolbar story into one concise store-listing copy pack
- keep store claims aligned with the refreshed screenshot archive and the current provider truth boundary
- give future localization work one stable source pack instead of ad-hoc listing prose

## Source Anchors

- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- current refreshed screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- upload-candidate milestone:
  - [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](./Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- screenshot storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- screenshot selection pack:
  - [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
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

The current captions below target the `2026-05-04` mixed screenshot archive
accepted by the user and captured from RDP Chrome.

### 1. Toolbar-first quick glance

- screenshot:
  - [01-toolbar-first-quick-glance.png](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/01-toolbar-first-quick-glance.png)
- caption:
  - `Check Codex and Cursor status from one Chrome toolbar popup.`
- claim:
  - one click shows a compact snapshot instead of a second full dashboard

### 2. Dashboard overview

- screenshot:
  - [02-setup-guidance.png](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/02-setup-guidance.png)
- caption:
  - `Use one dashboard to collect AI coding quota and sync health.`
- claim:
  - the full-page dashboard gives the product promise, summary cards, and provider overview in one scannable workspace

### 3. Provider usage detail

- screenshot:
  - [03-honest-contract-or-policy-only.png](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/03-honest-contract-or-policy-only.png)
- caption:
  - `Review usage windows and reset timing without fake precision.`
- claim:
  - Codex detail shows window-scoped percentages and reset timing without claiming one plan-wide remaining balance

### 4. Source boundary detail

- screenshot:
  - [04-settings-and-setup-depth.png](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/04-settings-and-setup-depth.png)
- caption:
  - `Keep partial provider contracts visible before you trust a number.`
- claim:
  - Cursor personal support is shown as partial billing-period context rather than exact remaining included requests

### 5. Side-panel provider depth

- screenshot:
  - [05-provider-or-dashboard-depth.png](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/05-provider-or-dashboard-depth.png)
- caption:
  - `Open the side panel for compact provider review.`
- claim:
  - Codex source detail and usage review stay in the deeper side-panel workspace instead of crowding the popup

## Current Asset Boundary

- the current title, overview, feature bullets, and captions map to the user-approved mixed candidate pack
- the linked screenshot files point at the refreshed RC11 mixed screenshot archive
- do not claim store submission has happened; this pack is submission-prep evidence, not a submitted listing receipt

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
- refresh this pack whenever a future screenshot archive replaces the current refreshed archive
