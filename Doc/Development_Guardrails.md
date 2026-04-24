# Development Guardrails

Date: 2026-04-20

Process rule:

- this file is the source of truth for the project workflow
- every markdown file in `Doc/` and `Doc/TODOs/` must follow this guardrail

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file should track the current project workflow rules
- refresh it whenever closeout rules, documentation policy, verification policy, or preview/runtime guardrails change

## 1. Why These Guardrails Exist

The project is intentionally split into many small phases.

Without a fixed completion protocol, phases are easy to leave half-done:

- code changes land without verification
- docs stop matching reality
- phase status becomes unclear
- the TODO area accumulates stale files

These guardrails exist to prevent that.

## 1.1 Documentation Classes

The repo now uses four documentation classes:

- `closed evidence`
- `living strategy`
- `generated operational ledger`
- `maintained reference`

Reference:

- [Documentation_Taxonomy.md](./Documentation_Taxonomy.md)

Rule:

- do not judge every markdown file by the same completion standard
- archived numbered phase files and fixed phase reports are `closed evidence`
- roadmap files are `living strategy`
- generated request and archive indexes are `generated operational ledger`
- generated repo-backed request-package READMEs are also `generated operational ledger`
- generated archive-package READMEs inside dated review archive directories are `closed evidence`
- guardrails, provider notes, runbooks, benchmark docs, and release guides are `maintained reference`

Meaning:

- `closed evidence` can be complete and archived
- `living strategy` remains open until explicitly closed or superseded
- `generated operational ledger` is truthful when it matches current manifests and archive records, not when it is "finished forever"
- `maintained reference` is healthy when current, not when frozen
- generated package READMEs should be refreshed through their generators or refresh commands, not hand-edited as if they were standalone authored docs

New-doc rule:

- when a new markdown file could easily be mistaken for the wrong class, state its document class explicitly inside the file
- this now also applies to roadmap direction files whenever folder-only semantics would make status ambiguous

Convention-only boundary:

- some evidence docs still intentionally rely on folder plus filename convention instead of inline labels
- current examples:
  - `Doc/TODOs/Archive/*.md`
  - `Doc/testing/Phase_*.md`
  - `Doc/testing/operator_reviews/*/interaction-audit-handoff-bundle.md`
  - `Doc/testing/theme_recovery_reviews/*/theme-recovery-summary.md`
- if one of these patterns starts causing status ambiguity, update the taxonomy and checker instead of continuing to rely on the old convention silently

## 1.2 Documentation Freshness Labels

Some docs need one more layer beyond class:

- `maintained current reference`
- `dated snapshot`
- `historical design baseline`

Use these labels when a reader might otherwise confuse:

- a current runbook with a one-time audit snapshot
- a current release guide with an old benchmark capture
- an original design baseline with the shipped product contract

Rule:

- use `Document class:` to state the class
- use `Freshness model:` when class alone is not enough
- use `Status note:` when the doc has one important truth boundary that should be obvious near the top

Default expectation:

- runbooks, checklists, and release guides should usually read as `maintained current reference`
- dated benchmark matrices and dated documentation audits should usually read as `dated snapshot`
- older design-baseline docs should usually read as `historical design baseline`

## 2. Phase Completion Rules

Every phase must follow this closeout sequence before it is considered complete.

### 2.1 Verification First

If the phase includes executable code changes:

- run unit tests for the changed code
- if no unit test exists yet, add one when practical
- if a unit test cannot be added in the phase, record the reason explicitly in the phase update

If the phase is research-only, planning-only, or documentation-only:

- run a validation checklist instead of a unit test
- validation can include link checking, fixture review, selector verification, or manual review against source material

Rule:

- a phase is not complete until it has a verification record

## 2.2 Documentation Update Required

After finishing a phase:

- update the relevant markdown files
- update any design or TODO document affected by the work
- update the phase status
- update cross-links if file locations changed

Minimum required updates:

- the phase file itself
- the phase index if the phase state changed
- any major design or TODO document whose assumptions changed
- any generated operational ledger or maintained reference doc whose current truth changed

## 2.3 Archive Completed Phase Files

When a phase is completed:

1. set the phase status to completed
2. add a short completion summary
3. record the verification performed
4. move the completed phase markdown file into `Doc/TODOs/Archive/`
5. update the phase index so it no longer appears as an active phase file

Reason:

- active TODO files should only contain work that is still open
- completed work should remain readable, but out of the active execution path

## 2.4 Splitting An Oversized Phase

If a phase turns out to be too large during implementation, it may and should be split into smaller subphases.

Examples:

- `16` can be split into `16.1`, `16.2`, `16.3`
- `09` can be split into `09.1`, `09.2`

Use this rule when:

- the phase cannot realistically be finished in one focused implementation turn
- the phase mixes unrelated deliverables
- the verification scope becomes unclear
- the file scope becomes too broad to review safely

Rule:

- split before continuing major implementation work
- do not keep a knowingly oversized phase as one file just to preserve the original numbering

## 2.5 Rules For Subphase Files

When splitting a phase:

1. keep the parent phase file as the umbrella or tracking file
2. create child subphase files for the actual executable slices
3. update the phase index to include the new subphases
4. update dependencies if the new subphases must run in sequence

Recommended convention:

- visible phase label inside the file: `Phase 16.1`
- filename: `16_1_Phase_Codex_...md`

Reason:

- this keeps sorting predictable on disk
- this avoids ambiguity with the final `.md` extension

Parent phase rule:

- if all work moves into subphases, the parent phase file should become a short index or umbrella note
- the parent should not duplicate detailed TODO items already moved into child files

## 2.6 Preview Service Rule

If a completed phase changes something that can be previewed in a browser or client UI, a preview service should be started or restarted as part of phase closeout.

Examples:

- side panel UI phases
- settings and navigation phases
- state-management phases that change visible behavior

Required behavior:

1. if a preview server is already running, restart it
2. bind it to a network-visible host when practical, typically `0.0.0.0`
3. report the access URL or host and port in the phase closeout summary
4. record the preview command used
5. keep the preview service running after phase closeout so the latest UI remains available for LAN or remote client review
6. prefer a stable port when practical so the inspection URL does not change every phase

Project convention:

- preview PID file: `.preview-server.pid`
- preview log file: `preview.log`

Reason:

- the user should be able to inspect the latest UI state after each previewable phase
- restarting avoids accidental inspection of stale output

## 2.7 RDP Chrome Unpacked Extension Rule

When using the RDP Chrome profile for real extension review:

1. run a fresh `vite build` first
2. go to `chrome://extensions`
3. manually reload the unpacked extension that points at `dist/`
4. close any already-open popup or side-panel extension pages
5. reopen the extension surfaces after the reload

Reason:

- the unpacked extension serves built files from `dist/`
- popup and side-panel HTML files still depend on the current built JS entry points under `dist/`
- after a new build, the unpacked extension can still be out of sync with the latest pushed source and rebuilt output until Chrome reloads it
- if Chrome is still holding an older unpacked extension package, the extension page can degrade into "background color only" or partial layout because CSS may load while the active JS entry no longer matches the current build output

Working assumption for this project:

- the preview server at `127.0.0.1:4173` is for fast UI inspection
- the RDP Chrome unpacked extension is the truthful runtime for extension-mode validation
- do not treat an unpacked-extension blank page as a styling bug until the extension has been reloaded after the latest build

## 2.8 Git Closeout Rule

After a completed phase or documentation-backed closeout:

1. stage the relevant changes
2. create one intentional git commit
3. push the current branch to the configured remote
4. run a fresh build so `dist/` matches the pushed source state

Default expectation:

- do this after each completed markdown-backed closeout unless the user explicitly pauses or overrides that workflow

Reason:

- documentation, pushed source, and built extension output should not drift apart
- the RDP Chrome unpacked extension depends on a truthful `dist/` directory
- the repo should not accumulate large unpushed local phase batches by accident

## 2.9 Generated Operational Ledger Rule

Generated request and archive indexes are not one-time closeout docs.

Rule:

1. prefer updating the generator or refresh command over hand-editing the generated markdown
2. if a generated ledger needs a wording or structure change, make that change in the generating script when practical
3. after changing a generated-ledger script, rerun the corresponding refresh command and commit the regenerated markdown

Reason:

- generated ledgers should remain reproducible
- hand-edited generated docs drift quickly and confuse later audits

## 2.10 Preferred Node Runtime Rule

This workstation may expose multiple `node` binaries, including bundled app runtimes that are older than the repo's supported floor.

Rule:

1. prefer `scripts/with-preferred-node.sh` for repo-backed `npm`, `node`, `vite`, `tsc`, and `vitest` commands
2. if `${HOME}/.local/node-current/bin/node` exists, let that runtime win over bundled editor runtimes
3. keep `package.json` scripts aligned with that wrapper when the preferred-node policy changes

Reason:

- Vite and the current toolchain require a supported Node runtime
- the local workstation may still have an older app-bundled `node` earlier in `PATH`
- repo-backed scripts should behave consistently across shell sessions, Codex runs, and RDP validation flows

## 3. Required Fields For A Completed Phase File

Before moving a phase file into the archive, make sure it includes:

- final status
- completion date
- short summary of what was done
- verification performed
- follow-up items, if any

Suggested completion footer:

```md
Completion date: YYYY-MM-DD

Completion summary:

- item 1
- item 2

Verification:

- unit tests: ...
- manual checks: ...

Follow-up:

- none
```

## 4. Rules For Verification

### 4.1 Code Phases

For code phases, prefer:

- unit tests
- type checks
- build checks
- small manual smoke tests in Chrome extension mode

Minimum expectation:

- at least one automated verification step must run

### 4.2 Research And Documentation Phases

For research or documentation phases, acceptable verification includes:

- verifying official source links
- verifying fixture files match the selected source path
- verifying the documented account-type decision is explicit
- verifying all affected docs were updated

Reason:

- requiring fake unit tests for non-code phases would create meaningless work

## 5. Rules For Status

Allowed active statuses:

- `not started`
- `in progress`
- `blocked`

Allowed completed status:

- `completed`

Rule:

- do not leave a finished phase at `not started` or `in progress`

## 6. Archive Rules

Archive location:

- `Doc/TODOs/Archive/`

Archive naming rule:

- keep the original filename
- do not rename the phase number unless there is a strong reason
- subphase files should preserve their parent-child numbering when archived

Archive purpose:

- preserve delivery history
- keep active TODO folders small
- make completed work auditable

## 7. Update Rules For The Phase Index

Whenever a phase is completed:

- remove it from the active sequence list or mark it as archived
- add a link to the archived file if it still needs to be discoverable
- keep dependency notes current

Whenever a phase is split into subphases:

- add the new subphases to the active sequence list
- update the parent phase entry so it is clearly an umbrella or split phase
- make the execution order explicit if `16.2` depends on `16.1`

## 8. My Recommendation On Your Proposal

Your proposal is reasonable, with one refinement:

- "finish a phase, then do unit testing" is correct for code phases
- for research-only or doc-only phases, replace unit testing with a required validation checklist

This refinement avoids forcing fake tests where no runnable code exists.

## 9. Additional Recommendations

- keep each phase small enough that one working session can finish it
- avoid starting the next provider before archiving the previous finished phase
- for provider integrations, save sanitized fixtures during the research phase so the adapter phase is faster
- add a short "verification" section to every completion note, even if the check was only a build and smoke test
- prefer one source of truth per rule, which is why this file should remain the workflow authority
- if a phase feels uncomfortable to finish in one turn, split it immediately instead of carrying the complexity forward
- if a phase changes the visible UI, treat preview restart as part of completion, not as an optional extra
