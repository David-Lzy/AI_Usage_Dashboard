# Autonomous Codex Prompt

Snapshot date: 2026-05-03.

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- use this prompt when Codex should continue this project with minimal manual steering
- refresh this file whenever the phase workflow, verification commands, RDP Chrome process, or provider truth boundary changes

## Recommended Prompt

```text
You are working in /home/davidli/Project/personal_project/AI_Usage_Dashboard.

Continue this Chrome extension project autonomously using the repo's own
workflow, phase files, and roadmap truth. Pick the next safe, high-priority
phase or documentation-backed feature slice, complete it end to end, verify it,
update the relevant docs, commit it, push it, rebuild the extension, then
continue to the next safe task.

Required reading before each work cycle:
- Doc/Development_Guardrails.md
- Doc/TODOs/00_Phase_Index.md
- The active phase file named in Doc/TODOs/00_Phase_Index.md, if one exists
- Doc/AI_Usage_Dashboard_TODOs.md
- Doc/Roadmap/00_Strategic_Directions_Index.md
- README.md
- Any roadmap, provider note, testing report, or design contract linked by the
  active phase

Task selection rules:
1. Start with the active phase file in Doc/TODOs/00_Phase_Index.md.
2. If no active phase exists, choose the highest-priority local-safe item from
   Doc/AI_Usage_Dashboard_TODOs.md and Doc/Roadmap/00_Strategic_Directions_Index.md.
3. Prefer P0/P1 tasks that are independently implementable and verifiable in
   the local repo.
4. Work on one phase or one coherent feature slice at a time.
5. Do not mix unrelated runtime, documentation, screenshot, and refactor work in
   one commit.
6. If docs disagree, follow Doc/Development_Guardrails.md first, then
   Doc/TODOs/00_Phase_Index.md, then Doc/AI_Usage_Dashboard_TODOs.md, then the
   roadmap direction files, then older phase evidence.
7. If a task is blocked by external access, record the blocker and move to the
   next local-safe task.

Implementation rules:
1. Start every cycle with git status --short and inspect relevant files before
   editing.
2. Never overwrite, revert, or delete user changes unless explicitly asked.
3. Use apply_patch or normal editor-safe edits; do not use destructive git
   commands.
4. Reuse existing React, TypeScript, storage, provider, i18n, and CSS-token
   patterns before adding new abstractions.
5. Keep UI work aligned with Material Design 3 roles, compact extension density,
   existing theme tokens, and the side-panel/popup/full-page surface contract.
6. Keep provider truth labels intact unless the active phase explicitly changes
   the product contract.
7. Do not store or request raw cookies, copied auth headers, ChatGPT access
   tokens, full API keys in docs, or other session secrets.
8. For session-page providers, use granted host access plus page-context
   extraction inside real logged-in tabs; do not claim fully hidden scraping when
   Chrome requires a real authenticated document.
9. Preserve existing source-selection order, page-binding behavior, sync
   behavior, and provider fallback semantics unless the active phase explicitly
   targets them.
10. Do not rewrite historical archives or generated operational ledgers by hand;
    update generators or run the documented refresh command when those ledgers
    must change.
11. Keep store-screenshot claims truthful: preview/helper-window captures are
    not replacements for native toolbar popup evidence when the request says
    manual native-toolbar capture is required.

Phase split rules:
1. If the active phase becomes too large, split before continuing major
   implementation.
2. Use the repo's phase naming convention, for example:
   - 236_1_Phase_Short_Name.md
   - 236_2_Phase_Short_Name.md
3. Each child phase must include Goal, Scope, Preserved Boundaries, Acceptance,
   Planned Verification, and Follow-Up when relevant.
4. Update Doc/TODOs/00_Phase_Index.md and any affected roadmap docs so the next
   task is obvious.
5. Commit the planning split before implementing the first child phase.

Verification rules:
1. For documentation-only phases, run:
   - npm run docs:check
   - git diff --check
2. For runtime code phases, run at minimum:
   - npm run docs:check
   - npm run typecheck
   - npm run test -- --run
   - npm run build
   - git diff --check
3. Add focused tests for changed TypeScript behavior when practical.
4. For UI phases, add or run the most relevant Playwright/visual review script
   and inspect desktop/full-page plus compact side-panel widths.
5. For extension-mode validation, build first, then reload the unpacked
   extension in RDP Chrome from dist/ before trusting the visual result.
6. If a test or visual check cannot be run, document the exact reason in the
   active phase closeout and final handoff.

Phase closeout rules:
1. Update the active phase file with completion status, completion summary,
   verification performed, and follow-up.
2. Move completed phase files into Doc/TODOs/Archive/.
3. Update Doc/TODOs/00_Phase_Index.md so the active phase is cleared or points
   to the next phase, and latest completed slice points at the archived phase.
4. Update Doc/AI_Usage_Dashboard_TODOs.md, roadmap docs, README.md, or testing
   docs when their current truth changes.
5. Run the verification commands for the phase type after docs are updated.
6. Stage only the coherent slice you completed.
7. Commit with a clear message mentioning the phase number when applicable.
8. Push the current branch.
9. Run npm run build after push so dist/ matches the pushed source state.
10. If push fails, keep the local commit, record the error, and continue only if
    the next action is safe.

RDP Chrome rules:
1. Treat preview URLs as fast inspection tools, not final extension-mode proof.
2. Before RDP Chrome validation, run npm run build.
3. Reload the unpacked extension at chrome://extensions after the build.
4. Close stale extension popup, side-panel, and full-page windows before
   reopening surfaces.
5. Do not diagnose a blank or partially styled unpacked-extension page as a CSS
   bug until the extension has been reloaded after the latest build.

Blocked-progress rules:
1. Distinguish local blockers from external blockers.
2. Local blockers include failing tests, unclear ownership, inconsistent docs,
   merge conflicts, missing files, or implementation uncertainty.
3. External blockers include missing provider credentials, missing paid account
   access, native popup screenshots requiring manual capture, Chrome permission
   prompts, remote push failure, or product decisions not answerable from repo
   truth.
4. For local blockers, inspect the repo and attempt the smallest safe fix.
5. For external blockers, do not fake the result and do not force unsafe side
   effects.
6. Record blocker, evidence, attempted checks, and next human action in the
   active phase or relevant roadmap/TODO doc.
7. If a local-safe partial slice remains, complete and commit that slice.
8. If no local-safe work remains for the current phase, move to the next
   unblocked phase or leave a blocked handoff.

Provider truth boundaries:
1. Codex personal usage is a logged-in session-page path that exposes visible
   usage windows and reset timing, not one absolute plan-wide remaining balance.
2. Cursor personal usage exposes billing-period context, not exact remaining
   included requests.
3. JetBrains remains retained but deferred until a real org-visible Users and
   licensing page is reverified.
4. Claude personal usage remains deferred until a real Pro or Max usage page is
   captured.
5. Gemini remains policy-only unless project metrics are explicitly accepted as
   a supported product contract.
6. Do not upgrade any provider claim without live evidence and updated docs.

Completion standard:
1. The worktree should be clean after each autonomous cycle unless an explicit
   blocker prevents it.
2. The pushed commit should contain one coherent implementation or
   documentation slice.
3. The phase index, roadmap, and top-level TODOs should make the next task clear.
4. The final handoff should summarize completed work, verification, skipped
   checks with reasons, and the next recommended task.

Continue cycling until there are no local-safe phases left, the project is
complete, or all remaining work is blocked on explicit external items.
```

## When To Use

Use this prompt when the repo already has enough phase and roadmap detail for
autonomous execution.

Good examples:

- implement the active phase in `Doc/TODOs/00_Phase_Index.md`
- continue after a previous Codex session
- close out a documentation-backed phase
- perform a local-safe UI or provider-support slice
- split an oversized phase before implementation
- complete verification, docs, commit, push, and rebuild for a coherent slice

Avoid using it when:

- the desired product direction is still undecided
- the next step requires manual native-toolbar popup capture and no operator is
  available
- provider credentials, paid account access, or Chrome permission prompts must
  be handled manually first
- the user wants a one-off answer, code review, or analysis instead of autonomous
  repo advancement
- multiple collaborators are editing the same files without coordination

## Expected Behavior

Each autonomous cycle should leave:

- one coherent implementation or documentation slice
- updated phase and roadmap documentation
- verification commands run or explicitly skipped with reason
- one local commit
- a pushed remote commit when the remote is healthy
- a fresh `dist/` build after push

Completed phase files should move to `Doc/TODOs/Archive/` and the active phase
entry should be cleared or advanced in `Doc/TODOs/00_Phase_Index.md`.

## Active Phase Convention

The active phase is the primary work selector.

Rules:

- keep exactly one active phase in `Doc/TODOs/00_Phase_Index.md` when active
  work is queued
- keep the latest completed slice pointing at the newest archived phase file
- do not archive a phase until implementation, docs, and verification are done
- if the phase becomes too large, split it into numbered child phases before
  continuing

## Blocked Handoff Standard

When Codex cannot safely continue, it should leave the repo reviewable:

- no half-applied uncommitted code when avoidable
- active phase or roadmap updated with blocker details
- tests run for any completed local slice
- local commit created and pushed if there is a coherent completed change

The blocker note should include:

- what is blocked
- why it is blocked
- what was tried
- what evidence supports the blocker
- what human action, provider access, Chrome action, or external service is
  needed next

## Project Completion Standard

The project is complete only when:

- all local-safe phases are archived or explicitly marked blocked
- roadmap and TODO docs agree on remaining work
- verification has been run for the final slice
- the worktree is clean
- the final commit is pushed
- `dist/` has been rebuilt after the final push

If only external work remains, use this wording in the final handoff:

```text
All local-safe work is complete. Remaining work is blocked on external items:
...
```
