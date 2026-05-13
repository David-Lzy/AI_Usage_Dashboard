# Phase 175 - Deeper Settings Helper Localization

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Extend the `en + zh_CN` runtime i18n pilot deeper into Settings so helper copy is no longer almost entirely English below the first settings-shell slice.

## Why This Slice Existed

- `Phase 173` localized the first settings-shell slice but not deeper helper text
- `Phase 174` localized popup explanatory copy plus provider-detail shell/static copy, but left deeper settings helper copy outside the shipped pilot
- the next honest runtime i18n slice had to keep widening the same shared architecture instead of jumping to more locales or to operator workspaces too early

## What Changed

- extended [src/shared/localized-copy.ts](../../../../../src/shared/localized-copy.ts) with one shared `buildSettingsLocalizedCopy` helper plus localized source-preference labels for Settings
- updated [src/sidepanel/routes/SettingsPage.tsx](../../../../../src/sidepanel/routes/SettingsPage.tsx) so deeper settings helper copy now localizes:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and detailed diagnostic group/field labels
  - permission-prompt status and action labels
- updated [src/sidepanel/settings-view-models.ts](../../../../../src/sidepanel/settings-view-models.ts) so settings source-card models can consume localized helper labels without rebuilding the underlying source-display contract
- updated [src/sidepanel/components/PermissionPrompt.tsx](../../../../../src/sidepanel/components/PermissionPrompt.tsx) so host-access prompts can render localized state and action copy
- extended verification in:
  - [src/shared/i18n.test.ts](../../../../../src/shared/i18n.test.ts)
  - [src/sidepanel/settings-view-models.test.ts](../../../../../src/sidepanel/settings-view-models.test.ts)
  - [phase175-settings-helper-localization-review.mjs](../../../../../scripts/phase175-settings-helper-localization-review.mjs)
- refreshed the maintained i18n references, `Direction 09`, README, the strategic index, the top-level TODO, and the phase index to reflect the broader but still partial runtime pilot boundary

## Result

The runtime i18n pilot now reaches popup shell, popup explanatory copy, dashboard shell, the first settings-shell slice, deeper settings helper copy, provider-detail shell/static copy, and locale-aware generated values under one shared `en + zh_CN` architecture.

## Truth Boundary

- this slice does not yet localize durations or relative freshness phrasing
- this slice does not yet localize operator workspaces
- this slice still leaves raw provider source-truth detail strings closer to the current product/source contract when translating them would risk misrepresenting the underlying state
- non-parseable vendor-owned strings still remain raw source-truth values

## Verification

- `npm run phase175:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- localize durations plus relative freshness phrasing
- then harden compact-width translation QA and explicit RTL review before any broader locale-tier expansion
- then decide how much raw provider source-truth detail should remain intentionally untranslated
