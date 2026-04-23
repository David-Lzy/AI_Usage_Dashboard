# Phase 17 - Integration QA And Polish

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- make the product coherent after the first provider integrations land

Depends on:

- at least phases 01 to 07
- at least one real provider adapter phase

File scope:

- all affected UI and provider files
- `Doc/testing/`

Tasks:

- verify sorting and severity rules
- verify stale, error, and disconnected states
- verify Material Design consistency across dashboard, detail, and settings
- verify permission flows and empty states
- document the manual test matrix

Done when:

- the extension behaves coherently with mixed provider states
- the UI still looks like one Material-based product
- the test checklist covers the first supported providers

Out of scope:

- adding a new provider

Completion date: 2026-04-20

Completion summary:

- added a shared side-panel view-model layer so provider ordering, permission-aware severity, and summary counts are derived in one place
- polished the dashboard, detail, and settings copy to remove stale phase-specific wording and reflect the current unified provider state
- surfaced host-access gaps directly in provider cards and detail pages instead of hiding that state only inside Settings
- added `Doc/testing/Manual_Test_Checklist.md` as the repeatable manual QA matrix for dashboard, detail, settings, provider-specific checks, and regressions

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual smoke checks:
  - verified `http://127.0.0.1:4173/src/sidepanel/index.html` returns HTTP 200 after preview restart
  - verified stale `Phase 07` and `mock sync` copy no longer exists in `src/`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- none in the current phase plan
