# Phase 138 - Roadmap Living Strategy Labeling And Check Coverage

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- remove the last major place where roadmap docs still relied only on folder-level semantics
- make the living-strategy class explicit across direction parent and child files

## Scope

This slice stays inside `Direction 08`.

It does not change runtime product behavior.

It updates:

- the remaining direction parent files under [Doc/Roadmap](../Roadmap/00_Strategic_Directions_Index.md)
- the remaining direction child TODO files under [Doc/Roadmap](../Roadmap/00_Strategic_Directions_Index.md)
- the taxonomy checker so it now verifies the whole roadmap set instead of only the strategic index

## What Changed

1. Remaining roadmap direction parent files now declare their class explicitly.

Applied outcome:

- the remaining direction parent files now carry:
  - `Document class: living strategy`
  - `Status note:` clarifying that they should be refreshed when direction state, priority, or completed slices change

2. Remaining roadmap direction child TODO files now declare their class explicitly.

Applied outcome:

- the remaining direction child TODO files now carry:
  - `Document class: living strategy`

Their existing `Status note:` sections were kept as the per-direction truth boundary.

3. The taxonomy checker now covers the whole roadmap set.

Updated script:

- [doc-taxonomy-check.mjs](../../scripts/lib/doc-taxonomy-check.mjs)

New review script:

- [phase138-roadmap-living-strategy-review.mjs](../../scripts/phase138-roadmap-living-strategy-review.mjs)

New command:

- `npm run phase138:review`

It now checks:

- the strategic directions index
- all remaining direction parent files
- all remaining direction child TODO files

## Truth Boundary

This slice makes the roadmap class explicit and executable.

It does not claim:

- that every markdown file in the repo now carries explicit class labels
- that all living docs should always prefer explicit labels over folder conventions
- that living-strategy files become closed evidence just because they are now labeled

The narrower truthful outcome is:

- the roadmap set no longer relies on folder semantics alone
- the repo can now check explicit class/status presence across the whole roadmap set

## Verification

- `npm run docs:check`
- `npm run phase138:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

## Follow-Up

Recommended next slice:

- decide whether any lower-priority living docs outside `Doc/Roadmap/` should remain convention-based or also join explicit checker coverage
