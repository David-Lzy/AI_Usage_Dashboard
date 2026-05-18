# Store Screenshot Selection Pack

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current screenshot-slot selection and stale-review decision for Chrome Web Store assets
- after RC24 preparation, this remains the upload asset baseline unless a fresh runtime capture archive replaces it
- `Phase 296` archived the earlier user-approved mixed screenshot candidate pack as [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- `Phase 493` archived the public-repository handoff screenshot set as [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
- refresh this file whenever a new screenshot archive lands, the popup capture method changes, or the storyboard/copy pack changes materially

Purpose:

- decide which current screenshot slots can use archived assets
- make stale-vs-refresh decisions explicit before a new store screenshot request is created
- keep the maintained listing-copy pack and localization handoff honest about whether assets are final submission candidates or evidence baselines

## Source Inputs

- previous mixed screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- current public-readiness screenshot archive:
  - [2026-05-16-public-store-readiness-request-archive/README.md](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
- current storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- maintained listing copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- six-locale store handoff:
  - [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)

## Selection Decision Summary

Current selected assets:

- `01-popup-quick-glance.png`
- `02-dashboard-overview.png`
- `03-provider-detail-contract.png`
- `04-settings-overview-and-theme.png`
- `05-settings-quick-setup-and-appearance.png`

Current archive:

- [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)

Boundary:

- the current set is dark-mode runtime evidence from RDP Chrome
- each screenshot was resized/cropped to `1280x800` for Chrome Web Store dimensions
- provider values and runtime text were not edited
- a light/dark split promotional image remains a follow-up until a reliable light-mode capture pass exists

## Slot Decisions

### 1. Toolbar popup quick glance

- selected asset:
  - `01-popup-quick-glance.png`
- selected target:
  - toolbar popup app-window runtime capture
- selection status:
  - `public-readiness candidate`
- claim:
  - users can check provider status and quota rings quickly
- boundary:
  - this is an extension popup app-window capture from RDP Chrome, not a native toolbar-bubble pixel match

### 2. Dashboard overview

- selected asset:
  - `02-dashboard-overview.png`
- selected target:
  - full-page dashboard
- selection status:
  - `public-readiness candidate`
- claim:
  - one dashboard collects provider status and quota signals
- boundary:
  - runtime values reflect the local RDP profile state

### 3. Provider detail contract

- selected asset:
  - `03-provider-detail-contract.png`
- selected target:
  - Codex provider detail
- selection status:
  - `public-readiness candidate`
- claim:
  - provider detail exposes usage-window data and source boundaries before users trust a number
- boundary:
  - window-scoped and diagnostic/source-truth semantics are preserved; no plan-wide absolute balance is implied

### 4. Settings overview and theme controls

- selected asset:
  - `04-settings-overview-and-theme.png`
- selected target:
  - full-page Settings
- selection status:
  - `public-readiness candidate`
- claim:
  - language, theme, sync, badge, icon, and progress display are configurable
- boundary:
  - this is a dark-mode screenshot; do not describe it as a split light/dark promotional image

### 5. Quick setup and appearance controls

- selected asset:
  - `05-settings-quick-setup-and-appearance.png`
- selected target:
  - Settings quick setup plus appearance controls
- selection status:
  - `public-readiness candidate`
- claim:
  - provider setup and appearance controls stay inside the extension settings workspace
- boundary:
  - page scroll position comes from the operator capture state

## Historical Baselines

- the 2026-04-24 first real screenshot archive remains truthful historical evidence
- the 2026-05-04 RC11 mixed store candidate archive remains the earlier user-approved candidate evidence
- the 2026-05-16 public-readiness archive is the current screenshot handoff for the public repository release path

## Related Docs

- [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)
- [Direction 10.3 - Store Asset Pack And Submission TODOs](../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
