# Milestone - RC20 UI Polish Release Candidate

Date: 2026-05-15

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 467`
- this is not a claim that RC20 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.20` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.20.zip`
- SHA256: `0c681b4b120f5a8cd108ec62d532da8089d9fba136256b8aecb1d3597fd023fb`

The follow-up source boundary is:

- package version: `0.1.0-rc.20`
- Chrome manifest version: `0.1.0.20`
- Chrome manifest display version: `0.1.0-rc.20`
- current latest archived phase: [467_Phase_RC20_UI_Polish_Release_Packaging.md](../TODOs/Archive/by-phase/400-499/467_Phase_RC20_UI_Polish_Release_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC19

- `Phase 449`: remaining-color-band row alignment, display-level helper alignment, soft-ring percent rendering, and provider-carousel motion.
- `Phase 450`: select open-ring clipping, soft/gauge SVG ring dash rendering, and compact remaining-color-band controls.
- `Phase 451`: soft ring conic-gradient rendering so non-100 green values show a visible neutral gap.
- `Phase 452`: Settings provider-carousel controls restored by preventing drag capture on interactive descendants.
- `Phase 453`: halo and slim foreground layers added to the soft ring.
- `Phase 454` through `Phase 457`: Settings bottom disclosures split into UI controls and Provider display controls; accent and progress color dropdowns unified with 14-locale copy.
- `Phase 458`: remaining-color-band color dropdowns show one visible localized value or custom hex label.
- `Phase 459`: application language and theme mode promoted into Settings overview.
- `Phase 460`: all providers moved into the Quick Setup carousel; separate "More Provider" disclosure removed.
- `Phase 461`: Settings provider-carousel motion stabilized.
- `Phase 462`: popup refresh moved into the title row; popup Settings action added.
- `Phase 463`: popup circular progress row-count preference added.
- `Phase 464`: Settings form-control typography and progress appearance controls tightened.
- Post-`Phase 464` polish: helper explanations moved into Material-style hover/focus tooltips, remaining-color-band grids tightened, and UI disclosure labels renamed across 14 locales.
- `Phase 465`: safe local UI font-family preference added with Settings UI, storage normalization, root Material typography-variable sync, and 14-locale labels/helper copy.
- `Phase 466`: UI polish closeout completed with Playwright built-preview checks, sequential RDP Chrome extension-window captures, and current-doc alignment.

## Promotion Rule

Use RC20 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC20 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.20.zip`

Manual/runtime note:

- `Phase 466` records Playwright built-preview checks for `en`, `zh-CN`, `de`, `ar`, and `hi`
- `Phase 466` records sequential RDP Chrome extension-window captures for popup, full-page Settings, Chinese Quick Setup, and Arabic full-page Settings
- the large sidepanel chunk warning remains the known post-localization build warning recorded in the `Phase 408` chunk-size audit
- RC20 is a package-boundary update for UI polish, not a new provider support promise
