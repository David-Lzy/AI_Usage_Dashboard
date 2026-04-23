# Phase 131 - Extension Build Output Stability And Git Closeout Rule

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Reduce one recurring extension-mode failure mode in the RDP Chrome workflow and tighten project closeout discipline:

- make unpacked extension build output more stable across rebuilds
- document that RDP Chrome is a first-class extension-mode validation surface
- require post-closeout `commit / push / rebuild` behavior in the project guardrails

## What Shipped

- one stable build-output naming rule for:
  - popup entry JS
  - side-panel entry JS
  - service-worker JS
  - shared popup plus side-panel chunks
  - main shared CSS
- one repeatable build-output stability review script
- one explicit RDP Chrome unpacked-extension rule in the development guardrails
- one explicit git closeout rule in the development guardrails for:
  - stage relevant changes
  - commit
  - push
  - rebuild `dist/`

## Files

- `vite.config.ts`
- `scripts/phase131-build-output-stability-review.mjs`
- `package.json`
- `Doc/Development_Guardrails.md`
- `Doc/TODOs/00_Phase_Index.md`
- `Doc/AI_Usage_Dashboard_TODOs.md`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase130:review
npm run phase131:review
git diff --check
git status --short
git push origin main
```

Key truthful results:

- popup and side-panel build outputs now reference stable asset names instead of content-hashed entry filenames
- `service-worker-loader.js` now also points at one stable service-worker asset path
- this does not remove the need to reload unpacked extensions in Chrome after a build, but it reduces one common blank-page failure mode where an older unpacked package still points at deleted hashed assets
- the project guardrails now also require a commit, push, and fresh rebuild after each completed documentation-backed closeout unless the user explicitly pauses that workflow

## Not Claimed

- that Chrome will hot-reload unpacked extension state automatically
- that every blank extension page is now impossible
- that this replaces real extension reloads in `chrome://extensions`
