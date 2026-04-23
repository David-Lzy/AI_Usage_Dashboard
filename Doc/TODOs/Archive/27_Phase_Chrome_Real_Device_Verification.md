# Phase 27 - Chrome Real Device Verification

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- complete the final pre-release verification in real Chrome extension conditions

Depends on:

- phase 26

File scope:

- `Doc/testing/`
- any small fix files discovered during verification

Tasks:

- install the release-candidate unpacked extension in Chrome
- run the manual checklist on a real browser profile with real permissions
- verify side panel launch, host permission requests, provider refresh, and settings persistence
- record any release-blocking defects and either fix them or spin follow-up subphases

Done when:

- the extension passes a real Chrome verification pass
- any remaining blockers are explicitly documented
- the project is ready for release-oriented follow-up instead of core build work

Out of scope:

- major new feature work unrelated to release readiness

Completion date: 2026-04-21

Completion summary:

- executed a new real-profile verification script against the built unpacked extension in persistent Playwright Chromium
- verified dashboard load, `Refresh All`, provider detail round-trip, and settings persistence across both page reload and browser relaunch
- confirmed that this machine has no system `Chrome/Chromium` install and no GUI display session, so the final native permission-prompt acceptance step could not be completed locally
- recorded the local environment, the persistent-profile results, and the permission-prompt limitation in [Phase_27_Real_Device_Verification_Report.md](../../testing/Phase_27_Real_Device_Verification_Report.md)
- split the remaining GUI-only release gate into [27_1_Phase_Operator_GUI_Permission_Pass.md](../27_1_Phase_Operator_GUI_Permission_Pass.md) so the document trail stays honest

Verification:

- automated checks:
  - `npx -y node@22 ./scripts/phase27-real-profile-check.mjs`
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- extension and preview checks:
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
  - `curl -I http://127.0.0.1:4173/icons/icon32.png`
  - `npx -y node@22 ./scripts/phase19-smoke.mjs`
- external docs reviewed:
  - `https://playwright.dev/docs/chrome-extensions`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist`

Residual release gate:

- the native host-permission prompt still needs a human GUI pass in a real Chrome or Chromium desktop session

Follow-up:

- closed by [27_1_Phase_Operator_GUI_Permission_Pass.md](./27_1_Phase_Operator_GUI_Permission_Pass.md)
