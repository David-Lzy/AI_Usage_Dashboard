# Phase 07 - Sync Engine And Alarms

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- build the background sync skeleton and scheduled refresh behavior

Depends on:

- phase 06

File scope:

- `src/background/service-worker.ts`
- `src/background/alarms.ts`
- `src/background/sync-engine.ts`
- `src/providers/registry.ts`

Tasks:

- register a periodic alarm
- implement a sync engine interface
- handle manual refresh messages
- update storage with mock sync results
- mark stale data when the cache is too old

Done when:

- manual refresh updates stored sample provider data
- alarms trigger the sync engine
- stale and error states can be simulated end to end

Out of scope:

- real provider integration

Completion date: 2026-04-20

Completion summary:

- added a background alarm helper and registered a periodic MV3 sync alarm
- added a mock provider registry so manual and scheduled sync paths share deterministic provider-specific behavior
- added a sync engine that updates stored provider snapshots and marks cached data as stale when refresh windows are missed
- routed manual refresh messages through the sync engine instead of directly mutating timestamps
- updated the side panel copy so the preview now reflects the Phase 07 sync-engine milestone

Verification:

- unit tests: none added in this phase because the work focused on Chrome background orchestration and mock provider sync wiring
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
- manual checks:
  - preview server restarted on a LAN-visible host for browser inspection

Preview:

- command: `/home/davidli/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`
- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 08` for Cursor-specific research and source selection
