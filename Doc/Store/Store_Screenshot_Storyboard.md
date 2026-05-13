# Store Screenshot Storyboard

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained storyboard for truthful Chrome Web Store screenshot capture
- `Phase 161` now treats the first archived screenshot set as a historical baseline rather than the final submission pack after the popup/full-page surface-expansion line
- `Phase 296` archived the mixed store-candidate pack after RDP Chrome capture: one native toolbar popup quick-glance image plus full-page/provider/source-depth images
- refresh it when the popup story, provider truth boundary, store positioning, or capture workflow changes materially

Purpose:

- define the minimum truthful screenshot pack for store-facing assets
- keep screenshot order aligned with the popup and full-depth workspace product story
- force screenshot capture to come from real extension-mode runtime, not only from browser preview

## Capture Rules

1. Use `RDP Chrome` with the unpacked extension reloaded from current `dist/`.
2. Capture from the real extension runtime, not from standalone preview, whenever the screenshot is intended for store use.
3. Keep screenshots aligned with Chrome Web Store guidance:
   - actual user experience
   - latest shipped functionality
   - minimal text in the image itself
4. The leading popup quick-glance screenshot intended for final submission should use the native toolbar action bubble.
5. Popup app-window smoke capture is still valuable QA evidence, but it is not the final replacement for the real toolbar bubble.
6. Use full-page, provider-detail, or Settings/source surfaces for depth proof when they tell the store story more clearly than additional popup scroll states.
7. Do not stage unsupported providers or fake healthy states that the runtime cannot currently reproduce honestly.

## Current Candidate Pack

The current user-approved candidate pack is:

1. native toolbar popup quick glance with Codex usage windows and visible badge-compatible status
2. full-page dashboard overview with the product promise and summary cards
3. Codex provider usage detail with visible window percentages and reset timing
4. Cursor source/settings detail that makes the personal partial contract explicit
5. Chrome side-panel provider-detail view triggered through the shipped popup path

The screenshots were reviewed in the chat thread on `2026-05-04`, then captured
from RDP Chrome and archived as
[2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md).

## Screenshot Storyboard Order

### 1. Toolbar-first quick glance

- Surface:
  - native toolbar popup bubble
- Runtime state:
  - healthy or near-healthy visible-provider state
- Claim it proves:
  - one click gives a compact, readable AI usage snapshot
- Must visibly show:
  - popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing

### 2. Dashboard overview

- Surface:
  - full-page shell `Dashboard`
- Runtime state:
  - healthy or near-healthy Codex plus Cursor state
- Claim it proves:
  - one panel collects AI coding quota signals and provider status
- Must visibly show:
  - dashboard headline, product promise, summary cards, and Material 3 release-candidate framing

### 3. Provider usage detail

- Surface:
  - full-page shell `Dashboard` or provider-detail surface
- Runtime state:
  - Codex usage-window detail
- Claim it proves:
  - provider cards expose useful usage-window detail without claiming one absolute balance
- Must visibly show:
  - Codex status, remaining percentages, reset timing, and source/truth chips

### 4. Honest source boundary

- Surface:
  - Settings/source detail
- Runtime state:
  - Cursor personal partial session-page state
- Claim it proves:
  - the extension is honest about partial live paths and does not fake exact remaining requests
- Must visibly show:
  - Cursor source route, personal partial labels, availability summary, and explanatory contract text

### 5. Side-panel provider depth

- Surface:
  - Chrome side panel `Provider detail`
- Runtime state:
  - Codex provider detail opened through the shipped popup path
- Claim it proves:
  - provider review lives in the deeper side-panel workspace instead of a bloated popup
- Must visibly show:
  - side-panel header, provider-detail title, source snapshot, and usage/detail hierarchy

## Optional Sixth Screenshot

- Surface:
  - theme or audit-related workspace only if it directly supports the store story
- Default decision:
  - omit unless it clarifies a real user value without diluting the toolbar-first narrative

## Screenshot-to-Claim Map

| Screenshot | Main store claim |
| --- | --- |
| 1 | Quick glance in one click |
| 2 | One dashboard collects quota and status |
| 3 | Provider usage detail stays precise about its window scope |
| 4 | Source contracts stay honest about partial live paths |
| 5 | Provider depth belongs to the side panel |

## Current Baseline Note

- the first archived screenshot set remains one truthful historical evidence package
- after `Phase 296`, the current recommended screenshot evidence package is [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- after `Phase 299`, the [RC12 upload-candidate milestone](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md) is the handoff for human Chrome Web Store listing upload
- the next store-asset slice should be review-feedback or listing-change follow-up, not another screenshot archive, unless the UI changes again

## Do Not Capture

- preview-only states that are not reproducible in extension mode
- unsupported provider combinations presented as healthy
- popup app-window smoke captures as the final replacement for native toolbar-bubble screenshots
- screenshots whose only story is internal tooling or debug routes
- text-heavy mockups that exceed what the product actually shows

## Related Docs

- [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
- [Direction 10 - Toolbar Competitive Fit And Store Readiness](../Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Archive/benchmarks/Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../Archive/benchmarks/Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
