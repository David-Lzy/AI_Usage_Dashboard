# Phase 214 - RC3 Packaging And Post-Phase 213 Build

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Create a fresh release candidate package after the post-`rc.2` functional provider and popup-surface work, including the Phase 213 native toolbar popup density fix.

## Why This Phase Exists

The previous release zip, `0.1.0-rc.2`, was created on `2026-04-23`. The source and `dist/` state have since moved through Codex and Cursor personal usage improvements, progress rendering changes, popup appearance preferences, Settings preview, and native toolbar popup density tightening. A new zip is required so install/review uses the current product state instead of the older Phase 42 artifact.

## What Changed

- Bumped `package.json` and `package-lock.json` to `0.1.0-rc.3`.
- Bumped `src/manifest.json` to Chrome numeric version `0.1.0.3` and display `version_name` `0.1.0-rc.3`.
- Rebuilt `dist/` from the current source tree.
- Created `release/ai-usage-dashboard-0.1.0-rc.3.zip`.
- Updated release-facing docs to point at the new package.

## Artifact

- package: `release/ai-usage-dashboard-0.1.0-rc.3.zip`
- SHA256: `4811289e4f47deddce0efbe39ab5e249104d623eff437584df3837e4e2f99882`
- archive contents verified with `unzip -l`

## Verification

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.3.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.3.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Use `0.1.0-rc.3` for the next RDP Chrome install/review pass. The remaining store-submission screenshot line still has the manual native-toolbar popup capture dependency tracked under Direction 10.3.
