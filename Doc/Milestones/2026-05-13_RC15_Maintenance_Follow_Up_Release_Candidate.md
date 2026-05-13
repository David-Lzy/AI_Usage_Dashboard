# Milestone - RC15 Maintenance Follow-Up Release Candidate

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged maintenance follow-up candidate prepared after RC14
- this is not a claim that RC15 has already been submitted to Chrome Web Store
- superseded as the current packaged follow-up reference by [2026-05-14_RC16_Post_Localization_Closeout_Release_Candidate.md](./2026-05-14_RC16_Post_Localization_Closeout_Release_Candidate.md)

## Milestone Summary

`0.1.0-rc.15` was the packaged follow-up candidate prepared on 2026-05-13. The current packaged follow-up reference is RC16.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.15.zip`
- SHA256: `5ad5b0771c9a33dc6d04d90c02d1c963f04b072a525c4769ee8c36ac783c9e5a`

The follow-up source boundary is:

- package version: `0.1.0-rc.15`
- Chrome manifest version: `0.1.0.15`
- Chrome manifest display version: `0.1.0-rc.15`
- current latest archived phase: [364_Phase_RC15_Maintenance_Follow_Up_Packaging.md](../TODOs/Archive/by-phase/300-399/364_Phase_RC15_Maintenance_Follow_Up_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC14

- Phase 307-308: Chrome plus the official Playwright Extension bridge became the default local automation path and a real Chrome helper smoke pass was recorded for the RC14 surfaces.
- Phase 309-333 and Phase 348-356: Quick Setup, cached-first guards, popup route/action/view-model guards, and popup component splits were completed without changing provider support claims.
- Phase 334-347 and Phase 339-344: interaction-audit and theme-recovery operator surfaces were split into smaller components while preserving route-owned state and export behavior.
- Phase 357-358: Settings source-card and Quick Setup view-model logic moved into focused modules while preserving compatibility exports.
- Phase 359-363: page-session tab priority, tab lifecycle, script capture, network observer, and candidate-tab selection moved into focused helpers with tests while preserving capture semantics.

## Promotion Rule

Use RC15 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC15 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.15.zip`
- `npm run docs:check`
- `git diff --check`

Manual runtime note:

- no new human RDP Chrome smoke session is recorded for RC15 in this milestone
- the latest recorded extension UI smoke remains the RC14 Chrome helper pass from Phase 308
- RC15 is a package-boundary update for post-RC14 maintenance, not a new provider support promise
