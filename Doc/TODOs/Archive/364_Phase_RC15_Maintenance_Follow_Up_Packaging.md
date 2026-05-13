# Phase 364 - RC15 Maintenance Follow-Up Packaging

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Package the current post-`rc.14` maintenance source boundary as `0.1.0-rc.15`.

## Scope

- Bump `package.json`, `package-lock.json`, and `src/manifest.json` from `0.1.0-rc.14` / `0.1.0.14` to `0.1.0-rc.15` / `0.1.0.15`.
- Rebuild `dist/` and generate `release/ai-usage-dashboard-0.1.0-rc.15.zip`.
- Add a dated RC15 follow-up milestone.
- Align maintained current docs to make `rc.15` the current packaged follow-up candidate while keeping `rc.13` as the submitted Chrome Web Store review boundary.

## Preserved Boundaries

- No runtime behavior changes.
- No provider support-claim changes.
- No store-review submission claim for RC15.
- Do not mutate the historical RC13 submitted milestone or the historical RC14 follow-up milestone.
- Do not delete historical release artifacts.

## Acceptance

- Package and manifest versions align at `0.1.0-rc.15` and `0.1.0.15`.
- `npm run release:package` creates `release/ai-usage-dashboard-0.1.0-rc.15.zip`.
- Maintained docs point to RC15 as the current packaged follow-up candidate.
- The RC15 milestone records the package hash and states that RC13 remains the submitted review boundary.

## Planned Verification

- `npm run docs:check`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.15.zip`
- `git diff --check`

## Completion Summary

- Bumped `package.json`, `package-lock.json`, and `src/manifest.json` to `0.1.0-rc.15` / `0.1.0.15`.
- Rebuilt `dist/`, generated `release/ai-usage-dashboard-0.1.0-rc.15.zip`, and recorded SHA256 `5ad5b0771c9a33dc6d04d90c02d1c963f04b072a525c4769ee8c36ac783c9e5a`.
- Added the RC15 maintenance follow-up milestone and aligned README, release guide, TODO, roadmap, next-steps, and phase-index docs to make RC15 the current packaged follow-up candidate.
- Preserved RC13 as the submitted Chrome Web Store review boundary and left RC14 as historical follow-up evidence.

## Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.15.zip`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. If Chrome Web Store review feedback requires another package, build on the RC15 boundary and create a fresh submission milestone instead of mutating RC13 history.
