# Direction 01.1 - Release Truthfulness And Closeout TODOs

Date: 2026-04-22

Status note:

- completed on `2026-04-23` through the narrowed-RC `Phase 41` plus `Phase 42` closeout

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 01 - Release Truthfulness And Closeout](./01_Direction_Release_Truthfulness_And_Closeout.md)

## Detailed TODOs

### A. Documentation Audit

- reconcile `README.md`, `Doc/AI_Usage_Dashboard_TODOs.md`, `Doc/TODOs/00_Phase_Index.md`, and provider notes against the actual shipped code paths
- remove stale statements that still describe `Codex` or `Cursor` personal support as future work
- make one source of truth explicit for:
  - shipped
  - deferred
  - policy only
  - not yet verified in real Chrome

### B. Mixed-Source Verification Gate

- complete the split `Phase 41` gate honestly:
  - `Phase 41.1` runtime parity and profile audit
  - `Phase 41.2` final parity-aligned mixed-source real-Chrome pass
- current truth on `2026-04-23`:
  - the runtime-parity ambiguity is cleared
  - the live `Codex` and `Cursor` personal session-page paths both pass in real Chrome
  - `Branch B` is now selected for the current RC, so JetBrains is retained in the repo but deferred from the active release promise
- cover:
  - `Codex` personal session page
  - `Cursor` personal session page
  - `JetBrains` session page
  - official API providers that still rely on credentials
- verify:
  - permission prompts
  - source switching
  - page-binding reconnect
  - readable fallback messaging

### C. Release Candidate Closeout

- execute `Phase 42` only after `Phase 41.2` writes the final mixed-source verification result
- bump package and manifest versions for the next RC
- regenerate the release archive from the verified build
- ensure the release docs describe the actual mixed-source behavior, not an aspirational one

### D. Release Gate Definition

- define one lightweight final checklist for:
  - build
  - tests
  - smoke
  - real Chrome verification report
  - docs alignment
  - packaged artifact presence

## Out Of Scope

- new provider support
- popup entry redesign
- visual polish beyond what is needed for truthful release documentation
