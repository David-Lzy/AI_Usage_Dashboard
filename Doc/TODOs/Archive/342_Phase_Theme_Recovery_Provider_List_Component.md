# Phase 342 - Theme Recovery Provider List Component

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move the theme-recovery target-provider list rendering out of `ThemeRecoveryReviewPage.tsx` into one focused component.

## Scope

- Add a dedicated provider-list component under `src/sidepanel/components/`.
- Keep snapshot construction, target-provider classification, refresh behavior, exports, and feedback state owned by the route.
- Preserve existing provider card visible copy, status badge behavior, CSS classes, and `data-theme-recovery-provider*` hooks.

## Preserved Boundaries

- No provider adapter, source-state, permission, storage, theme, popup, release package, Chrome automation, or review export changes.
- No copy rewrite beyond moving existing rendering into the component.
- No changes to provider recovery classification.

## Acceptance

- `ThemeRecoveryReviewPage.tsx` renders target-provider cards through the new component.
- Provider visibility, recovery status, source state chips, last-sync label, recovery detail, and source detail render as before.
- The route no longer imports `StatusBadge` if the new provider-list component is its only consumer.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `ThemeRecoveryProviderList` for target-provider card rendering.
- Moved `StatusBadge` usage into the provider-list component so the route no longer owns provider-card presentation details.
- Kept snapshot construction, target-provider classification, refresh behavior, exports, and feedback state owned by `ThemeRecoveryReviewPage.tsx`.
- Preserved existing provider visible copy, CSS classes, recovery status, source chips, and `data-theme-recovery-provider*` hooks.

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future provider-list changes should use a behavior phase if they alter recovery classification or provider source semantics.
