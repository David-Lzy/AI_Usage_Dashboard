# Phase 136 - Doc Taxonomy Consistency Check And Index Labeling

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- stop `Direction 08` from relying only on manual spot-checks
- make the most important taxonomy and freshness-label rules executable through one lightweight repo check

## Scope

This slice stays inside `Direction 08`.

It does not change runtime product behavior.

It updates:

- key top-level index and backlog docs:
  - [AI_Usage_Dashboard_TODOs.md](../AI_Usage_Dashboard_TODOs.md)
  - [00_Strategic_Directions_Index.md](../Roadmap/00_Strategic_Directions_Index.md)
  - [00_Phase_Index.md](../TODOs/00_Phase_Index.md)
- the taxonomy and guardrails so they clearly cover those docs too
- one new repeatable documentation check:
  - `npm run docs:check`

## What Changed

1. Key index and backlog docs now declare their role explicitly.

Applied outcomes:

- [AI_Usage_Dashboard_TODOs.md](../AI_Usage_Dashboard_TODOs.md) is now explicitly a `maintained reference`
- [00_Phase_Index.md](../TODOs/00_Phase_Index.md) is now explicitly a `maintained reference`
- [00_Strategic_Directions_Index.md](../Roadmap/00_Strategic_Directions_Index.md) is now explicitly `living strategy`

2. The repo now has one executable taxonomy check.

New scripts:

- [check-doc-taxonomy.mjs](../../scripts/check-doc-taxonomy.mjs)
- [doc-taxonomy-check.mjs](../../scripts/lib/doc-taxonomy-check.mjs)
- [doc-taxonomy-check.test.mjs](../../scripts/lib/doc-taxonomy-check.test.mjs)
- [phase136-doc-taxonomy-consistency-review.mjs](../../scripts/phase136-doc-taxonomy-consistency-review.mjs)

New commands:

- `npm run docs:check`
- `npm run phase136:review`

3. The check enforces the current high-value documentation rules.

It verifies:

- required `Document class` labels on the key maintained-reference, living-strategy, and generated-ledger docs
- required `Freshness model` plus `Status note` labels on the maintained-reference and snapshot docs that now depend on them
- `latest completed slice` in [00_Phase_Index.md](../TODOs/00_Phase_Index.md) still matches the highest archived numbered phase file

4. The check writes one repeatable review artifact.

Output:

- [phase136-results.json](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/tmp/phase136-doc-taxonomy-consistency-review/phase136-results.json)

## Truth Boundary

This slice makes the current doc-taxonomy rules easier to enforce.

It does not claim:

- that every markdown file in `Doc/` now carries explicit class and freshness labels
- that the check covers every possible stale-doc failure mode
- that generated operator request-package README files need the same label treatment as top-level maintained references

The narrower truthful outcome is:

- the highest-value maintained-reference and index docs are now labeled consistently
- the repo now has one lightweight executable check for those rules
- `Direction 08` is now partially automated rather than purely descriptive

## Verification

- `npm run docs:check`
- `npm run phase136:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

## Follow-Up

Recommended next slice:

- decide whether the remaining unlabeled living-strategy docs should stay folder-implied by convention or gain explicit class lines too
