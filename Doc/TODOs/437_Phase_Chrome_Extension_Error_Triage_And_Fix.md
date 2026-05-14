# Phase 437 - Chrome Extension Error Triage And Fix

Status: queued

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

- If the error belongs to a larger lifecycle problem, create a narrower follow-up TODO with the captured stack and keep this phase limited to triage plus the smallest safe fix.
