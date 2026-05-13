# Phase 06 - Storage Sample State Message Bus

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- connect the UI to typed local state instead of hardcoded props

Depends on:

- phase 05

File scope:

- `src/shared/storage.ts`
- `src/shared/constants.ts`
- `src/background/message-bus.ts`
- `src/providers/types.ts`
- `src/sidepanel/App.tsx`

Tasks:

- define the storage shape in code
- add helper functions for local storage reads and writes
- add sample seeded state for development
- add a message bus contract between UI and background
- make the dashboard read from stored sample state

Done when:

- the UI no longer depends on inline fake constants
- a refresh request can be sent as a message shape
- storage reads and writes are typed

Out of scope:

- real alarms
- real provider sync

Completion date: 2026-04-20

Completion summary:

- added typed `AppState` storage helpers with seeded sample state for the dashboard
- added a shared app message contract and wired the background service worker to handle app state updates
- moved route state ownership into `App.tsx` so dashboard, settings, and detail views read from stored state instead of inline fixtures
- added a preview-safe app client and storage fallback so the side panel UI can also be inspected through a network-visible Vite preview page
- connected provider refresh, settings updates, visibility toggles, and permission toggles to the shared message bus

Verification:

- unit tests: none added in this phase because the work focused on extension state wiring and Chrome API integration boundaries
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
- preview:
  - command: `/home/davidli/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`
  - URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 07` for real sync orchestration and alarm scheduling
