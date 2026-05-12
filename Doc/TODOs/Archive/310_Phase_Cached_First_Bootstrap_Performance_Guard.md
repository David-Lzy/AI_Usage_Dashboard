# Phase 310 - Cached-First Bootstrap Performance Guard

## Goal

Prevent regressions where side-panel or full-page entry waits on background refresh before rendering cached dashboard state.

## Scope

- Add a focused automated guard around `useStandardAppRuntime` or route bootstrap planning that proves cached-first entry clears loading after the cached state response.
- Add one repeatable Chrome helper smoke note or script path for side-panel/full-page first-paint review.
- Keep existing sync writeback and background refresh semantics unchanged.

## Preserved Boundaries

- Do not add telemetry or persist performance logs in extension storage.
- Do not change provider refresh timing beyond the existing cached-first behavior.
- Do not claim native toolbar-popup timing from helper-window evidence.

## Acceptance

- Tests fail if side-panel or full-page standard routes require the heavier background bootstrap before rendering cached app state.
- The loading card remains available only for true no-state initialization.
- The verification path names the exact command or test that protects this behavior.

## Planned Verification

- `npm run test -- --run src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/route-state.test.ts`
- Optional Chrome RDP smoke capture for `dashboard` and `full-page-dashboard`.
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added a route-level cached-first regression test for `StandardRouteApp` that renders a real dashboard route with cached app state while the runtime still reports `isLoading=true`.
- Kept the true no-state loading card covered, so `Preparing dashboard state` remains valid only when no cached app state is available yet.
- Ran the Chrome RDP helper against both `dashboard` and `full-page-dashboard` aliases after the Phase 308 full-page URL correction.

Verification:

- `npm run test -- --run src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/route-state.test.ts src/sidepanel/standard-route-app.test.tsx`
- `npm run typecheck`
- `npm run store:cleanup-rdp-runtime-windows`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase310-dashboard-cached-first.png`
- `npm run store:capture-rdp-extension-window -- --route full-page-dashboard --output tmp/phase310-full-page-dashboard-cached-first.png`
- `identify tmp/phase310-dashboard-cached-first.png tmp/phase310-full-page-dashboard-cached-first.png`
- `npm run docs:check`
- `git diff --check`
