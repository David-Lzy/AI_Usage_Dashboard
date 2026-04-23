# Phase 41 - Personal Mixed-Source Real Chrome Verification

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- verify the post-personal-support build in a real Chrome session with both official and session-page sources enabled

Depends on:

- phase 40

File scope:

- `Doc/testing/`
- `scripts/`
- `README.md`

Execution note:

- this parent phase was split on `2026-04-23` after the first operator-profile pass exposed a real-Chrome runtime-parity blocker on the `Cursor` session-page path

Subphases:

- [41_1_Phase_Real_Chrome_Runtime_Parity_And_Profile_Audit.md](./41_1_Phase_Real_Chrome_Runtime_Parity_And_Profile_Audit.md) - completed on `2026-04-23`
- [41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md](./41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md) - completed for the narrowed RC scope on `2026-04-23`

Resolution note:

- the `Phase 41.1` runtime-parity ambiguity was cleared on `2026-04-23`, and both live `Codex` plus `Cursor` personal session-page captures now pass in real Chrome
- the current operator profile still lacks a usable JetBrains organization-session page, but `Branch B` narrowed the active RC support promise so that JetBrains is retained in the repo and deferred from this release
- release packaging can now proceed into `Phase 42` for the narrowed RC scope

Done when:

- subphase `41.2` records the final real-Chrome mixed-source result for the current unpacked build
- release packaging can use that result as the gate into phase `42`

Out of scope:

- version bump and release artifact generation
- Chrome Web Store submission work

Completion date: 2026-04-23

Completion summary:

- split the parent verification gate into a runtime-parity preflight and a final real-Chrome rerun so the operator-profile ambiguity could be isolated cleanly
- re-proved the live `Codex` and `Cursor` personal session-page paths in real Chrome
- resolved the release gate for the narrowed RC by deferring JetBrains from the active support promise after the operator profile failed to expose a usable org-visible Console session

Verification:

- reports:
  - [Phase_41_1_Real_Chrome_Runtime_Parity_Report.md](../../testing/Phase_41_1_Real_Chrome_Runtime_Parity_Report.md)
  - [Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md](../../testing/Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md)
- real-Chrome operator verification and debug-capture evidence were recorded in those reports

Follow-up:

- phase `42` packaged the narrowed RC that cleared this gate
