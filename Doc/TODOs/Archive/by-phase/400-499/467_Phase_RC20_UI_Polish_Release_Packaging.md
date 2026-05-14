# Phase 467 - RC20 UI Polish Release Packaging

Status: completed

## Goal

Package the completed Phase 449-466 UI polish source as a new follow-up release candidate without changing the submitted RC13 Chrome Web Store review boundary.

## Scope

- Bump package and manifest versions from `0.1.0-rc.19` / `0.1.0.19` to `0.1.0-rc.20` / `0.1.0.20`.
- Run the release gate for the current source.
- Generate `release/ai-usage-dashboard-0.1.0-rc.20.zip`.
- Add a milestone documenting the RC20 source boundary and verification.
- Update README, top-level TODOs, Roadmap, Product docs, and package references.

## Preserved Boundaries

- Do not mutate the RC13 submitted Chrome Web Store milestone.
- Do not submit to Chrome Web Store in this phase.
- Do not change provider support claims, permissions, locale registry, or source contracts.
- Do not include `tmp/` visual QA screenshots in the release artifact or repo history.

## Acceptance

- `package.json`, `package-lock.json`, and `src/manifest.json` agree on the RC20 version boundary.
- `release/ai-usage-dashboard-0.1.0-rc.20.zip` exists and contains the built extension.
- Current docs identify RC20 as the packaged follow-up candidate and RC13 as the submitted review boundary.
- The prior RC19 artifact remains historical and is not rewritten.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`

## Completed

- Bumped `package.json` and `package-lock.json` to `0.1.0-rc.20`.
- Bumped `src/manifest.json` to Chrome version `0.1.0.20` and display version `0.1.0-rc.20`.
- Ran the full release gate and generated `release/ai-usage-dashboard-0.1.0-rc.20.zip`.
- Recorded SHA256 `0c681b4b120f5a8cd108ec62d532da8089d9fba136256b8aecb1d3597fd023fb`.
- Added the RC20 milestone while preserving RC13 as the submitted Chrome Web Store review boundary.

## Verification Notes

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.20.zip`

## Follow-Up

- If RC20 becomes the chosen resubmission package, open a separate submitted-store milestone rather than editing the RC13 historical milestone.
