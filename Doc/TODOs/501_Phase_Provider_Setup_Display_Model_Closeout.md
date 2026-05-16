# Phase 501 - Provider Setup Display Model Closeout

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

## Follow-Up

- Decide whether the completed model cleanup should be packaged as a post-RC22 release candidate.
- Keep account-gated provider expansion separate from this display-model cleanup queue.
