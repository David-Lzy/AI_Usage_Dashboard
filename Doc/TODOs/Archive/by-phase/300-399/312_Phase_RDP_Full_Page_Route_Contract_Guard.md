# Phase 312 - RDP Full-Page Route Contract Guard

## Goal

Prevent future Chrome/RDP smoke passes from opening sidepanel-derived routes through the wrong bare `src/sidepanel/index.html#...` URL when they are actually running in an ordinary Chrome tab or app window.

## Scope

- Move the `store:capture-rdp-extension-window` route table into a small testable helper.
- Preserve the existing route keys, dimensions, titles, and capture behavior.
- Add regression coverage proving dashboard, Settings, focused Settings, and provider-detail app-window captures use `?surface=full-page#...`.
- Keep the native toolbar popup route as the only non-full-page app-window capture path.

## Preserved Boundaries

- Do not change side-panel runtime routing.
- Do not change popup routing, provider sync, or Settings behavior.
- Do not bump package versions or rebuild release artifacts.
- Do not claim direct Playwright MCP smoke from this static route-contract guard.

## Acceptance

- RDP app-window route aliases for `dashboard`, `settings`, focused Settings targets, and provider detail all point at `src/sidepanel/index.html?surface=full-page#...`.
- The command help route list is generated from the same route table the capture command uses.
- Focused tests lock the route contract so the previous bare sidepanel URL mistake cannot silently re-enter the helper.

## Planned Verification

- `npm run test -- --run scripts/lib/rdp-extension-window-routes.test.mjs src/shared/extension-surface-paths.test.ts src/sidepanel/app-browser-controls.test.ts`
- `node --check scripts/capture-rdp-extension-window.mjs`
- `node --check scripts/lib/rdp-extension-window-routes.mjs`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Extracted the RDP extension-window route table to `scripts/lib/rdp-extension-window-routes.mjs`.
- Updated `scripts/capture-rdp-extension-window.mjs` to read route config and route-help text from that helper.
- Added `scripts/lib/rdp-extension-window-routes.test.mjs` to lock full-page surface paths for ordinary app-window smoke routes while preserving `popup` as the only popup app-window route.

Verification:

- `npm run test -- --run scripts/lib/rdp-extension-window-routes.test.mjs src/shared/extension-surface-paths.test.ts src/sidepanel/app-browser-controls.test.ts`
- `node --check scripts/capture-rdp-extension-window.mjs`
- `node --check scripts/lib/rdp-extension-window-routes.mjs`
