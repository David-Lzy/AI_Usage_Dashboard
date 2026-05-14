# Milestone - RC17 Display Preference Follow-Up Release Candidate

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 433`
- this is not a claim that RC17 has already been submitted to Chrome Web Store
- superseded as the current packaged follow-up reference by [2026-05-14_RC18_UI_Polish_Follow_Up_Release_Candidate.md](./2026-05-14_RC18_UI_Polish_Follow_Up_Release_Candidate.md)

## Milestone Summary

`0.1.0-rc.17` was the packaged follow-up candidate prepared after `Phase 433`. The current packaged follow-up reference is RC18.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.17.zip`
- SHA256: `effa7fd1cb61a5573f7c882275042b8245256d52507747bf507faa982d04e9b7`

The follow-up source boundary is:

- package version: `0.1.0-rc.17`
- Chrome manifest version: `0.1.0.17`
- Chrome manifest display version: `0.1.0-rc.17`
- current latest archived phase: [433_Phase_RC17_Display_Preference_Follow_Up_Packaging.md](../TODOs/Archive/by-phase/400-499/433_Phase_RC17_Display_Preference_Follow_Up_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC16

- `Phase 422` through `Phase 424`: shared display preference storage, per-surface provider ordering, and Settings provider-order controls.
- `Phase 425` through `Phase 427`: shared provider progress-item inventory, per-surface quota item visibility/order controls, and unified progress item rendering across popup, dashboard cards, and provider detail.
- `Phase 428` and `Phase 429`: soft and gauge circular progress styles plus localized Settings progress-style options and popup appearance preview.
- `Phase 430` through `Phase 432`: reusable Settings provider carousel, migration of provider-shaped Settings sections, representative Playwright UI QA, and documentation closeout.

## Promotion Rule

Use RC17 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC17 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.17.zip`
- `npm run docs:check`
- `git diff --check`

Manual runtime note:

- no new human RDP Chrome smoke session is recorded for RC17 in this milestone
- Phase 432 recorded representative Playwright UI QA for `en`, `zh-CN`, `de`, and `ar`
- the Phase 432 RDP Chrome capture path opened windows but produced invalid blank captures, so those screenshots were not promoted as visual signoff evidence
- the large sidepanel chunk warning remains the known post-localization build warning recorded in the `Phase 408` chunk-size audit
- RC17 is a package-boundary update for post-RC16 display preferences, progress styling, Settings carousel, and UI QA closeout, not a new provider support promise
