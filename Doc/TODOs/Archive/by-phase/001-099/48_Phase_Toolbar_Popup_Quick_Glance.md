# Phase 48 - Toolbar Popup Quick Glance

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- add the first real toolbar popup so one click from the Chrome action can show a compact cached quota summary and hand off into the full side panel

Depends on:

- phase 47
- [Direction 03 - Toolbar Popup And Badge Entry](../../../Roadmap/03_Direction_Toolbar_Popup_And_Badge_Entry.md)

File scope:

- `src/popup/`
- `src/background/`
- `src/shared/`
- `src/manifest.json`
- `README.md`
- `Doc/`

Tasks:

- add a popup HTML entry and compact popup app
- reuse the shared app-state and side-panel view-model logic instead of inventing popup-only provider state
- add an explicit handoff from popup into the full side panel

Done when:

- the manifest action opens a popup instead of directly opening the side panel
- the popup shows compact summary state and a clear open-dashboard action
- tests and build checks pass
- preview is restarted on the latest build, including a popup preview URL

Out of scope:

- action badge semantics
- replacing the side panel
- provider-specific popup settings

Completion date: 2026-04-23

Completion summary:

- added the first toolbar popup entry and changed the action from direct side-panel click-through to popup-first quick glance
- reused the shared app-state and side-panel view-model logic so the popup stays on the same product truth as the main dashboard
- added a popup handoff into the full side panel and documented the new entry behavior

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/popup/view-models.test.ts src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm both `http://127.0.0.1:4173/src/sidepanel/index.html` and `http://127.0.0.1:4173/src/popup/index.html`

Follow-up:

- continue `Direction 03` by deciding badge semantics and whether the popup should surface one stronger ambient alert
