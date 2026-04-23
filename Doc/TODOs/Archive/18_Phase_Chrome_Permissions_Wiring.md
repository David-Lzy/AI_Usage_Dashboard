# Phase 18 - Chrome Permissions Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- replace the host-access preview toggle with real `chrome.permissions` wiring while keeping browser preview usable

Depends on:

- phase 05
- phase 06
- phase 17

File scope:

- `src/manifest.json`
- `src/background/`
- `src/sidepanel/`
- `src/shared/constants.ts`

Tasks:

- add the `permissions` API and optional host origins to the extension manifest
- reconcile stored provider permission state against real extension grants on startup
- route permission toggles through a real request/remove flow in extension mode
- keep preview mode usable with a local-state fallback
- update the settings page copy so it reflects the real wiring

Done when:

- host-access toggles request or remove real optional host permissions in extension mode
- provider permission status rehydrates from the browser grant state on init
- browser preview mode still works without the extension APIs

Out of scope:

- connecting live provider API credentials

Completion date: 2026-04-20

Completion summary:

- added MV3 `permissions` support and optional host origins to the extension manifest for Cursor, JetBrains, Claude, and Codex
- added a dedicated background permission service that reconciles stored provider access against real `chrome.permissions` grants and handles request/remove flows
- updated startup, manual refresh, and alarm paths so provider sync runs against permission state that has already been rehydrated from the browser
- extended provider settings with explicit `hostOrigins` metadata and updated the settings UI so extension mode uses real permission controls while browser preview still simulates local state
- added focused permission tests and refreshed existing adapter tests to match the new provider-setting contract

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual smoke checks:
  - verified `http://127.0.0.1:4173/src/sidepanel/index.html` returns HTTP 200 after preview restart
  - verified the manifest now exposes `permissions` plus `optional_host_permissions`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- move to `Phase 19` for the full unpacked-extension verification pass in real Chrome
