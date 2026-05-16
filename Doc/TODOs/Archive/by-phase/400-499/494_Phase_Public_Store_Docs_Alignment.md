# Phase 494 - Public Store Docs Alignment

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Align store copy, screenshot, localization, public repository, and privacy docs so the next human store handoff has one current source of truth.

## Scope

- Update `Doc/Store/README.md`.
- Refresh [Store_Listing_Copy_Pack.md](../../../../Store/Store_Listing_Copy_Pack.md).
- Refresh [Store_Listing_Localization_Source_Pack.md](../../../../Store/Store_Listing_Localization_Source_Pack.md).
- Keep generated screenshot request/archive indexes current through the screenshot completion workflow.
- Link public repository readiness with store handoff docs.

## Preserved Boundaries

- Do not mutate historical RC13 or RC22 milestones.
- Do not modify generated screenshot archive files by hand after generation.
- Do not change provider support scope, permissions, package version, or manifest version.

## Acceptance

- Store docs name the 2026-05-16 public-readiness archive as the current screenshot handoff.
- Store docs name the six-locale handoff as the current selected-language product-detail pack.
- Privacy/favicon permission language is aligned across public readiness, privacy policy, and store copy.
- Historical screenshot archives remain linked as historical evidence, not deleted.

## Verification

- `npm run docs:check`
- `npm run i18n:check`
- `git diff --check`

## Follow-Up

- Create a separate packaging phase if a new store zip is required after this documentation-only handoff.
