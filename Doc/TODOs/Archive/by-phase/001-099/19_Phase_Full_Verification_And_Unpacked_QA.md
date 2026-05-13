# Phase 19 - Full Verification And Unpacked QA

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- verify that the extension still works end to end after `Phase 18` lands

Depends on:

- phase 18

File scope:

- `src/`
- `Doc/testing/`
- `dist/`

Tasks:

- run `tsc`, `vitest`, and `vite build`
- load the unpacked extension from `dist/`
- verify side panel boot, settings, dashboard, and detail routes in Chrome
- verify host-permission toggles in real extension mode and in browser preview mode
- update the manual test checklist if actual behavior differs from the planned flow

Done when:

- the project compiles, tests, and builds cleanly
- the unpacked extension works in Chrome without blocking errors
- the manual checklist matches the real verification flow

Out of scope:

- new provider logic

Completion date: 2026-04-20

Completion summary:

- added Playwright as a dev dependency and downloaded a local Chromium runtime so unpacked-extension checks can run in a repeatable way on this machine
- added `scripts/phase19-smoke.mjs` to verify the preview build and the unpacked extension flow against the built `dist/` output
- verified dashboard boot, settings navigation, provider detail navigation, preview-mode permission simulation, and extension-mode `chrome.permissions` availability
- updated the manual test checklist so the Phase 19 smoke script is part of the regression checklist

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./scripts/phase19-smoke.mjs`
- smoke scope:
  - preview mode: dashboard -> settings -> simulated permission toggle -> detail route
  - unpacked extension mode: service worker boot, side panel page load, settings route, permission-control rendering, `chrome.permissions` API presence, detail route
- residual manual item:
  - native browser permission prompt acceptance remains a real-Chrome manual check and stays on the checklist for later real-device verification

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`

Follow-up:

- move to `Phase 20` for Cursor live wiring
