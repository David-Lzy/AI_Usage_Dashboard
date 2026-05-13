# Phase 402 - Operator Workspace 14-Locale Copy Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- inventory slice before operator-workspace runtime copy implementation

## Goal

Inventory operator-workspace copy that still relies on English fallback outside the already shipped shell slice, and define the exact implementation boundary for 14-locale translation.

## Scope

- Review `src/shared/operator-workspace-localized-copy.ts` and operator workspace consumers.
- Split translatable visible UI copy from protected evidence, export, request, route, preset, filename, and fixture identifiers.
- Produce or update an `Doc/I18n/` inventory for operator-workspace 14-locale copy.
- Update roadmap/backlog docs so `Phase 404` can implement without rediscovering scope.

## Preserved Boundaries

- Do not translate evidence payloads, request ids, archive ids, preset ids, filenames, route hashes, automation titles, generated evidence strings, or export schemas.
- Do not change interaction-audit or theme-recovery behavior.
- Do not implement runtime copy changes in this inventory phase.

## Acceptance

- Operator-workspace translatable buckets are listed by surface and helper.
- Protected raw/evidence fields are explicitly excluded.
- `Phase 404` has a narrow implementation checklist and verification plan.

## Planned Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with `Phase 403` store-helper runtime copy inventory.

## Closeout

Completed on 2026-05-13.

Summary:

- Reviewed `src/shared/operator-workspace-localized-copy.ts`, the interaction-audit route, the theme-recovery route, and their focused components.
- Added [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](../../../../I18n/I18n_Operator_Workspace_14_Locale_Copy_Inventory.md) as the maintained implementation boundary for `Phase 404`.
- Split approved helper-owned UI copy from consumer-only display labels that can move into the helper if the implementation remains narrow.
- Explicitly deferred export bodies, JSON schemas, request ids, route hashes, preset ids, filenames, generated command text, provider source-truth labels, raw diagnostics, action-badge text/title, and mixed presentation/export snapshot labels.
- Updated the deeper runtime copy backlog and Direction 09 roadmap references so the next operator implementation phase does not need to rediscover scope.

Verification:

- `npm run docs:check` passed.
- `git diff --check` passed.
