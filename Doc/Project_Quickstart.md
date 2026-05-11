# Project Quickstart

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the recommended orientation entry point for a new contributor or for returning to the project after a long break
- refresh it whenever the doc tree, source layout, or phase conventions change in a way that affects orientation

## What This Project Is

AI Usage Dashboard is a Chrome MV3 browser extension that tracks AI tool quota and usage across Cursor, Codex, Claude Code, and Gemini Code Assist. It reads usage data from provider-specific Admin APIs and personal session pages (for providers that expose them), normalizes the data, and surfaces it in a side panel, a toolbar popup, and a full-page view.

Current release candidate: `0.1.0-rc.12` — the Chrome Web Store upload candidate as of 2026-05-04.

## Where To Start Reading

Read these documents in order. Each one is short. Together they give you enough context to work on any part of the project without guessing at conventions.

### 1. Process Rules And Conventions

[Doc/Development_Guardrails.md](./Development_Guardrails.md)

- document class vocabulary (`closed evidence`, `living strategy`, `generated operational ledger`, `maintained reference`)
- freshness label vocabulary (`maintained current reference`, `dated snapshot`, `historical design baseline`)
- phase completion rules: verify → doc → archive
- git closeout rule: stage → commit → push → rebuild

This is the single source of truth for how work is done. Read it before writing any doc or proposing any change.

### 2. Current Execution State

[Doc/AI_Usage_Dashboard_TODOs.md](./AI_Usage_Dashboard_TODOs.md)

- section `2.1 Current Execution Queue`: the active `P0 / P1 / P2` priority list
- phase history summary: a one-line description of every completed phase in order
- provider support boundaries: what each provider currently exposes and what it does not

### 3. Strategic Priorities

[Doc/Roadmap/00_Strategic_Directions_Index.md](./Roadmap/00_Strategic_Directions_Index.md)

- the priority-ordered list of active directions with brief `Why now` rationale
- completed directions at the bottom
- child TODO files linked from each direction for detailed backlog

### 4. Phase Queue

[Doc/TODOs/00_Phase_Index.md](./TODOs/00_Phase_Index.md)

- `active phase file: none` or the current active phase when one is running
- `latest completed slice`: the last archived phase
- archive list of all completed phases in order

## Tech Stack

| Layer | Tech |
|---|---|
| Extension runtime | Chrome MV3 (`manifest.json` in `src/`) |
| UI | TypeScript + React 18 |
| Build | Vite (via `./scripts/with-preferred-node.sh vite`) |
| CSS | Plain CSS modules with Material Design 3 token foundation |
| i18n | Chrome `_locales/` + shared `src/shared/i18n.ts` runtime helper |
| Tests | Vitest (`npm run test`) |
| Type checking | `tsc --noEmit` (`npm run typecheck`) |

## Source Layout

```
src/
  background/       MV3 service worker — sync engine, alarms, message bus
  popup/            Toolbar action popup (compact quick-glance surface)
  sidepanel/        Main side panel — dashboard, settings, provider detail,
                    interaction-audit workspace, theme-recovery workspace
  providers/        Provider adapter types and implementations
  shared/           i18n helpers, theme utilities, localized-copy modules,
                    settings preferences, provider diagnostic presentation
  manifest.json     Chrome MV3 manifest (source of truth for version)

public/
  icons/            Extension icon set: 16/32/48/128 px transparent PNGs

_locales/
  en/               English message strings
  zh_CN/            Simplified Chinese message strings
```

Key entry files:
- `src/sidepanel/App.tsx` → split into `special-route-app.tsx` and `standard-route-app.tsx`
- `src/popup/Popup.tsx` → toolbar popup root
- `src/background/service-worker.ts` → sync engine root

## Common Commands

```sh
# Dev server (hot-reload preview at http://127.0.0.1:5173)
npm run dev

# Build dist/ for unpacked extension loading
npm run build

# Preview built dist/ at http://127.0.0.1:4173
npm run preview:dist

# Type check + unit tests + build (full release gate)
npm run release:check

# Package release zip
npm run release:package

# Documentation taxonomy consistency check
npm run docs:check

# Run unit tests only
npm run test
```

## Loading The Extension In Chrome (Unpacked)

1. Run `npm run build` to produce `dist/`.
2. Open `chrome://extensions` and enable Developer Mode.
3. Click **Load unpacked** and select the `dist/` folder.
4. The extension icon appears in the toolbar.

On RDP display `:10` (1920×1080), always run `npm run build` before reloading the extension so the loaded dist reflects the latest source.

## Operator Workspaces

Two special review routes are embedded in the side panel and are only reachable via query-string URLs:

- **Interaction audit** (`?route=interaction-audit`) — multi-surface visual signoff workspace for Direction 04
- **Theme recovery** (`?themeRecoveryRequestId=...`) — recovered-state theme review workspace for Direction 05

Both have repo-backed request/archive lifecycles. Scripts for these workspaces are in `package.json` under the `interaction-audit:*` and `theme-recovery:*` prefixes.

## Documentation Tree Map

```
Doc/
  Development_Guardrails.md     ← process rules (start here)
  AI_Usage_Dashboard_TODOs.md   ← current execution queue + phase history
  Project_Quickstart.md         ← this file
  Next_Steps_Post_Operator_Closures.md  ← what to do next (2026-05-11 snapshot)
  Roadmap/
    00_Strategic_Directions_Index.md    ← priority-ordered direction list
    NN_Direction_*.md                   ← direction strategy doc
    NN_N_*_TODOs.md                     ← child TODO for a direction sub-track
  TODOs/
    00_Phase_Index.md                   ← phase queue and archive pointer
    Archive/
      NNN_Phase_*.md                    ← completed phase docs
  Milestones/
    *_RC*_*.md                          ← dated release-candidate milestone snapshots
  testing/
    operator_review_requests/           ← pending + fulfilled interaction-audit requests
    operator_reviews/                   ← archived interaction-audit review exports
    theme_recovery_review_requests/     ← pending + fulfilled theme-recovery requests
    theme_recovery_reviews/             ← archived theme-recovery review exports
    store_screenshot_archives/          ← archived store screenshot capture sets
  provider_notes/
    *_Notes.md                          ← per-provider research and support-boundary notes
```

## Provider Support Boundaries (Current RC12)

| Provider | Source | What Is Exposed |
|---|---|---|
| Cursor | Team Admin API or personal session page | Team API: full usage; Personal: billing-period context only, no exact remaining included requests |
| Codex | Enterprise Analytics API or personal session page | Enterprise API: full; Personal: usage-window percentages, reset times, no absolute remaining balance |
| Claude Code | Admin Analytics API or Team session page | Team session page: current session + all-models progress, no personal Pro/Max support |
| Gemini Code Assist | Policy only | No live per-user data |
| JetBrains AI | Retained in repo, deferred from active promise | Waiting for org-console reverification |
