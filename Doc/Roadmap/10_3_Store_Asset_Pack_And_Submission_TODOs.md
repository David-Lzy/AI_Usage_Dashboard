# Direction 10.3 - Store Asset Pack And Submission TODOs

Date: 2026-04-24

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- no executable phase has started yet
- this child TODO assumes the current first real screenshot archive already exists and focuses on store-ready asset preparation after the next surface-expansion workstream lands

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

1. screenshot selection and stale-archive review after new surfaces land
2. refreshed screenshot capture request for store-ready surfaces
3. final screenshot ordering and caption contract
4. listing-copy tightening against refreshed archives
5. submission checklist and store-pack closeout

## Out Of Scope

- submitting the listing automatically
- pretending store localization is complete before the English source pack is refreshed
- using preview-only screenshots when extension-mode evidence exists
