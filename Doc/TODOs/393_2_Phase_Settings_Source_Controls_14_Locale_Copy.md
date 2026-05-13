# Phase 393.2 - Settings Source Controls 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393`
- queued after `Phase 393.1`

## Goal

Expand Settings credential, source-card, and permission helper copy into explicit 14-locale runtime copy.

## Scope

- Translate `credentials`, `sources`, and `permissions` buckets in `src/shared/settings-localized-copy.ts`.
- Preserve provider names, API names, host labels, route hints, URLs, source ids, preference ids, and stored credential values.
- Add focused tests proving every non-English locale has representative translated credential/source/permission copy.
- Update i18n docs when the Settings source-control bucket is complete.

## Preserved Boundaries

- Do not change credential persistence, page binding, source preference, host-permission, or diagnostics behavior.
- Do not translate raw diagnostic bodies, provider source raw text, page-capture snippets, archive/export payloads, or generated evidence fields.
- Do not start Provider Detail or provider-source wrapper copy; that remains `Phase 393.3`.

## Acceptance

- Settings credential/source/permission helper copy has explicit 14-locale coverage.
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
