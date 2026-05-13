# Phase 27.1 - Operator GUI Permission Pass

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- complete the final GUI-only operator verification that cannot be closed in the current headless environment

Depends on:

- phase 27

File scope:

- `Doc/testing/`
- any tiny regression fixes discovered during operator validation

Tasks:

- load the unpacked `dist/` extension in a real Chrome or Chromium GUI session
- accept and deny actual native host-permission prompts for at least one provider
- verify the toolbar icon clarity in the browser UI
- confirm side panel launch from the toolbar action and from the extensions page
- record any final release-blocking defects or confirm the release candidate is clear

Done when:

- a human GUI operator has completed the native permission-prompt checks
- the remaining release gate is either cleared or explicitly documented as blocked

Out of scope:

- new provider work or architecture changes

Completion date: 2026-04-21

Completion summary:

- reused the already loaded unpacked `dist/` extension in a real Google Chrome desktop session on Ubuntu with an active X11 display
- confirmed the toolbar icon is legible in the live browser chrome and the side panel opens from the pinned toolbar action
- triggered a native host-permission prompt for `Cursor`, accepted it, and verified the side-panel state changed from `Host access missing` to `Host access granted`
- removed the granted `Cursor` host permission again and verified the state returned to `Host access missing`
- triggered a native host-permission prompt for `JetBrains AI`, denied it, and verified the provider remained in the `Host access missing` state
- confirmed the release gate from phase 27 is cleared and the project no longer has an open GUI-only permission blocker

Verification:

- manual GUI checks:
  - real Chrome desktop session on `DISPLAY=:10`
  - native permission prompt surfaced for `https://api.cursor.com/*`
  - native permission prompt surfaced for `https://account.jetbrains.com/*` and `https://*.jetbrains.com/*`
  - side-panel provider status reflected allow/remove/deny outcomes correctly
- evidence captured:
  - `/tmp/phase27_1_after_cursor_request.png`
  - `/tmp/phase27_1_after_allow.png`
  - `/tmp/phase27_1_after_remove.png`
  - `/tmp/phase27_1_jetbrains_prompt.png`
  - `/tmp/phase27_1_jetbrains_after_deny.png`
  - `/tmp/phase27_1_final_state.png`
- documentation checks:
  - update `Doc/testing/Archive/phase-reports/001-099/Phase_27_Real_Device_Verification_Report.md`
  - update `Doc/TODOs/00_Phase_Index.md`
  - archive this phase file after closeout

Follow-up:

- none
