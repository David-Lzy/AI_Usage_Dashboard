# Phase 469 - RC21 Settings Tooltip Form Control Closeout Packaging

Status: completed

## Goal

Package the Phase 468 Settings tooltip and form-control polish source boundary as the next follow-up release candidate.

## Scope

- Bump `package.json` and `package-lock.json` to `0.1.0-rc.21`.
- Bump the Chrome manifest to `version: 0.1.0.21` and `version_name: 0.1.0-rc.21`.
- Run the full release gate and generate `release/ai-usage-dashboard-0.1.0-rc.21.zip`.
- Record the RC21 SHA256 and align current README, TODO, Roadmap, Product, milestone, and phase-index docs.

## Preserved Boundaries

- Do not change provider support scope, source parsing, credentials, permissions, localization catalogs, runtime behavior, or UI implementation in this phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.
- Treat RC20 as historical evidence after RC21 is packaged.

## Acceptance

- `package.json`, `package-lock.json`, `src/manifest.json`, and built `dist/manifest.json` agree on `0.1.0-rc.21` / `0.1.0.21`.
- `release/ai-usage-dashboard-0.1.0-rc.21.zip` exists and contains the built manifest, popup entry, sidepanel entry, and icon set.
- Current docs identify RC21 as the packaged follow-up candidate and say no numbered phase is queued after Phase 469.
- RC13 remains documented as the submitted Chrome Web Store review boundary.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.21.zip`
- `npm run docs:check`
- `git diff --check`

## Completed

- Bumped package and manifest versions to `0.1.0-rc.21` / `0.1.0.21`.
- Ran the full release gate successfully.
- Generated `release/ai-usage-dashboard-0.1.0-rc.21.zip`.
- Recorded SHA256 `edcd6546695b89b70a271919a4531c19053216301affbc951eb98569f4aa4079`.
- Added the RC21 milestone and aligned current documentation.

## Verification Notes

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.21.zip`

## Follow-Up

- If Chrome Web Store review feedback or a human resubmission decision arrives, use the RC21 milestone as the current packaged-source reference and cut a separate submission handoff rather than rewriting RC13 history.
