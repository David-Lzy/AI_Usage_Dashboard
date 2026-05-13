# Phase 298 - RC12 Icon Refresh And Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the `0.1.0-rc.12` package closeout after the Codex stale-page
  freshness fix and transparent icon refresh

## Package

- package version: `0.1.0-rc.12`
- Chrome manifest version: `0.1.0.12`
- release zip: `release/ai-usage-dashboard-0.1.0-rc.12.zip`
- SHA256: `d12c294adda25125731a106efcb99e17904ab50209926e719912f95279c16233`

## Icon Verification

- `public/icons/icon16.png` is `16x16` RGBA and transparent.
- `public/icons/icon32.png` is `32x32` RGBA and transparent.
- `public/icons/icon48.png` is `48x48` RGBA and transparent.
- `public/icons/icon128.png` is `128x128` RGBA and transparent.
- the packaged zip includes the same four trimmed transparent manifest icons and no stale
  `icon-master.svg`.

## Commands

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.12.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.12.zip`

## Follow-Up

Use RDP Chrome to reload the unpacked `dist/` extension when visually checking
the new toolbar icon and the Phase 297 Codex freshness behavior.
