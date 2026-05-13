# Phase 421 - Interaction Audit Surface Definition Display Source Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 420`
- high-risk implementation slice from the remaining interaction-audit presentation-copy inventory

## Goal

Separate localized surface-definition display copy from the English source-truth strings used by signoff exports and handoff drafts.

## Scope

- Add a localized presentation map for surface titles, descriptions, action labels, action expectations, and manual checks.
- Render localized surface copy in interaction-audit UI surfaces.
- Keep `INTERACTION_AUDIT_SIGNOFF_SURFACES`, signoff export JSON, signoff Markdown drafts, and handoff Markdown drafts on the current English source values unless a later explicit export-localization phase changes that contract.
- Keep route ids, surface ids, action ids, preset ids, data attributes, iframe sources, and automation selectors unchanged.

## Preserved Boundaries

- Do not translate generated signoff drafts or handoff drafts.
- Do not change export schemas, archive/request schemas, filenames, MIME types, localStorage keys, or request binding/revision formatting.
- Do not change iframe readiness or preset execution behavior.

## Acceptance

- Visible interaction-audit surface definitions have explicit display copy for all 14 runtime locales.
- Export JSON and generated Markdown snapshots remain byte-compatible for existing English source-truth values in focused tests.
- Review Queue and Handoff Summary use display titles only for UI presentation, not export evidence.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit signoff/export tests
- focused interaction-audit surface rendering tests if present or added
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Revisit whether any generated-preview-only localized draft should exist separately from downloadable export evidence.
