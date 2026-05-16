# Phase 496 - Provider Setup Display Product Contract

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status:

- active

## Goal

Define the product contract that separates provider connection setup from dashboard display controls before changing runtime behavior.

## Scope

- Document the separate meanings of:
  - provider setup availability
  - source mode selection
  - dashboard/display visibility
  - per-surface provider order
  - per-surface quota item visibility
- State that Quick Setup is a connection and source-mode entry point, not a display-level gated advanced section.
- State that `show in dashboard` controls whether a connected/displayable provider appears in product surfaces, not whether background sync or source binding is enabled.
- Clarify that Team/Enterprise API and personal web-page flows are source modes under the same provider rather than competing provider identities.
- Define special-case display rules for deferred, policy-only, and partially connected providers.

## Preserved Boundaries

- Do not change runtime code in this phase.
- Do not change storage schema or migrate existing settings.
- Do not change provider source-truth, permission, diagnostic, or export payload contracts.
- Do not make JetBrains, Gemini, or any other provider appear more supported than the current shipped evidence allows.

## Acceptance

- The new contract clearly says Quick Setup is not controlled by display level.
- The contract clearly says `show in dashboard` is not equivalent to sync-enabled.
- JetBrains deferred state is documented as not eligible for display ordering until it has displayable data.
- Gemini policy-only behavior is documented separately from live quota providers.
- Follow-up implementation phases can reference this document without re-deciding the product model.

## Planned Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Implement the source-mode card UI in `Phase 497`.
- Implement the display eligibility model in `Phase 498`.
- Align surface ordering, quota item visibility, and QA in `Phase 499` through `Phase 501`.
