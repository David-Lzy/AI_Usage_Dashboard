# Milestone - RC22 Pre-Store Maintenance Release Candidate

Date: 2026-05-15

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 487`
- this is not a claim that RC22 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.22` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.22.zip`
- SHA256: `444440c732880c4c05ab5a3c73c5d488447447c1fb2a539a00c5253b8af30104`

The follow-up source boundary is:

- package version: `0.1.0-rc.22`
- Chrome manifest version: `0.1.0.22`
- Chrome manifest display version: `0.1.0-rc.22`
- current latest archived phase: [487_Phase_RC22_Release_Gate_And_Store_Handoff.md](../TODOs/Archive/by-phase/400-499/487_Phase_RC22_Release_Gate_And_Store_Handoff.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC21

- `Phase 470` and `Phase 471`: popup/sidebar/full-page Settings and surface-switch handoffs were aligned.
- `Phase 472` through `Phase 481`: Settings and popup UI polish covered remaining-color-band layout, toolbar icon preferences, configuration backup and Chrome Sync, action-badge rotation, Provider display Settings promotion, compact action-badge controls, Provider quota-item disclosure, and balanced Settings grids.
- `Phase 482`: documented the pre-store maintenance audit and release-safe cleanup boundaries.
- `Phase 483`: removed stale Settings helper CSS.
- `Phase 484`: consolidated repeated Settings form label/accessory JSX into `FormFieldLabel`.
- `Phase 485`: lazy-loaded special/debug sidepanel routes and replaced runtime copy aggregator imports with focused copy-module imports, reducing `dist/assets/sidepanel.js` from about 861.8 KB to 429.2 KB and eliminating the previous Vite >500 KB chunk warning.
- `Phase 486`: consolidated duplicate Settings form/source-card CSS rules.
- `Phase 487`: bumped version metadata, ran the full release gate, and packaged RC22.

## Store Upload Handoff

Manual upload artifact:

- `release/ai-usage-dashboard-0.1.0-rc.22.zip`

Upload notes:

- RC13 remains the historical submitted store-review boundary until a human manually replaces it.
- RC22 does not change provider support promises, manifest permissions, Web Store listing claims, raw evidence boundaries, or export/archive schemas.
- RC22 is the candidate to upload if the next submission should include post-RC21 UI polish, configuration backup/Chrome Sync, toolbar badge/icon preferences, bundle split, and maintenance cleanup.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.22.zip`

Release-gate result:

- `npm run release:check` passed after updating the special-route lazy-loading test expectation.
- `npm run test` passed with `144` test files and `687` tests.
- `npm run build` completed without the previous >500 KB chunk warning.

Manual/runtime note:

- No new manual RDP Chrome store-upload action was performed.
- Final Chrome Web Store upload remains a human action.
