# Phase 497 - Quick Setup Source Mode Cards

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status:

- queued

## Goal

Update Quick Setup so every configurable provider exposes its available connection paths in a Material carousel card without depending on display-level mode.

## Scope

- Keep Quick Setup visible for all configurable providers.
- Show provider source modes as distinct paths inside the same provider card:
  - personal web-page or signed-in browser session
  - Team/Enterprise API when shipped or planned for that provider
  - Auto selection when the provider can choose the best available source
- Provide a clear Team/Enterprise API enablement or configuration entry inside the relevant provider card.
- Preserve the current carousel polish, keyboard behavior, reduced-motion handling, and provider-card hierarchy.
- Keep personal-user actions visually primary unless the user opens the API path.

## Preserved Boundaries

- Do not make Team/Enterprise API setup look required for personal users.
- Do not hide common provider setup behind Advanced, Developer, or Debug display levels.
- Do not change provider evidence, permissions, or API credential semantics.
- Do not remove existing source-card controls until the replacement is fully wired and tested.

## Acceptance

- A user can find common provider connection actions without changing the display level.
- API and web-page connection paths are visible as separate choices under the same provider.
- Advanced API configuration is progressively expanded and does not overwhelm the personal path.
- The Quick Setup provider list remains independent from dashboard display eligibility.
- New UI copy is queued for 14-locale coverage.

## Planned Verification

- Focused tests for `SettingsQuickSetupSection`.
- Keyboard and carousel render tests for source-mode cards.
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Use the source-mode contract from this phase when adding the display eligibility model in `Phase 498`.
