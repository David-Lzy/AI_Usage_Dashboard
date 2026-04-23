# Phase 112 - Theme Recovery Review Workspace

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Turn the remaining `Direction 05` honesty gap into a real operator-facing tool instead of another abstract TODO:

- add one dedicated workspace for native-prompt or real-session theme recovery follow-up
- surface the current shared theme state, recovery state, scope-isolation truth, popup snapshot, and action-badge summary in one place
- expose direct links to the shipped extension surfaces plus the target Cursor and Codex session pages
- make the current review state copyable as markdown and JSON without claiming that a real operator pass already happened

## What Shipped

- new operator workspace route:
  - `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review`
- new runtime page:
  - `src/sidepanel/routes/ThemeRecoveryReviewPage.tsx`
- new snapshot and export helper:
  - `src/sidepanel/theme-recovery-review.ts`
- new unit coverage:
  - `src/sidepanel/theme-recovery-review.test.ts`
- new repeatable review script:
  - `scripts/phase112-theme-recovery-review-workspace-review.mjs`
- new npm entry:
  - `npm run phase112:review`
- new operator runbook:
  - `Doc/testing/Theme_Recovery_Operator_Runbook.md`
- machine-readable artifacts:
  - `tmp/phase112-theme-recovery-review-workspace-review/phase112-results.json`

## Assertions Covered

The new workspace now shows, in one operator-facing route:

- the saved:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- the current popup snapshot label plus detail
- the computed action-badge state, and the live action-badge state when that API is readable in extension mode
- one scope-isolation truth layer:
  - `Cursor + Codex isolated`
  - `Additional providers visible`
  - `Scope incomplete`
- one overall recovery-stage truth layer:
  - `Needs access`
  - `Needs scope cleanup`
  - `Recovered`
  - `Sync issue`
- one target-provider status card for:
  - `Cursor`
  - `Codex`
- direct links to:
  - Settings
  - Dashboard
  - Cursor detail
  - Codex detail
  - popup
  - Cursor usage page
  - Codex analytics page
- copyable outputs:
  - summary draft
  - JSON export

This phase still does **not** claim:

- a native host-permission prompt was completed
- a real live vendor session was already reverified
- a human operator signoff already exists

It only ships the workspace that makes that later pass concrete and repeatable.

## Verification

The following commands passed after `Phase 112` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/theme-recovery-review.test.ts
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase112:review
curl -I http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review
```

Verification summary:

- typecheck passed
- new unit coverage passed
- production build passed
- preview route returned `200 OK`
- `phase112:review` passed

Observed `phase112` scenarios under the same saved custom seed `#4F46E5`:

- `light-degraded-isolated`
  - review stage: `Needs access`
  - popup snapshot: `Mixed state`
  - badge text: `2`
  - scope label: `Cursor + Codex isolated`
- `dark-recovered-isolated`
  - review stage: `Recovered`
  - popup snapshot: `Aligned`
  - badge text: `cleared`
  - scope label: `Cursor + Codex isolated`
- `light-recovered-extra-provider`
  - review stage: `Needs scope cleanup`
  - popup snapshot: `Mixed state`
  - badge text: `1`
  - scope label: `Additional providers visible`

The repeatable review also proved:

- the workspace summary draft stays aligned with the visible review stage
- the route links stay bound to the shipped extension routes
- the vendor links stay bound to:
  - `https://cursor.com/dashboard/usage`
  - `https://chatgpt.com/codex/cloud/settings/analytics#usage`

## Follow-up

Recommended next theming slices:

1. use the new workspace plus runbook for one real operator pass instead of widening the theme editor
2. decide whether native-prompt proof is worth capturing separately from real-session proof
3. keep dual-seed and per-token editing deferred until one human extension-mode recovery pass is archived honestly
