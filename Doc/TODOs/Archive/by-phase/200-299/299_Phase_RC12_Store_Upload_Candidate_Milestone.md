# Phase 299 - RC12 Store Upload Candidate Milestone

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Create one explicit upload-candidate milestone for `0.1.0-rc.12` so code, package,
release docs, screenshot evidence, icon evidence, and current provider support
boundaries all point at the same Chrome Web Store handoff state.

## Completed Work

- Added [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](../../../../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md).
- Kept `release/ai-usage-dashboard-0.1.0-rc.12.zip` as the current upload-candidate package.
- Recorded the package SHA256 as `d12c294adda25125731a106efcb99e17904ab50209926e719912f95279c16233`.
- Aligned roadmap, TODO, release-guide, and README references around the `rc.12` upload-candidate boundary.
- Corrected the Phase 298 icon-source wording from the earlier transparent icon zip to the final trimmed transparent icon zip.

## Artifact Boundary

- package version: `0.1.0-rc.12`
- Chrome manifest version: `0.1.0.12`
- release zip: `release/ai-usage-dashboard-0.1.0-rc.12.zip`
- milestone doc: [2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md](../../../../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md)

## Preserved Boundaries

- No runtime code changed in this phase.
- No provider data model changed in this phase.
- No provider support claim changed in this phase.
- JetBrains, Claude personal, and Gemini live usage graduation remain account or product-decision gated.
- Chrome Web Store submission remains a human-owned action outside the repo.

## Verification

- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.12.zip`

## Follow-Up

Use the milestone doc as the store-upload handoff. If Chrome Web Store review or
human listing edits require another code, icon, or copy change, cut a later RC
instead of mutating the `rc.12` boundary silently.
