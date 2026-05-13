# Phase 134 - Documentation Freshness Labels And Reference Status

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- turn the new documentation taxonomy into something visible inside the most ambiguity-prone non-generated docs
- distinguish maintained references from dated snapshots and historical baselines without pretending all dated docs are stale or incomplete

## Scope

This slice stays inside `Direction 08`.

It does not change runtime code or provider behavior.

It updates:

- one project-level freshness vocabulary in [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)
- one guardrail rule for freshness labeling in [Development_Guardrails.md](../Development_Guardrails.md)
- six ambiguity-prone docs that previously looked similar even though they should age differently:
  - [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../Archive/benchmarks/Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
  - [Documentation_Completion_Audit_2026-04-24.md](../Archive/audits/Documentation_Completion_Audit_2026-04-24.md)
  - [AI_Usage_Dashboard_MVP_Design.md](../Archive/baselines/AI_Usage_Dashboard_MVP_Design.md)
  - [Interaction_Audit_Operator_Handoff_Runbook.md](./Interaction_Audit_Operator_Handoff_Runbook.md)
  - [Theme_Recovery_Operator_Runbook.md](./Theme_Recovery_Operator_Runbook.md)
  - [Manual_Test_Checklist.md](./Manual_Test_Checklist.md)
  - [Release_Packaging_Guide.md](../Release_Packaging_Guide.md)

## What Changed

1. The taxonomy now defines one explicit freshness vocabulary.

New repo-level freshness labels:

- `maintained current reference`
- `dated snapshot`
- `historical design baseline`

2. The guardrails now require freshness labeling when class alone is not enough.

This makes it harder to confuse:

- a current runbook with a historical snapshot
- a release guide with a one-off benchmark capture
- the original MVP design with current shipped product truth

3. The most ambiguity-prone reference docs now self-label near the top.

Applied outcomes:

- the toolbar benchmark matrix is now a `maintained reference` with `dated snapshot` freshness
- the documentation completion audit is now explicitly fixed `closed evidence` with `dated snapshot` freshness
- the MVP design doc is now explicitly fixed `closed evidence` with `historical design baseline` freshness
- the interaction-audit runbook, theme-recovery runbook, manual checklist, and release guide are now all explicitly `maintained reference` docs with `maintained current reference` freshness

4. The active indexes now point at `Phase 134`.

Updated:

- [00_Phase_Index.md](../TODOs/00_Phase_Index.md)
- [00_Strategic_Directions_Index.md](../Roadmap/00_Strategic_Directions_Index.md)
- [AI_Usage_Dashboard_TODOs.md](../AI_Usage_Dashboard_TODOs.md)
- [Direction 08](../Roadmap/08_Direction_Documentation_Completion_And_Truth_Audit.md)
- [Direction 08 TODOs](../Roadmap/08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md)

## Truth Boundary

This slice improves documentation legibility only.

It does not claim:

- that all maintained references are now perfectly current forever
- that all older docs have been relabeled already
- that the broader `Doc/` tree is "complete"

The current truthful outcome is narrower:

- the repo now has one explicit class vocabulary
- the repo now also has one explicit freshness vocabulary
- the most ambiguity-prone benchmark, audit, design-baseline, runbook, checklist, and release docs are now labeled accordingly

## Verification

- reviewed the updated top-of-file labels in each touched reference or snapshot doc
- `git diff --check`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`

## Follow-Up

Recommended next slice:

- continue `Direction 08` with a smaller pass over remaining maintained-reference docs such as provider notes and other dated snapshot-style references
