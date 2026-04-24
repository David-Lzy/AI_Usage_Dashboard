# Direction 10.3 - Store Asset Pack And Submission TODOs

Date: 2026-04-24

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- first executable slice landed on `2026-04-24` through `Phase 161`
- second executable slice landed on `2026-04-24` through `Phase 162`
- third executable slice landed on `2026-04-24` through `Phase 163`
- fourth executable slice landed on `2026-04-24` through `Phase 164`
- this child TODO now becomes the next active `Direction 10` line after `Phase 160` refreshed the current popup / sidepanel / full-page runtime evidence
- this child TODO assumes the current first real screenshot archive already exists and focuses on store-ready asset preparation after the surface-expansion workstream landed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)

Depends on:

- [10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md](./10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md)

## Goal

Turn the current storyboard, screenshot workflow, first real archive, and listing-copy pack into one store-ready asset pack plus one submission checklist that can be updated without guessing what the product should promise.

## Detailed TODOs

### A. Screenshot Selection Pack

- select which archived screenshots are still valid after surface-expansion work lands
- identify which screenshots must be recaptured because popup, sidebar, or full-page shell changed materially
- keep one truthful mapping from each chosen screenshot to one concrete runtime state
- `Phase 161` completed this first store-asset slice by shipping:
  - one maintained [Store_Screenshot_Selection_Pack.md](../Store_Screenshot_Selection_Pack.md)
  - one explicit stale-review pass across the first screenshot archive, current storyboard, current listing-copy pack, and current localization source pack
  - one rule that treats popup app-window smoke capture as QA evidence only, not as the final submission replacement for the native toolbar bubble
- current boundary after `Phase 164`:
  - the first archived screenshot set remains truthful historical evidence
  - one refreshed pending request now exists: [2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md)
  - that request is explicitly `manual_capture_required` because popup slots `1` through `3` still need native toolbar-bubble capture while slots `4` and `5` move to the full-page shell
  - one native-toolbar popup probe now exists and confirms the current `RDP Chrome` session does not expose the real popup bubble as a separate capturable X11 top-level window
  - the refreshed request now also ships one generated `capture-plan.json` that marks three manual popup slots and two request-bound full-page-shell slots
  - full-page slots `4` and `5` are now already staged inside the pending request package through the hybrid request-bound runner
  - popup slots `1` through `3` remain manual native-toolbar capture and the request still stays `pending_operator_capture` until those final popup assets are collected

### B. Final Screenshot Ordering

- define one final screenshot order for the listing
- make the order prove:
  - toolbar-first value
  - setup guidance
  - full workspace depth
  - honest provider coverage
- keep one explicit note about which screenshots are popup, sidebar, or full-page shell surfaces

### C. Listing Copy Tightening

- tighten title, short description, overview paragraph, feature bullets, and screenshot captions after the new surface controls land
- keep copy aligned with the first archived screenshot evidence and any refreshed archives
- reject claims that imply unsupported providers or more live quota fidelity than the product actually ships

### D. Submission Checklist

- define one repo-backed checklist for Chrome Web Store submission readiness:
  - screenshots prepared
  - listing copy updated
  - manifest summary aligned
  - icon and branding set reviewed
  - truth boundary reviewed against supported providers
  - store localization source updated if listing copy changed

### E. Localization Handoff Inputs

- define what the store-listing localization source pack needs after screenshot and listing-copy refresh
- keep translated listing work dependent on the updated English source pack rather than ad-hoc text extraction
- identify which screenshot captions may need localization-sensitive reflow checks

## Planned Numbered Slices

1. screenshot selection and stale-archive review after new surfaces land - completed in `Phase 161`
2. refreshed screenshot capture request for store-ready surfaces - completed in `Phase 162`
3. native toolbar popup probe and automation-boundary confirmation - completed in `Phase 163`
4. hybrid request-bound full-page staging for the refreshed pending request - completed in `Phase 164`
5. manual native-toolbar popup capture plus archive completion - next
6. final screenshot ordering and caption contract
7. listing-copy tightening against refreshed archives
8. submission checklist and store-pack closeout

## Out Of Scope

- submitting the listing automatically
- pretending store localization is complete before the English source pack is refreshed
- using preview-only screenshots when extension-mode evidence exists
