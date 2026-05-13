# Phase 388 - Current Truth Drift Closeout

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Align current project documentation with the post-`Phase 387` source truth before more runtime or release work starts.

## Scope

- Update current-state sections in `README.md`, `Doc/AI_Usage_Dashboard_TODOs.md`, and `Doc/Roadmap/00_Strategic_Directions_Index.md`.
- Correct current roadmap notes that still describe fulfilled operator/theme review work or store screenshot work as pending.
- Align current process references with the bucketed archive paths under `Doc/TODOs/Archive/by-phase/` and `Doc/testing/Archive/phase-reports/`.
- Record any ignored local `.agent/` drift as local-only process material, not as shared repository truth.

## Preserved Boundaries

- Do not rewrite historical phase closeouts, generated review ledgers, request packages, or archive evidence only to modernize wording.
- Do not change runtime code, package bytes, release artifacts, manifest data, or provider support claims.
- Do not force-add ignored `.agent/` files unless a separate explicit decision makes them tracked project material.

## Acceptance

- Current maintained docs no longer claim that the fulfilled interaction-audit or theme-recovery operator requests are still `1 pending / 0 fulfilled`.
- Current maintained docs no longer describe the refreshed store screenshot pack as pending when the archived pack is the current evidence boundary.
- Current maintained docs refer to bucketed archive paths where they describe active process rules.
- The active/queued phase state in the README, top-level TODOs, strategic roadmap index, and phase index agrees.

## Planned Verification

- `rg '1 pending / 0 fulfilled|0 fulfilled real operator|no numbered phase is currently queued after `Phase 387`' README.md Doc/AI_Usage_Dashboard_TODOs.md Doc/Roadmap`
- `rg --glob '!Doc/TODOs/Archive/**' 'Doc/testing/Phase_|Doc/TODOs/Archive/[0-9]' README.md Doc scripts package.json`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Updated current-truth roadmap and README sections that still described fulfilled interaction-audit, theme-recovery, or store screenshot work as pending.
- Converted the closed Direction 04.2 and Direction 05.2 child TODOs from future-gap wording into closure records.
- Refreshed Direction 08, Direction 10, and the strategic index so they point at current generated-ledger truth instead of older pending-request states.
- Left historical phase narratives intact when they describe what was true at the time.
- Confirmed the ignored local `.agent/` docs still contain older archive-path examples; because `.agent/` is not tracked shared truth, this phase records the drift but does not force-add local process files.

## Verification

- `rg '1 pending / 0 fulfilled|0 fulfilled real operator|no numbered phase is currently queued after `Phase 387`' README.md Doc/AI_Usage_Dashboard_TODOs.md Doc/Roadmap`
  - no matches
- `rg --glob '!Doc/TODOs/Archive/**' 'Doc/testing/Phase_|Doc/TODOs/Archive/[0-9]|Doc/TODOs/Archive/\*\.md|Doc/testing/Phase_\*\.md' README.md AGENTS.md CLAUDE.md Doc scripts package.json`
  - only the Phase 388 planned-verification note matched before archive closeout
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start `Phase 389` for the Markdown link-check guard.
