# Milestone - RC18 UI Polish Follow-Up Release Candidate

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 440`
- this is not a claim that RC18 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.18` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.18.zip`
- SHA256: `e291870988264b07d23cb8cb3c3bd3bf6a1207fcaed7b93fa5e13f829386dfdb`

The follow-up source boundary is:

- package version: `0.1.0-rc.18`
- Chrome manifest version: `0.1.0.18`
- Chrome manifest display version: `0.1.0-rc.18`
- current latest archived phase: [440_Phase_RC18_UI_Polish_Follow_Up_Packaging.md](../TODOs/Archive/by-phase/400-499/440_Phase_RC18_UI_Polish_Follow_Up_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC17

- `Phase 434`: Settings provider carousel focused-depth layout with one active card, blurred adjacent depth layers, inactive-slide `inert`/`aria-hidden` semantics, and safer indicator spacing.
- `Phase 435`: circular progress ring label and geometry polish, including numeric-only ring centers while preserving full remaining/used aria text.
- `Phase 436`: Settings disclosure chevron open-state animation across provider and advanced details.
- `Phase 437`: Chrome extension error triage for stale Vite dev-server CORS records, with current unpacked extension error records cleared.
- `Phase 438`: 14-locale Settings quota/progress item copy for headings, helper text, empty states, surface labels, chips, item labels, aria labels, move controls, and all-hidden fallback text.
- `Phase 439`: representative UI polish closeout QA for popup, sidebar dashboard, full-page dashboard, German Settings quota controls, Arabic RTL Settings quota controls, ring center labels, carousel depth layout, and RDP Chrome extension error state.

## Promotion Rule

Use RC18 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC18 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.18.zip`
- `npm run docs:check`
- `git diff --check`

Manual runtime note:

- no new human RDP Chrome smoke session is recorded for RC18 in this milestone
- `Phase 439` recorded representative Playwright UI QA for `en`, `zh-CN`, `de`, and `ar`
- `Phase 439` also rechecked the RDP Chrome unpacked extension record and found zero install, manifest, or runtime errors
- the large sidepanel chunk warning remains the known post-localization build warning recorded in the `Phase 408` chunk-size audit
- RC18 is a package-boundary update for post-RC17 UI polish, not a new provider support promise
