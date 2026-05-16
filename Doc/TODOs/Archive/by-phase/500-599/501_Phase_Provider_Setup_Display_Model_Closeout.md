# Phase 501 - Provider Setup Display Model Closeout

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status:

- completed

## Goal

Close the provider setup/display model cleanup with documentation, localization, regression tests, and representative visual QA.

## Scope

- Update README, top-level TODO, roadmap, and Product docs with the final Quick Setup versus Provider Display contract.
- Add or update 14-locale runtime copy for source-mode cards, display eligibility, provider order, and quota item summaries.
- Run representative visual QA for Settings, popup, side panel dashboard, provider detail, and full-page tab.
- Confirm the final behavior across connected, hidden, policy-only, deferred, and no-quota-item provider states.
- Record any remaining provider-specific account-gated work as follow-up, not as hidden behavior drift.

## Preserved Boundaries

- Do not package a release zip unless a separate packaging phase is opened.
- Do not change Chrome Web Store submitted-review history.
- Do not broaden provider support claims.
- Do not translate raw diagnostic bodies, provider evidence, or export schemas.

## Acceptance

- Project docs describe Quick Setup as provider connection/source-mode setup and Provider Display as dashboard visibility/order/quota configuration.
- All new user-facing copy has 14-locale catalog coverage.
- Settings, popup, side panel, and full-page tab pass focused regression tests.
- Visual QA finds no obvious provider-card overflow, ordering mismatch, or RTL overlap.
- Required verification commands pass.

## Planned Verification

- `npm run docs:check`
- `npm run i18n:check`
- Focused tests for Settings Quick Setup, Provider Order, Provider Progress Items, popup view-models, and sidepanel view-models.
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Completion Summary

- Closed the provider setup/display cleanup queue by aligning README, Product docs, Roadmap, top-level TODOs, and phase indexes through Phase 501.
- Confirmed the final product contract: Quick Setup remains the provider connection and source-mode entry point; Provider Display owns dashboard visibility, surface order, and quota item visibility for visible display-eligible providers.
- Confirmed no new runtime copy was introduced during Phases 498-500 beyond already-covered localized source/display copy; the 14-locale i18n checker passed.
- Verified Settings Quick Setup, Provider order, Provider progress items, Settings Provider Display, popup view-models, and sidepanel view-models with focused tests.
- Visual QA note: Phases 498-500 changed filtering and state eligibility only, not CSS/layout. No new RDP screenshots were generated in this closeout; the existing public-readiness screenshot archive remains the current visual evidence, and render/build checks did not expose provider-card overflow or ordering drift.

## Verification

- `npm run test -- src/sidepanel/components/SettingsQuickSetupSection.test.tsx src/sidepanel/components/ProviderOrderPreferenceControls.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/popup/view-models.test.ts src/sidepanel/view-models.test.ts src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Decide whether the completed model cleanup should be packaged as a post-RC22 release candidate.
- Keep account-gated provider expansion separate from this display-model cleanup queue.
