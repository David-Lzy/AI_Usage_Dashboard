# Phase 437 - Chrome Extension Error Triage And Fix

Status: completed

## Goal

Investigate and fix the Chrome Extensions page error badge shown for the unpacked AI Usage Dashboard extension.

## Scope

- Reproduce the `chrome://extensions` error state in the current RDP Chrome profile with the latest `dist/` build.
- Open the extension error details and service-worker inspector to capture the exact stack, URL, line number, and trigger condition.
- Fix only the confirmed source of the error.
- Reload the unpacked extension and confirm the error badge is cleared or no new error is produced.
- Record any stale-profile limitation if Chrome retains old errors that cannot be cleared from the extension code path.

## Preserved Boundaries

- Do not broaden extension permissions or provider host access to silence errors.
- Do not clear user browser profile data unless explicitly required and documented as a local QA cleanup.
- Do not change release versioning or package a new RC in this phase.
- Do not mask real service-worker/runtime errors with broad catch blocks unless the error is expected and intentionally recoverable.

## Acceptance

- The root cause of the Chrome Extensions error badge is documented in the phase completion notes.
- The extension no longer emits the confirmed error after reload with the current build.
- If Chrome shows only stale historical errors, the stale-state boundary and reproduction result are documented instead of pretending a code fix happened.
- Focused tests or smoke checks cover the fixed path when the root cause is testable.

## Planned Verification

- `npm run build`
- RDP Chrome unpacked-extension reload and `chrome://extensions` error inspection.
- Service-worker console check for new unhandled errors.
- Focused test for the fixed runtime path if applicable.
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- No code follow-up is required from this phase. The Chrome Errors entries were historical Vite dev-server records, not current `dist/` runtime failures.

## Completion Notes

Completed on 2026-05-14.

Findings:

- RDP Chrome was loading the unpacked extension from `dist/` with extension id `gkjioiklbdjcknhdglaehbeofkjmmdpc`.
- Structured Chrome profile inspection showed no current `manifest_errors`, `runtime_errors`, or `install_warnings` fields for this extension.
- The Chrome Extensions `Errors` panel contained stale historical entries from `src/sidepanel/index.html?surface=full-page#settings` trying to load Vite dev-server resources:
  - `http://localhost:5173/`
  - `http://localhost:5173/@vite/env`
- Current `dist/` output contains no `localhost:5173`, `@vite/env`, or Vite client references.
- After `npm run build`, extension reload from the Chrome Extensions detail page, and Chrome Errors `Clear all`, the extension card no longer showed an `Errors` button.

Boundary:

- No source-code fix was made because the confirmed error records were stale Chrome extension error-log entries from an older dev-mode run, not reproducible current-build failures.
- The only browser-profile cleanup was the targeted Chrome Extensions `Clear all` action for this unpacked extension's error panel.

Verification:

- `npm run build`
- RDP Chrome `chrome://extensions/?id=gkjioiklbdjcknhdglaehbeofkjmmdpc` detail page reload showed `Reloaded`.
- RDP Chrome `chrome://extensions/?errors=gkjioiklbdjcknhdglaehbeofkjmmdpc` captured the stale dev-server CORS records before cleanup.
- RDP Chrome `chrome://extensions` captured the extension card after cleanup with no `Errors` button.
- `rg -n 'localhost:5173|@vite/env|vite/client' dist src package.json vite.config.ts` returned no matches.
