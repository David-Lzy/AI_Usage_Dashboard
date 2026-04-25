# Phase 179 - Operator Workspace Shell Localization

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Localize the interaction-audit and theme-recovery operator workspace shell copy for the `en + zh_CN` runtime pilot while preserving archive-facing evidence semantics.

## Why This Phase Exists

`Phase 178` made the operator-workspace localization boundary explicit. This phase executes the safe first slice from that boundary: localize navigation, helper, and shell copy that helps an operator use the workspace, without translating export schemas, request identity, fixture ids, generated filenames, provider source-truth values, or archive-facing evidence strings.

## What Changed

- [localized-copy.ts](../../src/shared/localized-copy.ts) now includes `buildOperatorWorkspaceLocalizedCopy`
- [App.tsx](../../src/sidepanel/App.tsx) now hydrates locale preference for special debug routes and passes `runtimeI18n` into both operator workspaces
- [InteractionAuditPage.tsx](../../src/sidepanel/routes/InteractionAuditPage.tsx) now uses localized shell copy for the top bar, hero, guidance, signoff summary labels, and request-scope shell labels
- [ThemeRecoveryReviewPage.tsx](../../src/sidepanel/routes/ThemeRecoveryReviewPage.tsx) now uses localized shell copy for the top bar, hero, loading/error labels, current-truth labels, theme-state labels, request-scope labels, workflow steps, quick links, output actions, and generic feedback messages
- [phase179-operator-workspace-shell-localization-review.mjs](../../scripts/phase179-operator-workspace-shell-localization-review.mjs) now verifies the localized shell contract

## Truth Boundary

Evidence payloads remain English.

This phase intentionally does not localize:

- exported JSON field names
- generated evidence markdown
- request ids, archive ids, and request revision strings
- fixture and preset ids
- generated filenames
- provider source-truth values
- vendor-owned wording
- archive-facing status values that downstream scripts still treat as source truth

## Verification

- `npm run phase179:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

The next `Direction 09` slice should move to store-facing runtime helper copy and screenshot-adjacent captions. Deeper operator evidence copy should remain blocked until an archive-compatibility review decides whether localized strings are presentation-only or schema-affecting.
