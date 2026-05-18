# Milestone - RC24 Store Resubmission Candidate

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the `0.1.0-rc.24` package prepared for manual Chrome Web Store resubmission
- this is not a claim that Chrome Web Store upload has already happened

## Milestone Summary

`0.1.0-rc.24` is the current prepared resubmission candidate.

The package is:

- `release/ai-usage-dashboard-0.1.0-rc.24.zip`
- SHA256: `ea5d865c119b69bab46e93f9e29ea04c58ebd7a4b6893a036262b1ebf91a0a85`

The source boundary is:

- package version: `0.1.0-rc.24`
- Chrome manifest version: `0.1.0.24`
- Chrome manifest display version: `0.1.0-rc.24`
- current latest archived phase: [524_Phase_RC24_Store_Handoff_And_Push.md](../TODOs/Archive/by-phase/500-599/524_Phase_RC24_Store_Handoff_And_Push.md)

The currently listed Chrome Web Store page still shows an older public version:

- https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea

## Included Changes Since Current Store Listing

- Public GitHub repository is available under AGPL-3.0-only.
- Runtime UI supports 14 locales; primary store copy is prepared for English, Simplified Chinese, Traditional Chinese, and Japanese.
- Popup, side panel, full-page dashboard, Settings, provider display controls, toolbar badge/icon preferences, and configuration backup have received follow-up polish.
- Public README has been rewritten for ordinary GitHub visitors.
- Store listing copy has a shorter collapsed-view abstract and refreshed provider/data-boundary wording.

## Store Upload Handoff

Manual upload artifact:

- `release/ai-usage-dashboard-0.1.0-rc.24.zip`

Manual handoff doc:

- [Store_RC24_Resubmission_Handoff.md](../Store/Store_RC24_Resubmission_Handoff.md)

## Verification Snapshot

Automated verification for this candidate:

- `npm run release:check` passed.
- `npm run test` passed with `163` test files and `753` tests.
- `npm run build` completed without a Vite >500 KB chunk warning.
- `npm run release:package` generated the zip listed above.
- zip manifest inspection confirmed `version: 0.1.0.24`, `version_name: 0.1.0-rc.24`, `default_locale: en`, stable popup/sidepanel/service-worker entries, 14 `_locales` catalogs, and icon assets.

Manual/runtime note:

- No Chrome Web Store upload was performed by this repository workflow.
- Final Chrome Web Store upload remains a human action.
