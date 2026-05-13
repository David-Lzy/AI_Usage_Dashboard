# Phase 393.3.2 - Provider Source Display 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393.3`
- completed and archived on 2026-05-13

## Goal

Expand provider-source display wrapper copy into explicit 14-locale runtime copy.

## Scope

- Translate safe wrapper copy in `src/shared/provider-source-display-localized-copy.ts`.
- Cover source-kind labels, preference labels, rollout labels, availability labels, fidelity/connection/contract wrappers, credential/cookie/manual-import wrappers, host-access wrappers, source-state wrappers, page-binding wrappers, and generated availability summary.
- Add focused tests proving every non-English locale has representative translated provider-source display copy.
- Update i18n docs when the provider-source display bucket is complete.

## Preserved Boundaries

- Do not translate raw `sourceSelectionReason`, `sourceFallbackReason`, adapter raw body text, page-capture snippets, host labels, URLs, route hints, provider ids, or archive/export schemas.
- Do not change source-selection semantics, fallback semantics, diagnostic construction, locale resolution, or provider support claims.
- Do not start diagnostics-body, operator-workspace, or store-helper localization.

## Acceptance

- Provider-source display wrapper copy has explicit 14-locale coverage.
- Raw evidence and diagnostic bodies remain source truth and are not localized.
- Existing source-display and Settings source-card behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts`
- `npm run test -- src/shared/provider-sources.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to `Phase 394` maintenance hotspot audit before any module-splitting implementation.

## Closeout

Completed on 2026-05-13.

Summary:

- Added explicit 14-locale provider-source display wrapper copy through `src/shared/provider-source-display-extended-localized-copy.ts`.
- Wired `buildProviderSourceDisplayLocalizedCopy` so every shipped non-English locale now receives translated source kind/preference labels, rollout labels, availability labels, fidelity/connection/contract wrappers, credential/cookie/manual-import wrappers, host-access wrappers, source-state wrappers, page-binding wrappers, and generated availability summaries.
- Preserved raw `sourceSelectionReason`, `sourceFallbackReason`, diagnostic raw bodies, source evidence fields, provider ids, host labels, URLs, route hints, archive/export schemas, and source-selection/fallback semantics unchanged.

Verification:

- `npm run i18n:check`
- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts`
- `npm run test -- src/shared/provider-sources.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
