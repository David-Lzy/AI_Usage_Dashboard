# Phase 313 - Store Screenshot Route Config Reuse

## Goal

Remove duplicated popup and full-page route config from the store screenshot runtime capture plan so screenshot request generation cannot drift away from the extension-window smoke helper.

## Scope

- Reuse `scripts/lib/rdp-extension-window-routes.mjs` for store screenshot popup, Settings full-page, and Codex detail full-page route config.
- Preserve current screenshot filenames, presets, capture-truth notes, and generated request output.
- Add a focused test proving store screenshot runtime entries match the same route config used by `store:capture-rdp-extension-window`.

## Preserved Boundaries

- Do not change screenshot story, capture-truth metadata, or store listing assets.
- Do not regenerate historical request/archive packages.
- Do not change extension runtime code, provider behavior, or release package artifacts.

## Acceptance

- `scripts/lib/store-screenshot-rdp-capture.mjs` no longer hand-maintains duplicate route path/title/size values for popup/full-page runtime captures.
- Existing store screenshot capture-plan tests still pass with identical expected route output.
- The RDP route-contract test covers the store screenshot plan alignment.

## Planned Verification

- `npm run test -- --run scripts/lib/rdp-extension-window-routes.test.mjs scripts/lib/store-screenshot-capture-request.test.mjs`
- `node --check scripts/lib/store-screenshot-rdp-capture.mjs`
- `node --check scripts/lib/rdp-extension-window-routes.test.mjs`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Updated `scripts/lib/store-screenshot-rdp-capture.mjs` to source popup, Settings full-page, and Codex detail full-page route path/title/size fields from `scripts/lib/rdp-extension-window-routes.mjs`.
- Extended `scripts/lib/rdp-extension-window-routes.test.mjs` to prove the store screenshot runtime capture plan remains aligned with the shared RDP extension-window route config.
- Preserved existing store screenshot capture-plan expectations without regenerating historical packages.

Verification:

- `npm run test -- --run scripts/lib/rdp-extension-window-routes.test.mjs scripts/lib/store-screenshot-capture-request.test.mjs`
- `node --check scripts/lib/store-screenshot-rdp-capture.mjs`
- `node --check scripts/lib/rdp-extension-window-routes.test.mjs`
