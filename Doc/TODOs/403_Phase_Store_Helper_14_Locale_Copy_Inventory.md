# Phase 403 - Store Helper 14-Locale Copy Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 402`
- inventory slice before store-helper runtime copy implementation

## Goal

Inventory store-helper route copy that still relies on English fallback outside the current helper slice, and define the safe 14-locale implementation boundary.

## Scope

- Review `src/shared/store-workflow-localized-copy.ts` and store screenshot helper consumers.
- Separate translatable helper UI from protected automation identity and screenshot truth-boundary fields.
- Produce or update an `Doc/I18n/` inventory for store-helper 14-locale copy.
- Update roadmap/backlog docs so `Phase 405` can implement without rediscovering scope.

## Preserved Boundaries

- Do not translate automation titles, preset ids, route hashes, final screenshot surfaces, request ids, archive ids, filenames, or generated capture evidence.
- Do not change screenshot capture plans, route configs, archive schemas, or Chrome Web Store listing source text.
- Do not implement runtime copy changes in this inventory phase.

## Acceptance

- Store-helper translatable buckets are listed by route and helper.
- Protected automation/evidence fields are explicitly excluded.
- `Phase 405` has a narrow implementation checklist and verification plan.

## Planned Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with `Phase 404` operator-workspace 14-locale copy implementation.
