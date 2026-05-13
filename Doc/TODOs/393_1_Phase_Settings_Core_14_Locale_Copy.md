# Phase 393.1 - Settings Core 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393`
- active after the `Phase 393` split closeout

## Goal

Expand the high-exposure Settings core helper copy into explicit 14-locale runtime copy.

## Scope

- Translate `layout`, `quickSetup`, `preferences`, and `themeCustomization` buckets in `src/shared/settings-localized-copy.ts`.
- Preserve glossary terms for provider names, product names, Settings, Quick Setup, provider, source, sync, policy-only, host access, credentials, and live sync.
- Add focused Settings localized-copy tests proving every non-English locale has representative translated Settings core copy.
- Update i18n docs when the Settings core bucket is complete.

## Preserved Boundaries

- Do not change Settings navigation, user-level behavior, provider enablement, host-permission prompts, credential storage, page binding, or sync behavior.
- Do not translate provider raw evidence, diagnostic raw bodies, route ids, action ids, stored keys, workspace ids, URLs, filenames, archive/export payloads, or vendor-owned strings.
- Do not start credentials/source-card/provider-detail copy; those remain `Phase 393.2` and `Phase 393.3`.

## Acceptance

- Settings core helper copy has explicit 14-locale coverage.
- English fallback for these buckets remains only for `en`.
- Existing Settings view-model behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/settings-localized-copy.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to Settings credentials, source-card helper labels, and permission helper copy in `Phase 393.2`.
