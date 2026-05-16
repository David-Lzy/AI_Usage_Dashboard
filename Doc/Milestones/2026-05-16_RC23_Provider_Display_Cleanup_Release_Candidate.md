# Milestone - RC23 Provider Display Cleanup Release Candidate

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after `Phase 502`
- this is not a claim that RC23 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.23` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.23.zip`
- SHA256: `77f69c57a24ec7056b1013db48e27c4e11f095732dbd1d3775aeaf40c88f78a4`

The follow-up source boundary is:

- package version: `0.1.0-rc.23`
- Chrome manifest version: `0.1.0.23`
- Chrome manifest display version: `0.1.0-rc.23`
- current latest archived phase: [502_Phase_RC23_Provider_Display_Cleanup_Packaging.md](../TODOs/Archive/by-phase/500-599/502_Phase_RC23_Provider_Display_Cleanup_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC22

- `Phase 488` through `Phase 495`: completed public-source and Chrome Web Store handoff docs, AGPL-3.0 publication metadata, build fingerprinting, popup provider-visibility decoupling, public repository readiness docs, six-locale store listing copy, and refreshed public-readiness screenshot evidence.
- `Phase 496`: defined the provider setup/display product contract.
- `Phase 497`: rendered provider source-mode paths in Quick Setup cards.
- `Phase 498`: added shared provider display eligibility.
- `Phase 499`: aligned popup and Provider order rendering with visible + display-eligible providers.
- `Phase 500`: aligned quota item controls with visible + display-eligible providers.
- `Phase 501`: closed the provider setup/display model queue and verified docs/i18n/test coverage.
- `Phase 502`: bumped version metadata, ran the release gate, and packaged RC23.

## Store Upload Handoff

Manual upload artifact:

- `release/ai-usage-dashboard-0.1.0-rc.23.zip`

Upload notes:

- RC13 remains the historical submitted store-review boundary until a human manually replaces it.
- RC23 does not change provider support promises, manifest permissions, Web Store listing claims, raw evidence boundaries, or export/archive schemas.
- RC23 is the candidate to upload if the next submission should include public-source readiness plus provider setup/display cleanup after RC22.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.23.zip`

Release-gate result:

- `npm run release:check` passed.
- `npm run test` passed with `144` test files and `692` tests.
- `npm run build` completed without a Vite >500 KB chunk warning.

Manual/runtime note:

- No Chrome Web Store upload was performed.
- Final Chrome Web Store upload remains a human action.
