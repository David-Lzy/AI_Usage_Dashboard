# Store Screenshot Selection Pack

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current screenshot-slot selection and stale-review decision for Chrome Web Store assets
- `Phase 161` turned the first archived screenshot set into a historical baseline rather than a final submission pack after the popup/full-page surface-expansion line
- refresh this file whenever a new screenshot archive lands, the popup capture method changes, or the storyboard/copy pack changes materially

Purpose:

- decide which current screenshot slots can still use archived assets
- make stale-vs-refresh decisions explicit before a new store screenshot request is created
- keep the maintained listing-copy pack and localization source pack honest about whether they are final submission assets or pre-refresh baselines

## Source Inputs

- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](./testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- refreshed runtime QA evidence from `Phase 160`:
  - [phase160-results.json](../tmp/phase160-rdp-runtime-surface-refresh-review/phase160-results.json)
- current storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- maintained listing copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- maintained localization source pack:
  - [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)

## Selection Decision Summary

- archived screenshots retained as final submission assets without recapture:
  - none
- archived screenshots retained as truthful historical baseline only:
  - `01-toolbar-first-quick-glance.png`
  - `02-setup-guidance.png`
  - `03-honest-contract-or-policy-only.png`
  - `04-settings-and-setup-depth.png`
  - `05-provider-or-dashboard-depth.png`
- immediate next action:
  - create one refreshed screenshot-capture request for the post-`Phase 160` surface contract

## Slot Decisions

### 1. Toolbar-first quick glance

- current archived asset:
  - `01-toolbar-first-quick-glance.png`
- selection status:
  - `recapture required`
- next target:
  - native toolbar action-bubble popup capture
- keep current archive as:
  - historical baseline only
- why:
  - the archived popup shot predates the shipped popup expand control, quick light-dark toggle, and full-page entry motion line
  - the current smoke helper opens `src/popup/index.html` in its own extension app window, which is truthful QA evidence but not a pixel-identical replacement for the real toolbar bubble

### 2. Setup guidance

- current archived asset:
  - `02-setup-guidance.png`
- selection status:
  - `recapture required`
- next target:
  - native toolbar action-bubble popup capture
- keep current archive as:
  - historical baseline only
- why:
  - the claim remains valid, but the visual contract changed with the shipped popup expand and quick-theme controls
  - final store capture should use the real toolbar bubble rather than the QA-only popup app-window framing

### 3. Honest contract-only or policy-only state

- current archived asset:
  - `03-honest-contract-or-policy-only.png`
- selection status:
  - `recapture required`
- next target:
  - native toolbar action-bubble popup capture
- keep current archive as:
  - historical baseline only
- why:
  - the honesty claim is still correct, but the popup surface changed materially after the first archive
  - this slot should be refreshed together with the other popup slots so the first three store screenshots share one consistent current popup contract

### 4. Settings and setup depth

- current archived asset:
  - `04-settings-and-setup-depth.png`
- selection status:
  - `recapture required`
- next target:
  - full-page shell `Settings`
- keep current archive as:
  - historical baseline only
- why:
  - the old sidepanel Settings capture remains truthful, but it no longer reflects the now-shipped expand-to-full-page story
  - `Phase 160` refreshed full-page Settings QA evidence, so the next store-ready pack should use that larger expanded workspace surface instead of stopping at the sidepanel baseline

### 5. Provider or dashboard depth

- current archived asset:
  - `05-provider-or-dashboard-depth.png`
- selection status:
  - `recapture required`
- next target:
  - full-page shell `Provider detail` by default, with full-page dashboard as an explicit fallback if it tells the clearer truthful story
- keep current archive as:
  - historical baseline only
- why:
  - the old sidepanel provider-detail capture is now behind the current expanded workspace contract
  - `Phase 160` refreshed both full-page dashboard and full-page provider-detail QA evidence, so the next store pack can choose the clearer of those expanded review surfaces instead of staying on the narrower sidepanel view

## Current Boundary

- the first archived screenshot set is still useful as a truthful evidence package and caption baseline
- the first archived screenshot set is no longer the final recommended submission asset set after `Phase 155` through `Phase 160`
- the maintained listing-copy pack and localization source pack therefore remain pre-refresh English baselines until a new screenshot archive replaces the current first archive

## Related Docs

- [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)
- [Direction 10.3 - Store Asset Pack And Submission TODOs](./Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
