# Phase 139 - Doc Taxonomy Boundary And Convention-Only Policy

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Purpose:

- stop `Direction 08` from expanding labels indefinitely without an explicit stopping rule
- make the remaining unlabeled evidence artifacts an intentional policy boundary instead of an ambiguous omission

## Scope

This slice stays inside `Direction 08`.

It does not change runtime product behavior.

It updates:

- the documentation taxonomy
- the development guardrails
- the taxonomy checker output

## What Changed

1. The repo now states an explicit convention-only boundary.

Defined patterns:

- `Doc/TODOs/Archive/by-phase/*/*.md`
- `Doc/testing/Archive/phase-reports/*/Phase_*.md`
- `Doc/testing/operator_reviews/*/interaction-audit-handoff-bundle.md`
- `Doc/testing/theme_recovery_reviews/*/theme-recovery-summary.md`

These remain intentionally classified by stable folder plus filename convention instead of by inline class labels.

2. The checker now exposes that policy boundary directly.

Updated script:

- [doc-taxonomy-check.mjs](../../../../../scripts/lib/doc-taxonomy-check.mjs)

Updated test:

- [doc-taxonomy-check.test.mjs](../../../../../scripts/lib/doc-taxonomy-check.test.mjs)

New review script:

- [phase139-doc-taxonomy-boundary-review.mjs](../../../../../scripts/phase139-doc-taxonomy-boundary-review.mjs)

New command:

- `npm run phase139:review`

The checker output now includes the current `conventionOnlyPatterns` list, so the remaining unlabeled docs are visible as a documented policy choice.

3. The taxonomy and guardrails now explain why those files stay unlabeled.

Applied outcome:

- the repo now distinguishes between docs that still need explicit inline identity and evidence artifacts that already live in strongly classed locations
- future contributors now have a clear promotion rule: if one convention-only pattern becomes ambiguous in practice, move it into explicit labeling or checker coverage

## Truth Boundary

This slice defines a stopping rule for explicit-label expansion.

It does not claim:

- that unlabeled docs are always fine forever
- that the convention-only boundary can never change
- that companion evidence artifacts are less important than labeled docs

The narrower truthful outcome is:

- the remaining unlabeled evidence artifacts are now an explicit and reviewable policy boundary
- future expansion beyond that boundary now needs a reason, not just inertia

## Verification

- `npm run docs:check`
- `npm run phase139:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

## Follow-Up

Recommended next slice:

- decide whether any remaining low-value generated or historical docs should stay under the convention-only boundary or be promoted into explicit labeling only when they start causing real ambiguity
