# Phase 24 - Codex Workspace Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- replace the current Codex workspace spike with the smallest honest live workspace integration that can be supported in v1

Depends on:

- phase 23
- phase 15
- phase 16

File scope:

- `src/providers/codex/`
- `src/providers/registry.ts`
- `Doc/provider_notes/Codex.md`
- `fixtures/codex/`

Tasks:

- confirm the exact Codex Business or Enterprise workspace surface to support
- wire the real workspace billing or usage source if it is available
- preserve a guarded unsupported state for personal plans and missing workspace access
- verify that no fake remaining-credit numbers are introduced
- update tests, fixtures, and notes from the final supported path

Done when:

- Codex either exposes a real supported live workspace view or a final guarded unsupported-state implementation
- the adapter contract is explicit about what numbers are real and what remains unavailable
- the release docs can state Codex support honestly

Out of scope:

- broad personal-plan support without a defensible official source

Completion date: 2026-04-21

Completion summary:

- replaced the Codex research spike with a real Enterprise analytics client that targets `api.chatgpt.com`
- narrowed the shipped support scope from generic Business / Enterprise workspace assumptions to the defensible Enterprise Analytics API path
- extended provider secret storage and the settings UI so Codex now stores both an analytics API key and workspace ID
- normalized the latest daily analytics rows into an honest warning-state snapshot that exposes real `credits`, `threads`, and `turns` but keeps `remaining` and `total` as `null`
- added a dedicated Codex analytics fixture plus focused tests for the official client, adapter behavior, provider-credential reconciliation, and storage normalization
- fixed the Playwright unpacked-extension smoke script to poll for the extension service worker instead of relying on a racy event wait
- updated the manifest host-permission scope from legacy ChatGPT web origins to `https://api.chatgpt.com/*`

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- smoke checks:
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
  - `npx -y node@22 ./scripts/phase19-smoke.mjs`
- external docs reviewed:
  - `https://developers.openai.com/codex/enterprise/governance`
  - `https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/`
  - `https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-team-plans`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Residual manual item:

- a real Enterprise workspace analytics key and workspace ID are still needed to confirm the exact production response shape and error envelopes

Follow-up:

- move to `Phase 25` for release assets and branding
