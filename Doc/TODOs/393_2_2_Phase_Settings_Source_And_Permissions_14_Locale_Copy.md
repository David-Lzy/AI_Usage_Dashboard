# Phase 393.2.2 - Settings Source And Permissions 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393.2`
- queued after `Phase 393.2.1`

## Goal

Expand Settings source-card and permission helper copy into explicit 14-locale runtime copy.

## Scope

- Translate the `sources` and `permissions` buckets in `src/shared/settings-localized-copy.ts`.
- Preserve source ids, preference ids, route hints, host labels, raw diagnostic bodies, and provider source-truth text.
- Add focused tests proving every non-English locale has representative translated source and permission copy.
- Update i18n docs when the source/permission bucket is complete.

## Preserved Boundaries

- Do not change source preference, host-permission prompts, page binding, diagnostics behavior, provider support claims, or raw evidence rendering.
- Do not translate provider raw evidence, archive/export payloads, generated evidence fields, route ids, or source ids.
- Do not start Provider Detail or provider-source wrapper copy; that remains `Phase 393.3`.

## Acceptance

- Settings source-card and permission helper copy has explicit 14-locale coverage.
- Raw provider evidence continues to render unchanged beside localized wrappers.
- Existing Settings source-card and quick-setup view-model behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/settings-localized-copy.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to Provider Detail and provider-source display wrapper copy in `Phase 393.3`.
