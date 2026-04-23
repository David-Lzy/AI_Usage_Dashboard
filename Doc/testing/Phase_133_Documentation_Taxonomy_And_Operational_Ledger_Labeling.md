# Phase 133 - Documentation Taxonomy And Operational Ledger Labeling

Date: 2026-04-24

Status:

- completed

## Purpose

Execute the first real slice of `Direction 08` by formalizing documentation classes and applying that model to the repo's generated request and archive ledgers.

## What Was Done

- added one explicit taxonomy reference doc:
  - [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)
- updated [Development_Guardrails.md](../Development_Guardrails.md) with:
  - project documentation classes
  - generated operational ledger rules
- updated the generated interaction-audit and theme-recovery request and archive index builders so they now label themselves as:
  - `generated operational ledger`
- refreshed the generated markdown ledgers so they now carry that status explicitly:
  - [Interaction_Audit_Review_Requests.md](./Interaction_Audit_Review_Requests.md)
  - [Interaction_Audit_Review_Archive.md](./Interaction_Audit_Review_Archive.md)
  - [Theme_Recovery_Review_Requests.md](./Theme_Recovery_Review_Requests.md)
  - [Theme_Recovery_Review_Archive.md](./Theme_Recovery_Review_Archive.md)
- updated the documentation audit and roadmap docs to point at the new taxonomy

## Main Result

The repo now has one explicit answer to "what kind of document is this?"

That answer is no longer only implied by folder name.
It is now:

- defined centrally in taxonomy plus guardrails
- and surfaced directly inside the generated operational ledgers most likely to be misread as incomplete implementation work

## Verification

- refreshed generated ledgers with:
  - `npm run interaction-audit:refresh-review-request-index`
  - `npm run interaction-audit:refresh-archive-index`
  - `npm run theme-recovery:refresh-review-request-index`
  - `npm run theme-recovery:refresh-archive-index`
- ran targeted script-library tests covering request and archive index labeling
- ran full repo verification:
  - `tsc --noEmit`
  - `vitest`
  - `vite build`

## Follow-Up

- continue `Direction 08` with index cleanup and stale-date cleanup
- decide whether roadmap and maintained-reference docs should also expose an explicit `document class` line when ambiguity remains high
