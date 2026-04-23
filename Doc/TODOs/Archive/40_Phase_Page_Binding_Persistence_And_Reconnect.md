# Phase 40 - Page Binding Persistence And Reconnect

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- make session-page providers durable across refresh, tab closure, route drift, and browser relaunch

Depends on:

- phase 39

File scope:

- `src/providers/page-session.ts`
- `src/background/`
- `src/shared/`
- `src/sidepanel/`
- `Doc/testing/`

Tasks:

- persist safe page-binding metadata or route fingerprints for session-page providers
- reconnect to matching tabs on launch before falling back to `open page required`
- detect tab closure, navigation drift, and logged-out transitions cleanly
- add disconnect or rebind actions where needed in settings
- add tests for reconnect and stale-binding behavior

Done when:

- session-page providers can survive normal browser churn without confusing source state
- reconnect behavior is testable and documented
- the product distinguishes between a missing page, a logged-out page, and a stale binding

Out of scope:

- version bump or packaging
- new provider research

Completion date: 2026-04-22

Completion summary:

- added persisted `pageBinding` state to provider settings and normalized it through storage so legacy state upgrades cleanly
- upgraded the shared page-session engine to record missing bound tabs, prefer previously matched routes during reconnect, and fall back from stale bound tabs to live auto discovery
- wired `Codex`, `Cursor`, and `JetBrains AI` session-page paths so sync can update saved binding metadata after matches, logged-out states, and open-page failures
- exposed binding status, mode, detail, and disconnect/rebind actions in Settings and provider detail so stale bindings are visible instead of looking like generic parser failures
- updated sync flow to let adapters persist provider-setting changes alongside normalized snapshots without writing storage side effects inside the adapters

Verification:

- `PATH=$HOME/.local/node-current/bin:$PATH npm run typecheck`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run test`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run build`
- `PATH=$HOME/.local/node-current/bin:$PATH node ./scripts/phase19-smoke.mjs`
- restart the preview service and confirm both preview URLs return HTTP 200

Follow-up:

- phase 41 should verify the new reconnect rules in real Chrome across `Codex personal`, `Cursor personal`, and `JetBrains AI` page-session flows before the next RC is packaged
