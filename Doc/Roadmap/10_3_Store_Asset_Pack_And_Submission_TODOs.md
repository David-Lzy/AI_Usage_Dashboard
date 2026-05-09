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
- fifth executable slice landed on `2026-04-24` through `Phase 165`
- sixth executable slice landed on `2026-04-24` through `Phase 166`
- seventh executable slice landed on `2026-04-24` through `Phase 167`
- eighth executable slice landed on `2026-04-24` through `Phase 168`
- ninth executable slice landed on `2026-04-24` through `Phase 169`
- `Phase 295` accepted a user-reviewed mixed store screenshot candidate pack: one native toolbar popup quick-glance image plus full-page/provider/source-depth images
- `Phase 296` saved those mixed candidate screenshots from RDP Chrome and completed [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- `Phase 298` refreshed the trimmed transparent Chrome extension icon set and packaged it in `0.1.0-rc.12`
- `Phase 299` created the [RC12 Chrome Web Store upload-candidate milestone](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)
- this child TODO now tracks a completed upload-candidate handoff; the next repo work only starts if listing submission, review feedback, or human edits require another package or documentation update
- this child TODO assumes the current first real screenshot archive already exists and focuses on store-ready asset preparation after the surface-expansion workstream landed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)

Depends on:

- [10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md](./10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md)

## Goal

Turn the current storyboard, screenshot workflow, real screenshot archive, icon set, listing-copy pack, and release package into one store-ready upload-candidate handoff that can be updated without guessing what the product should promise.

## Detailed TODOs

### A. Screenshot Selection Pack

- select which archived screenshots are still valid after surface-expansion work lands
- identify which screenshots must be recaptured because popup, sidebar, or full-page shell changed materially
- include the selected popup size/corner/shadow preset in the final native-toolbar popup capture notes
- keep one truthful mapping from each chosen screenshot to one concrete runtime state
- `Phase 161` completed this first store-asset slice by shipping:
  - one maintained [Store_Screenshot_Selection_Pack.md](../Store_Screenshot_Selection_Pack.md)
  - one explicit stale-review pass across the first screenshot archive, current storyboard, current listing-copy pack, and current localization source pack
  - one rule that treats popup app-window smoke capture as QA evidence only, not as the final submission replacement for the native toolbar bubble
- current boundary after `Phase 299`:
  - the first archived screenshot set remains truthful historical evidence
  - one refreshed pending request now exists: [2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md)
  - that request is now fulfilled by [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
  - the first final screenshot remains a native toolbar popup quick-glance capture
  - later screenshots use full-page dashboard, provider-card, Settings/source-detail, and side-panel provider-detail views when they tell the store story more clearly than additional popup scroll states
  - one native-toolbar popup probe now exists and confirms the current `RDP Chrome` session does not expose the real popup bubble as a separate capturable X11 top-level window
  - the refreshed request now also ships one generated `capture-plan.json` that marks three manual popup slots and two request-bound full-page-shell slots
  - full-page slots `4` and `5` are now already staged inside the pending request package through the hybrid request-bound runner
  - the pending request now also ships one dedicated `manual-capture-handoff.md` and `manual-capture-handoff.json` that summarize the remaining manual popup work and current archive-readiness status
  - the pending request now also ships one request-bound `manual-popup-notes-overlay.template.json` plus `manual-popup-capture-checklist.md`
  - the notes-import command now points at that generated template path, and the completion command now defaults to the request package `captures/` directory instead of requiring a separate `--captures-dir` path
  - the pending request now also exposes `manualFinalizeCommand` plus `manualFinalizeWithNotesCommand`, so popup import, readiness validation, and archive completion can run in one repo-backed operator step once real popup files exist
  - current screenshot truth is now `0 pending requests / 2 archived sets`; the refreshed archive has `5/5` reviewed screenshots and `3` explicit truth-boundary notes
  - `0.1.0-rc.12` is the current upload-candidate package and is linked from the milestone handoff

### B. Final Screenshot Ordering

- define one final screenshot order for the listing
- make the order prove:
  - toolbar-first value
  - honest provider coverage
  - dashboard overview
  - provider usage detail
  - source/settings depth
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
5. manual native-toolbar popup handoff plus archive-readiness preflight - completed in `Phase 165`
6. manual native-toolbar popup import workflow and request refresh - completed in `Phase 166`
7. generated popup-notes template plus popup checklist for the remaining manual slots - completed in `Phase 167`
8. request-bound archive completion defaults - completed in `Phase 168`
9. request-bound manual finalize command and handoff update - completed in `Phase 169`
10. final screenshot ordering and caption contract - started in `Phase 295`
11. mixed candidate screenshot file intake plus archive completion - completed in `Phase 296`
12. listing-copy tightening against refreshed archives - completed for the current RC11 archive in `Phase 296`
13. trimmed transparent extension icon refresh - completed in `Phase 298`
14. upload-candidate milestone and store-pack closeout - completed in `Phase 299`
15. review feedback or listing-change follow-up - future only if Chrome Web Store review or human listing edits require another package

## Out Of Scope

- submitting the listing automatically
- pretending store localization is complete before the English source pack is refreshed
- using preview-only screenshots when extension-mode evidence exists
