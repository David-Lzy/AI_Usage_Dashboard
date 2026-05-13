# Phase 418 - Interaction Audit Remaining Presentation Copy Inventory

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 417`
- follow-up inventory from [I18n_Interaction_Audit_Presentation_Export_Split.md](../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

## Goal

Inventory the remaining interaction-audit strings after the frame-result 14-locale display slice, then classify each string as localized presentation copy, intentionally untranslated raw evidence, or a safe future localization candidate.

## Scope

- Review interaction-audit route and component strings in `src/sidepanel/routes/InteractionAuditPage.tsx`, `src/sidepanel/components/InteractionAudit*.tsx`, and `src/sidepanel/interaction-audit-surfaces.ts`.
- Classify surface titles, descriptions, action labels, action expectations, manual checks, iframe titles, jump feedback, import parse errors, generated signoff drafts, handoff drafts, archive/request ids, route ids, preset ids, selector names, filenames, and MIME types.
- Update `Doc/I18n/` inventory/backlog docs with a narrow list of remaining candidate slices.
- Keep this phase documentation-only unless a tiny classification helper is required by tests.

## Preserved Boundaries

- Do not translate generated signoff drafts, handoff drafts, request/archive schemas, route ids, preset ids, selector diagnostics, filenames, MIME types, or manual evidence payloads.
- Do not change runtime UI behavior, iframe readiness, preset execution, signoff state, export content, or import parsing.
- Do not start a broad localization implementation in this inventory phase; create follow-up TODOs for implementation slices.

## Acceptance

- `Doc/I18n/I18n_Interaction_Audit_Presentation_Export_Split.md` states which interaction-audit strings remain hard-coded and why.
- `Doc/I18n/I18n_Deeper_Runtime_Copy_Backlog.md` and `Doc/I18n/I18n_Operator_Workspace_14_Locale_Copy_Inventory.md` reflect the completed `Phase 417` frame-result display copy and the remaining candidate buckets.
- The phase index and top-level TODO docs point at this phase as active after `Phase 417`.
- No historical evidence or export schema is rewritten.

## Planned Verification

- `npm run docs:check`
- `rg 'Phase 417|Phase 418|frame-result|remaining interaction-audit' README.md Doc`
- `git diff --check`

## Follow-Up

- Use the resulting candidate list to split any remaining interaction-audit localization work into narrow implementation phases.
