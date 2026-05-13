# Phase 41.2 - Final Mixed-Source Real Chrome Pass

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- rerun the final mixed-source real-Chrome release gate after runtime parity is confirmed for the current unpacked build

Depends on:

- phase 41.1

File scope:

- `Doc/testing/`
- any small runtime-fix or doc files discovered during the rerun

Tasks:

- confirm the unpacked extension runtime in the operator Chrome profile matches the current `dist/manifest.json`
- rerun the live Chrome verification pass for:
  - Codex personal session page
  - Cursor personal session page
  - JetBrains session page
  - official credential-backed providers that remain part of the shipped build
- verify permission prompts, source switching, reconnect after relaunch, and readable failure states on the parity-aligned runtime
- update the mixed-source report with the final pass or release-block result that should gate phase 42

Current status note:

- `2026-04-23`: the final rerun cleared the earlier `Cursor` runtime-parity blocker and re-proved the live `Codex` plus `Cursor` personal session-page paths in real Chrome
- the operator profile still does not expose a usable live JetBrains organization-session page; the direct route probe returned `JetBrains Account :: Error 400: Bad Request`
- `2026-04-23`: `Branch B` was selected, so JetBrains was removed from the active RC support promise and retained only as a deferred repo path
- see [Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md](../../../../testing/Archive/phase-reports/001-099/Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md)

Done when:

- the final real-Chrome report is authoritative for the current unpacked `dist/` build
- the release gate is explicitly resolved for the current RC scope with no runtime-parity ambiguity

Out of scope:

- RC2 version bump and packaging
- new provider feature work

Completion date: 2026-04-23

Completion summary:

- verified that the unpacked extension runtime in the long-lived operator Chrome profile matched the current build closely enough to clear the earlier parity ambiguity
- re-proved the live `Codex` and `Cursor` personal session-page paths in real Chrome
- captured the remaining JetBrains blocker as an operator-profile org-visibility issue and then resolved the RC gate by selecting `Branch B`

Verification:

- report:
  - [Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md](../../../../testing/Archive/phase-reports/001-099/Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md)
- supporting checks:
  - `npx -y node@22 ./scripts/phase41-profile-audit.mjs`
  - real-Chrome operator GUI verification through the debug capture routes

Follow-up:

- phase `42` consumed this gate result for RC2 packaging
