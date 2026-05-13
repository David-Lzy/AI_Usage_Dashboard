# Phase 41.1 - Real Chrome Runtime Parity And Profile Audit

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- audit the active real Chrome operator profile before the final mixed-source gate and turn the current parity findings into repeatable verification tooling

Depends on:

- phase 40

File scope:

- `scripts/phase41-profile-audit.mjs`
- `Doc/testing/Archive/phase-reports/001-099/Phase_41_1_Real_Chrome_Runtime_Parity_Report.md`
- `Doc/testing/Manual_Test_Checklist.md`
- `README.md`
- `Doc/AI_Usage_Dashboard_TODOs.md`
- `Doc/Roadmap/`
- `Doc/TODOs/`

Tasks:

- inspect the active Chrome profile runtime, granted hosts, and stored extension app-state
- capture one successful live session-page path and one blocked live session-page path in real Chrome
- add a repeatable profile-audit command for future release gating
- update the real-Chrome manual checklist so existing-profile verification explicitly includes extension reload and runtime parity checks
- split parent phase 41 so the remaining final mixed-source pass stays visible as a separate executable slice

Done when:

- the runtime-parity risk is explicit and documented
- the real-Chrome gate has a repeatable preflight command instead of ad hoc shell work
- the remaining release-blocking verification work is isolated in its own subphase

Out of scope:

- clearing the final mixed-source release gate
- RC2 version bump and packaging

Completion date: 2026-04-23

Completion summary:

- added [scripts/phase41-profile-audit.mjs](../../../../../scripts/phase41-profile-audit.mjs) to extract the installed unpacked extension path, runtime host grants, and the latest `ai-usage-dashboard.app-state` record from the active Chrome profile
- recorded the current blocked operator-profile state in [Phase_41_1_Real_Chrome_Runtime_Parity_Report.md](../../../../testing/Archive/phase-reports/001-099/Phase_41_1_Real_Chrome_Runtime_Parity_Report.md)
- captured a fresh successful `Codex` real-Chrome session-page fixture and a blocked `Cursor` real-Chrome session-page permission outcome
- updated the manual checklist and release summary docs so future real-Chrome verification explicitly reloads the unpacked extension runtime before trusting permission results
- split parent `Phase 41` into an audit/parity subphase and a remaining final-pass subphase so release packaging does not proceed on ambiguous runtime state

Verification:

- `npx -y node@22 ./scripts/phase41-profile-audit.mjs`
- manual real-Chrome checks on `DISPLAY=:10` with evidence captured in:
  - `/tmp/phase41-debug-capture-cursor-page2.png`
  - `/tmp/phase41-cursor-capture-after-enter.png`
  - `/tmp/phase41-debug-capture-codex-page.png`
  - `/tmp/phase41-codex-capture-after-enter.png`
  - `/tmp/phase41-settings-scrolled-lower.png`
  - `/tmp/phase41-extensions-manage-page.png`
- clipboard review of the redacted Codex JSON fixture captured from the live Chrome window

Follow-up:

- continue with [41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md](./41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md)
