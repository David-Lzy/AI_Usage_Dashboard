# Milestone - RC21 Settings Tooltip Form Control Release Candidate

Date: 2026-05-15

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 469`
- this is not a claim that RC21 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.21` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.21.zip`
- SHA256: `edcd6546695b89b70a271919a4531c19053216301affbc951eb98569f4aa4079`

The follow-up source boundary is:

- package version: `0.1.0-rc.21`
- Chrome manifest version: `0.1.0.21`
- Chrome manifest display version: `0.1.0-rc.21`
- current latest archived phase: [469_Phase_RC21_Settings_Tooltip_Form_Control_Closeout_Packaging.md](../TODOs/Archive/by-phase/400-499/469_Phase_RC21_Settings_Tooltip_Form_Control_Closeout_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC20

- `Phase 468`: Settings help tooltips became subtle at rest, render as opaque viewport-positioned surfaces, and avoid Settings card/disclosure clipping.
- `Phase 468`: progress-thickness numeric input width and shared Settings field-label typography were polished for readability.
- `Phase 469`: the Phase 468 source boundary was packaged as RC21 with current docs aligned.

## Promotion Rule

Use RC21 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC21 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.21.zip`

Manual/runtime note:

- `Phase 468` records a built-preview Playwright smoke pass for zh-CN Settings at 420px, including hover tooltip positioning, opaque content, widened progress-thickness input, and readable field-label sizing
- the large sidepanel chunk warning remains the known post-localization build warning recorded in the `Phase 408` chunk-size audit
- RC21 is a package-boundary update for Settings UI polish, not a new provider support promise
