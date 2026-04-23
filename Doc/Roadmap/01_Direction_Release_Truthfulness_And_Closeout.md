# Direction 01 - Release Truthfulness And Closeout

Date: 2026-04-22

Status: completed

Completion date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P0`

## Why This Direction Exists

The project is no longer blocked on core implementation.

The immediate risk is now truth drift:

- active phase files still show release work that has not been run yet
- top-level summary docs are starting to lag behind the actual shipped provider work
- new strategy work will become noisy if the current release candidate is not first closed out cleanly

## Current Truth

As of 2026-04-23:

- `Phase 41` has been split into a completed `41.1` runtime-parity preflight and a remaining `41.2` final mixed-source pass
- the old `Cursor` runtime-parity blocker is cleared; the `2026-04-23` rerun re-proved both the live `Codex` and `Cursor` personal session-page paths in the long-lived operator profile
- `Branch B` was selected on `2026-04-23`, so JetBrains is retained in the repo but deferred from the active RC support promise
- `Phase 42` has now completed and packaged `0.1.0-rc.2`
- the numbered phase history is otherwise well archived through `Phase 40`
- `README.md` now points to the packaged narrowed RC artifact and the next roadmap directions
- `AI_Usage_Dashboard_TODOs.md` needed a state correction because it still framed `Codex` and `Cursor` personal wiring as future work even though phases `35` to `40` are already complete

## Direction Goal

Before adding major new feature work:

- make the project state fully legible again
- close the mixed-source verification gate in real Chrome
- cut the next RC from a documented, verified state rather than from a moving prototype

Outcome:

- completed on `2026-04-23` with the narrowed RC packaged as `release/ai-usage-dashboard-0.1.0-rc.2.zip`

## Strategic Decisions

1. Do not treat documentation cleanup as cosmetic work.
   It is a release-readiness task because this project depends on many nuanced provider honesty boundaries.

2. Keep the current active queue intact.
   `Phase 41` and `Phase 42` were the immediate execution path and are now complete for the narrowed RC.

3. Use the roadmap only for post-closeout prioritization.
   It should not become a shadow phase queue that bypasses the current release gate.

## Success Criteria

- the summary docs match the actual provider state on disk
- the mixed-source build has a formal real-Chrome verification record
- the next RC package is cut only after that record exists
- there is one obvious answer to "what is shipped today?"

## Main Risks

- feature work resumes before the current release queue is closed
- docs begin describing provider states that are no longer true
- the release artifact drifts from the build that was actually verified

## Child TODO

- [01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md](./01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md)
- [01_2_Direction_JetBrains_Gate_Resolution.md](./01_2_Direction_JetBrains_Gate_Resolution.md)
