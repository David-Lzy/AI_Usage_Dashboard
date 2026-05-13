# Phase 01 - Project Baseline

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- create the minimal runnable Chrome extension project skeleton

Depends on:

- none

File scope:

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/manifest.json`
- `src/sidepanel/index.html`
- `src/sidepanel/main.tsx`
- `src/background/service-worker.ts`

Tasks:

- scaffold the Vite + React + TypeScript workspace
- add a minimal MV3 manifest
- add a side panel entry file
- add a background service worker stub
- make the build output compatible with unpacked extension loading

Done when:

- the extension can be loaded as an unpacked MV3 extension
- the side panel opens
- the service worker is registered

Out of scope:

- real provider logic
- final UI styling
- storage and sync behavior

Completion date: 2026-04-20

Completion summary:

- scaffolded a runnable MV3 Chrome extension baseline with `React + TypeScript + Vite`
- added a side panel entry and a background service worker stub
- added extension build configuration using the CRX Vite plugin
- added Node runtime metadata through `package.json` engines and `.nvmrc`
- added `.gitignore` for baseline project hygiene

Verification:

- unit tests: none in this phase
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual checks:
  - verified `dist/manifest.json` points to a built side panel path and service worker loader
  - verified build output contains `manifest.json`, `service-worker-loader.js`, and side panel assets

Follow-up:

- move into `Phase 02` for Material Design 3 theme foundation
