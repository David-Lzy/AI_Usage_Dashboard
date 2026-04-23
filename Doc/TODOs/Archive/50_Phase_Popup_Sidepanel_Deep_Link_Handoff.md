# Phase 50 - Popup Sidepanel Deep-Link Handoff

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- let the toolbar popup hand off into concrete side-panel routes such as provider detail instead of only opening the dashboard root

Depends on:

- phase 49
- [Direction 03 - Toolbar Popup And Badge Entry](../Roadmap/03_Direction_Toolbar_Popup_And_Badge_Entry.md)

File scope:

- `src/popup/`
- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- formalize hash-based side-panel routes for dashboard, settings, and provider detail
- make popup featured providers open the matching side-panel detail route
- keep preview fallback working with route-specific URLs

Done when:

- the side panel can restore dashboard, settings, and provider-detail routes from hash
- popup provider actions can deep-link into the matching side-panel detail route
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- replacing the popup summary content
- store-submission assets or copy

Completion date: 2026-04-23

Completion summary:

- formalized hash-based side-panel routes for dashboard, settings, and provider detail
- added popup provider actions that can hand off directly into the matching side-panel detail route
- kept preview fallback working with route-specific side-panel URLs so deep links remain testable outside extension mode

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/route-state.test.ts src/popup/view-models.test.ts src/sidepanel/view-models.test.ts`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the popup and side-panel preview URLs still respond, including route-specific side-panel URLs

Follow-up:

- decide whether the next `Direction 03` slice should add settings deep-link handoff from the popup or stop at the current provider-detail handoff
