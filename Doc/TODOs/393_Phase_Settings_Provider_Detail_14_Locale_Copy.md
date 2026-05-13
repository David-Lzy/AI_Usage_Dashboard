# Phase 393 - Settings Provider Detail 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 392`
- second deeper runtime localization implementation slice

## Goal

Expand deeper Settings and provider-detail helper copy into 14-locale runtime catalogs while preserving raw source-truth boundaries.

## Scope

- Translate Settings helper text, Quick Setup helper copy, language/account/status controls, source-card helper labels, and provider-detail presentation labels selected by `Phase 391`.
- Keep provider-source display wrappers localizable while leaving adapter source-truth fields raw.
- Add focused tests for catalog completeness and representative Settings/provider-detail copy lookup.
- Update i18n docs with the completed Settings/provider-detail scope and remaining deferred buckets.

## Preserved Boundaries

- Do not translate diagnostic raw bodies, provider source raw text, page-capture snippets, archive/export payloads, or generated evidence files.
- Do not change locale resolution, stored locale preference shape, manifest `_locales`, or release packaging.
- Do not change Settings navigation, provider source selection, credential storage, page binding, or provider-detail data semantics.

## Acceptance

- Settings and provider-detail deeper copy selected by `Phase 391` has explicit 14-locale catalog coverage.
- Raw provider evidence continues to render as source truth, with localized wrappers only where already allowed.
- Arabic remains `rtl`; other locales remain `ltr`.
- No layout or behavior regression is introduced by longer localized strings.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Defer any operator-workspace or diagnostics-body localization until a separate phase confirms the raw-evidence boundary.
