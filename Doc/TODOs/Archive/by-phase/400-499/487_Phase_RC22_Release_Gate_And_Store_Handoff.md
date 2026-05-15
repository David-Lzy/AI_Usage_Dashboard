# Phase 487 - RC22 Release Gate And Store Handoff

Date: 2026-05-15

Status: completed

## Goal

Cut `0.1.0-rc.22` / manifest `0.1.0.22` as the next Chrome Web Store follow-up candidate after the pre-store maintenance pass.

## Scope

- Bump `package.json` and `package-lock.json` to `0.1.0-rc.22`.
- Bump `src/manifest.json` to Chrome manifest version `0.1.0.22` and display version `0.1.0-rc.22`.
- Run the full release gate.
- Create `release/ai-usage-dashboard-0.1.0-rc.22.zip`.
- Record the RC22 milestone, version boundary, SHA256, and manual store-upload handoff.

## Preserved Boundaries

- No provider support promise, manifest permission, source-truth contract, raw evidence boundary, export/archive schema, or Web Store listing claim changes.
- No automatic Chrome Web Store upload.
- RC13 remains the submitted review boundary until a human explicitly replaces it with a new upload.

## Release Artifact

- package: `release/ai-usage-dashboard-0.1.0-rc.22.zip`
- SHA256: `444440c732880c4c05ab5a3c73c5d488447447c1fb2a539a00c5253b8af30104`
- package version: `0.1.0-rc.22`
- Chrome manifest version: `0.1.0.22`
- Chrome manifest display version: `0.1.0-rc.22`

## Acceptance

- `npm run release:check` passes.
- `npm run release:package` creates the RC22 zip.
- The RC22 milestone and current package docs point to the new artifact and preserve the RC13 submitted boundary.
- Store handoff notes identify the artifact, hash, version, and upload boundary.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.22.zip`
- `npm run docs:check`
- `git diff --check`

## Completed Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.22.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the user decides to resubmit, manually upload `release/ai-usage-dashboard-0.1.0-rc.22.zip` to Chrome Web Store and create a new submitted-review milestone instead of mutating RC13 history.
