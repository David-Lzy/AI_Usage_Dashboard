# Phase 21 - JetBrains Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- move JetBrains from page-shape fixture normalization into a real supported live path

Depends on:

- phase 20
- phase 10
- phase 11

File scope:

- `src/providers/jetbrains/`
- `src/providers/registry.ts`
- `Doc/provider_notes/JetBrains.md`
- `fixtures/jetbrains/`

Tasks:

- confirm the exact live JetBrains Console or account page path to support in v1
- wire the real page parse or other supported source behind the permission flow
- harden selector failure handling and logged-out detection
- verify normalized credit totals, remaining values, and warning reasons against live data
- refresh tests and fixtures from the final supported page shape

Done when:

- JetBrains live data can populate the dashboard for the supported page flow
- selector drift and missing-session states produce explicit errors
- tests cover the real parsing contract

Out of scope:

- unsupported JetBrains account types outside the chosen v1 flow

Completion date: 2026-04-20

Completion summary:

- replaced the runtime JetBrains fixture client with a live page-capture path that reads the currently open JetBrains Console `Users and licensing` page through `chrome.tabs` and `chrome.scripting`
- added DOM-based page identity checks so the adapter only accepts a page that actually matches the documented `Users and licensing` anchors
- added explicit error handling for the three main live-failure cases: no JetBrains page open, logged-out JetBrains session, and non-matching page shape
- kept the existing parser contract and normalized mapping, but now fed it from live captured HTML instead of fixture HTML at runtime
- added focused tests for the live client and updated adapter tests so JetBrains no longer silently falls back to fixture numbers in runtime mode

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- smoke checks:
  - Playwright preview smoke: dashboard load -> settings route -> Cursor credential card render
- residual manual item:
  - a real logged-in JetBrains Console `Users and licensing` tab is still required to validate the live DOM against the current production page

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- move to `Phase 22` for Claude live wiring
