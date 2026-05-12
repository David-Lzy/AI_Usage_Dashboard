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
