# Phase 393.2.1 - Settings Credentials 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393.2`
- active after the `Phase 393.2` split closeout

## Goal

Expand Settings credential helper copy into explicit 14-locale runtime copy.

## Scope

- Translate the `credentials` bucket in `src/shared/settings-localized-copy.ts`.
- Preserve provider names, API names, URLs, auth-header names, stored key values, workspace ids, and provider support claims.
- Add focused tests proving every non-English locale has representative translated credential copy while source-card and permission buckets remain on the next fallback boundary.
- Update i18n docs when the credential bucket is complete.

## Preserved Boundaries

- Do not change credential persistence, validation, save/clear actions, source preference, page binding, host-permission, or diagnostics behavior.
- Do not translate raw diagnostic bodies, provider source raw text, page-capture snippets, archive/export payloads, or generated evidence fields.
- Do not start source-card/permission copy; that remains `Phase 393.2.2`.

## Acceptance

- Settings credential helper copy has explicit 14-locale coverage.
- Non-credential Settings source and permission copy remains unchanged until `Phase 393.2.2`.
- Existing Settings credential and view-model behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/settings-localized-copy.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to Settings source-card and permission helper copy in `Phase 393.2.2`.
