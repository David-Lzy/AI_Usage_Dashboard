# Phase 178 - Operator Workspace I18n Boundary And Extraction

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Define the localization boundary for the interaction-audit and theme-recovery operator workspaces before translating them.

## Why This Phase Exists

The runtime pilot now covers the main product surfaces, value formatting, compact-width behavior, and the first RTL review hook. The remaining operator workspaces are different: they generate review evidence, request completions, handoff text, and archive inputs. Translating them without a boundary would risk mixing normal UI copy with evidence vocabulary that downstream scripts and archives still treat as source truth.

## What Changed

- [I18n_Operator_Workspace_Boundary_And_Extraction.md](../../I18n_Operator_Workspace_Boundary_And_Extraction.md) now defines the maintained boundary for operator workspace localization
- [phase178-operator-workspace-i18n-boundary-review.mjs](../../../scripts/phase178-operator-workspace-i18n-boundary-review.mjs) now verifies the boundary and writes a temporary extraction snapshot
- [I18n_String_Inventory_Baseline.md](../../I18n_String_Inventory_Baseline.md) now points the next extraction order to the first operator-workspace shell localization pass
- [I18n_Message_ID_Contract.md](../../I18n_Message_ID_Contract.md) now links operator workspace copy to the boundary reference until the first shell-localization slice lands
- Direction 09 roadmap files now mark the boundary review as completed and move the next implementation slice to operator-workspace shell localization

## Result

The repo now has a repeatable operator-workspace extraction review for:

- interaction-audit workspace
- theme-recovery workspace

The review records copy scale and categories in:

- `tmp/phase178-operator-workspace-i18n-boundary-review/operator-workspace-copy-inventory.json`

That artifact is intentionally temporary. The committed source of truth is the maintained boundary reference.

## Truth Boundary

This phase does not localize the operator workspaces yet.

The following stay English until a dedicated archive-compatibility decision is made:

- exported JSON field names
- request ids, archive ids, revision labels, and generated filenames
- fixture or preset ids
- vendor-owned strings and raw provider source-truth wording
- status terms already used as source-truth evidence labels in archives or request manifests

## Verification

- `npm run phase178:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

The next `Direction 09` implementation slice should localize the operator-workspace shell only:

- top bars
- section headings
- navigation and command labels
- non-evidence helper copy

Archive payload fields and generated evidence strings should remain out of scope for that slice.
