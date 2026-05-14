# Milestone - RC19 Post-RC18 UI Polish Closeout Release Candidate

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 448`
- superseded as the current packaged follow-up reference by [2026-05-15_RC20_UI_Polish_Release_Candidate.md](./2026-05-15_RC20_UI_Polish_Release_Candidate.md)
- this is not a claim that RC19 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.19` was the packaged follow-up candidate prepared after `Phase 448`. The current packaged follow-up reference is RC20.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.19.zip`
- SHA256: `2b3237e4acf0d855de394fdbc2c87b8a0ac4475e2cdf2ae46dabfab9256ee0a1`

The follow-up source boundary is:

- package version: `0.1.0-rc.19`
- Chrome manifest version: `0.1.0.19`
- Chrome manifest display version: `0.1.0-rc.19`
- current latest archived phase: [448_Phase_RC19_Post_RC18_UI_Polish_Closeout_Packaging.md](../TODOs/Archive/by-phase/400-499/448_Phase_RC19_Post_RC18_UI_Polish_Closeout_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC18

- `Phase 441`: popup featured-provider status chips moved into the provider title row.
- `Phase 442`: progress appearance settings for global thickness and remaining-color bands.
- `Phase 443`: progress thickness and remaining-percent color bands applied to line, classic circle, soft ring, gauge ring, and preview renderers.
- `Phase 444`: `circle-soft` and `circle-gauge` made visually distinct.
- `Phase 445`: Provider order and Quota items moved to the bottom of expanded Appearance & Sync, with Provider order copy localized across 14 runtime locales.
- `Phase 446`: Settings overview display-level helper made responsive across wide and narrow localized layouts.
- `Phase 447`: Appearance & Sync preference grids made responsive, with long custom select/combobox menus capped and scrollable.

## Promotion Rule

Use RC19 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC19 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.19.zip`
- `npm run docs:check`
- `git diff --check`

Manual runtime note:

- no new human RDP Chrome smoke session is recorded for RC19 in this milestone
- `Phase 441` through `Phase 447` include focused render tests and Playwright preview smoke checks for the changed UI surfaces
- the large sidepanel chunk warning remains the known post-localization build warning recorded in the `Phase 408` chunk-size audit
- RC19 is a package-boundary update for post-RC18 UI polish, not a new provider support promise
