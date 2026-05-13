# Phase 27 Real Device Verification Report

Date: 2026-04-21

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Scope

- built unpacked extension in `dist/`
- persistent browser-profile verification with the extension loaded
- manual-checklist coverage for dashboard, detail route, refresh, and settings persistence
- explicit permission-prompt probe

## Local Environment

- no system `google-chrome` or `chromium` binary was installed on this machine
- no active GUI display session was available:
  - `DISPLAY` was empty
  - `XDG_SESSION_TYPE` reported `tty`
- Playwright-managed Chromium was available at:
  - `/home/davidli/.cache/ms-playwright/chromium-1217`

## Official Constraint Used For This Phase

The current Playwright extension-testing guidance says:

- use Chromium with a persistent context for extension testing
- Google Chrome and Microsoft Edge removed the command-line flags needed to side-load extensions

Source:

- https://playwright.dev/docs/chrome-extensions

Inference from source:

- a fully automated local Google Chrome unpacked-extension pass is not defensible in this environment
- the best available local approximation is Playwright Chromium with a persistent browser profile and the built `dist/` artifact

## What Was Verified

Automated with `scripts/phase27-real-profile-check.mjs`:

- dashboard loads from the unpacked extension page
- `Refresh All` surfaces the success toast
- provider detail route opens and returns cleanly
- settings page loads in extension mode
- sync interval and warning threshold settings persist across page reload
- the same settings persist across browser relaunch when the same profile directory is reused

## Permission Probe Result

The host-permission probe was executed against the unpacked extension in persistent Chromium:

- before clicking `Request access`, `chrome.permissions.contains` for `https://api.cursor.com/*` was `false`
- after clicking `Request access`, `chrome.permissions.contains` remained `false`
- no `access granted` toast appeared
- no `access denied` toast appeared

Interpretation:

- in this headless, no-display environment, the native host-permission prompt could not be completed
- this means the final operator acceptance step for real permission prompts is still outstanding

## Phase 27.1 Operator GUI Follow-up

The outstanding GUI-only step was completed later on the same machine after the desktop environment was prepared.

GUI environment used:

- Ubuntu desktop session available on `DISPLAY=:10`
- system `Google Chrome 147.0.7727.101` installed
- unpacked `dist/` extension already loaded in the real Chrome profile

What was verified in the real GUI session:

- the extension toolbar icon remained readable in the real Chrome UI
- the side panel opened from the pinned toolbar action in the live Chrome window
- `Cursor` host-permission request showed the native Chrome permission dialog
- accepting the `Cursor` prompt changed the side-panel status from `Host access missing` to `Host access granted`
- removing the `Cursor` grant changed the status back to `Host access missing`
- `JetBrains AI` host-permission request showed the native Chrome permission dialog
- denying the `JetBrains AI` prompt left the provider in the `Host access missing` state
- the extension remained usable after the prompt interactions and no new visible extension error gate appeared on the extensions management page

Captured evidence:

- `/tmp/phase27_1_after_cursor_request.png`
- `/tmp/phase27_1_after_allow.png`
- `/tmp/phase27_1_after_remove.png`
- `/tmp/phase27_1_jetbrains_prompt.png`
- `/tmp/phase27_1_jetbrains_after_deny.png`
- `/tmp/phase27_1_final_state.png`

## Conclusion

Local release-readiness result:

- non-interactive extension flows are stable in a real unpacked persistent browser profile
- settings persistence is confirmed
- native permission-prompt allow and deny flows are now verified in a real GUI Chrome session

Release note:

- the release-candidate verification gate is clear
