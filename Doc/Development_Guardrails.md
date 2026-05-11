# Development Guardrails

Date: 2026-05-11

Process rule:

- follow [Project_Quickstart.md](./Project_Quickstart.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the canonical tracked workflow reference for project contributors and coding agents
- refresh it whenever phase selection, verification, closeout, release, or generated-ledger rules change

## Scope

- `Doc/` holds product truth, roadmap, workflow, runbooks, milestones, generated ledgers, and historical evidence
- root entry points are [../AGENTS.md](../AGENTS.md), [../CLAUDE.md](../CLAUDE.md), and [../README.md](../README.md)
- local `.agent/` content may exist, but it is optional helper material only

## Required Reading Before A Work Cycle

Read these in order:

1. [TODOs/00_Phase_Index.md](./TODOs/00_Phase_Index.md)
2. the active phase file named there, if one exists
3. [AI_Usage_Dashboard_TODOs.md](./AI_Usage_Dashboard_TODOs.md)
4. [Roadmap/00_Strategic_Directions_Index.md](./Roadmap/00_Strategic_Directions_Index.md)
5. [../README.md](../README.md)
6. any provider note, testing report, milestone, or contract doc linked by the active phase
7. [Documentation_Taxonomy.md](./Documentation_Taxonomy.md) if the task changes documentation layout or generated ledgers

## Task Selection

1. Start with the active phase in the phase index.
2. If no active phase exists, choose the highest-priority local-safe item from the top-level TODOs and roadmap.
3. Prefer one coherent slice at a time.
4. Keep runtime work, release packaging, documentation migration, and screenshot workflow changes separate when practical.

## Implementation Rules

1. Inspect the current repo state and target files before editing.
2. Never overwrite, revert, or delete user changes unless explicitly asked.
3. Prefer existing React, TypeScript, storage, provider, i18n, and CSS-module patterns.
4. Keep provider truth labels and source-selection semantics honest.
5. Do not store or request raw cookies, copied auth headers, full API keys, or other session secrets in docs or fixtures.
6. For page-backed providers, use truthful page-context extraction from real logged-in surfaces.
7. Prefer generator changes over hand-editing generated ledgers.

## Verification Rules

For documentation-only work:

- `npm run docs:check`
- `git diff --check`

For runtime or script work, run the smallest relevant set from:

- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- focused review script or smoke check for the changed path
- `git diff --check`

Additional rules:

- add focused tests for behavior changes when practical
- if a check cannot run, record the exact reason in the phase closeout or handoff
- when changing generated-doc scripts, verify both the generator and a produced artifact or focused test

## Phase Closeout

Before calling a phase complete:

1. update the phase file with completion status, summary, verification, and follow-up
2. update the phase index
3. update README, TODOs, roadmap, provider notes, or runbooks when their current truth changed
4. archive completed phase files under `Doc/TODOs/Archive/`
5. rerun the required verification after doc updates
6. commit a coherent slice with a clear message

## Release And Extension Review

- build first
- reload the unpacked extension from `dist/`
- close stale popup, side-panel, and full-page extension windows
- reopen the surfaces after reload
- do not diagnose a blank unpacked surface as a styling bug until the extension has been rebuilt and reloaded
