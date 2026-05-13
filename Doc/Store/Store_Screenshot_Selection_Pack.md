# Store Screenshot Selection Pack

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current screenshot-slot selection and stale-review decision for Chrome Web Store assets
- `Phase 161` turned the first archived screenshot set into a historical baseline rather than a final submission pack after the popup/full-page surface-expansion line
- `Phase 296` archived the user-approved mixed screenshot candidate pack as [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- `Phase 299` recorded the RC12 Chrome Web Store upload-candidate milestone that uses this screenshot archive
- refresh this file whenever a new screenshot archive lands, the popup capture method changes, or the storyboard/copy pack changes materially

Purpose:

- decide which current screenshot slots can still use archived assets
- make stale-vs-refresh decisions explicit before a new store screenshot request is created
- keep the maintained listing-copy pack and localization source pack honest about whether they are final submission assets or pre-refresh baselines

## Source Inputs

- first real screenshot archive:
  - [2026-04-24-first-real-store-screenshot-capture-request-archive/README.md](../testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
- current refreshed screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- refreshed runtime QA evidence from `Phase 160`:
  - [phase160-results.json](../../tmp/phase160-rdp-runtime-surface-refresh-review/phase160-results.json)
- current storyboard:
  - [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- maintained listing copy pack:
  - [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- maintained localization source pack:
  - [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)

## Selection Decision Summary

- archived screenshots retained as final submission assets without recapture:
  - `01-toolbar-first-quick-glance.png`
  - `02-setup-guidance.png`
  - `03-honest-contract-or-policy-only.png`
  - `04-settings-and-setup-depth.png`
  - `05-provider-or-dashboard-depth.png`
- archived screenshots retained as truthful historical baseline only:
  - the full `2026-04-24` first real screenshot archive
- immediate next action:
  - use the [RC12 upload-candidate milestone](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md) for the human Chrome Web Store listing upload

## Current Candidate Decision

The user accepted a mixed store screenshot pack on `2026-05-04`.

Preferred candidate order:

1. native toolbar popup quick glance showing Codex usage-window rings
2. full-page dashboard overview showing the product promise and summary cards
3. Codex provider usage detail showing remaining percentages and reset timing
4. Cursor source/settings detail showing the personal partial boundary
5. Chrome side-panel provider-detail view triggered through the shipped popup path

This decision replaces the old product requirement that the first three final
slots all be native toolbar popup captures. The first screenshot should still be
a native toolbar popup capture. Additional popup scroll states are now optional
rather than blocking the store asset pack.

The selected images were captured from RDP Chrome, saved under the candidate
intake package, and archived in
[2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md).

## Slot Decisions

### 1. Toolbar-first quick glance

- current refreshed archived asset:
  - `01-toolbar-first-quick-glance.png`
- selection status:
  - `archived final candidate`
- selected target:
  - native toolbar action-bubble popup capture
- keep first archive as:
  - historical baseline only
- why:
  - the archived popup shot predates the shipped popup expand control, quick light-dark toggle, and full-page entry motion line
  - the current smoke helper opens `src/popup/index.html` in its own extension app window, which is truthful QA evidence but not a pixel-identical replacement for the real toolbar bubble

### 2. Setup guidance

- current refreshed archived asset:
  - `02-setup-guidance.png`
- selection status:
  - `archived final candidate`
- selected target:
  - full-page dashboard overview
- keep first archive as:
  - historical baseline only
- why:
  - after user review, the dashboard overview tells the current product story more clearly than a second popup scroll state
  - setup guidance remains part of the listing copy and Settings story, but no longer blocks the screenshot pack as a dedicated popup slot

### 3. Honest contract-only or policy-only state

- current refreshed archived asset:
  - `03-honest-contract-or-policy-only.png`
- selection status:
  - `archived final candidate`
- selected target:
  - Codex provider usage detail plus Cursor source/settings boundary detail
- keep first archive as:
  - historical baseline only
- why:
  - the honesty claim is clearer in the current full-page/provider/source surfaces than in a narrow policy-only popup scroll state
  - the chosen Cursor settings/source image explicitly shows `personal partial` and `仅窗口供应商值`, preserving the no-fake-precision boundary

### 4. Settings and setup depth

- current refreshed archived asset:
  - `04-settings-and-setup-depth.png`
- selection status:
  - `archived final candidate`
- selected target:
  - full-page shell `Settings`
- keep first archive as:
  - historical baseline only
- why:
  - the refreshed Settings/source capture shows the deeper source-control workspace without crowding the toolbar popup
  - the Cursor personal route remains partial by design, so the image preserves that no-fake-precision boundary

### 5. Provider or dashboard depth

- current refreshed archived asset:
  - `05-provider-or-dashboard-depth.png`
- selection status:
  - `archived final candidate`
- selected target:
  - Chrome side panel `Provider detail`, captured through the shipped popup path
- keep first archive as:
  - historical baseline only
- why:
  - the side panel remains a shipped deep-review surface, and this capture proves the compact provider-detail hierarchy through the real popup-to-side-panel path
  - the Codex detail still uses window-scoped usage semantics, not a plan-wide absolute balance

## Current Boundary

- the first archived screenshot set remains useful as truthful historical evidence
- [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md) is the current refreshed screenshot evidence package
- the maintained listing-copy pack and localization source pack should point at the refreshed archive for current submission-prep work

## Related Docs

- [Store_Screenshot_Storyboard.md](./Store_Screenshot_Storyboard.md)
- [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- [Store_Listing_Localization_Source_Pack.md](./Store_Listing_Localization_Source_Pack.md)
- [Direction 10.3 - Store Asset Pack And Submission TODOs](../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
