# Phase 298 - RC12 Icon Refresh And Packaging

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

Package `0.1.0-rc.12` so the install/review artifact includes the Phase 297
Codex stale-page freshness reload fix and the supplied trimmed transparent Chrome icon
set.

## Completed Work

- Replaced `public/icons/icon16.png`, `icon32.png`, `icon48.png`, and
  `icon128.png` with the trimmed transparent PNGs from
  `tmp/icon-candidates/ai_usage_dashboard_trimmed_multi_png.zip`.
- Removed the old `public/icons/icon-master.svg` so the package no longer ships
  a stale source icon that does not match the current PNGs.
- Bumped `package.json` and `package-lock.json` from `0.1.0-rc.11` to
  `0.1.0-rc.12`.
- Bumped `src/manifest.json` from `0.1.0.11` / `0.1.0-rc.11` to
  `0.1.0.12` / `0.1.0-rc.12`.
- Rebuilt `dist`.
- Generated `release/ai-usage-dashboard-0.1.0-rc.12.zip`.
- Updated release-facing docs and the phase index.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.12.zip`
- SHA256: `d12c294adda25125731a106efcb99e17904ab50209926e719912f95279c16233`

## Preserved Boundaries

- No provider coverage claim changed.
- No provider parser semantics changed beyond the already completed Phase 297
  Codex page freshness reload behavior.
- The supplied PNG package remains an input under ignored `tmp/`; the shipped
  extension only needs the manifest-sized transparent PNGs.

## Verification

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.12.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.12.zip`

## Follow-Up

Reload the unpacked `dist/` extension in RDP Chrome or install the new `rc.12`
zip for the next review pass.
