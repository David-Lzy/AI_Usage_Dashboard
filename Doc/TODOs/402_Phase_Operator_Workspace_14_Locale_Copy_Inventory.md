# Phase 402 - Operator Workspace 14-Locale Copy Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 401`
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
