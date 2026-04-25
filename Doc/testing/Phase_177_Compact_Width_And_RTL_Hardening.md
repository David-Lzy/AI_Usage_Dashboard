# Phase 177 - Compact Width And RTL Hardening

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Ship one first compact-width and RTL hardening pass for the existing `en + zh_CN` runtime pilot without pretending that a shipped RTL locale already exists.

## Why This Phase Exists

`Phase 176` extended the localized runtime slice into longer duration-bearing freshness and reset labels. That made popup width pressure and route-by-route direction handling worth formalizing before any deeper locale expansion.

## What Changed

- [src/shared/i18n.ts](../../src/shared/i18n.ts) now exposes one runtime `resolvedTextDirection`, one preview `?app-dir=rtl|ltr` override, and one `syncRuntimeLocaleAttributes` helper for popup, sidepanel, and full-page roots
- [src/sidepanel/App.tsx](../../src/sidepanel/App.tsx) and [src/popup/PopupApp.tsx](../../src/popup/PopupApp.tsx) now sync `lang` and `dir` onto the live document roots
- [src/sidepanel/theme/material-theme.css](../../src/sidepanel/theme/material-theme.css) now hardens one first RTL and compact-width pass through logical padding or border rules, RTL full-page transform-origin handling, and tighter action sizing
- [src/shared/i18n.test.ts](../../src/shared/i18n.test.ts) now verifies direction resolution plus document-attribute syncing
- [scripts/phase177-compact-width-rtl-hardening-review.mjs](../../scripts/phase177-compact-width-rtl-hardening-review.mjs) now checks the `Phase 177` code and document contract

## Result

The shipped runtime pilot now has:

- explicit `lang` and `dir` contract on popup, sidepanel, and full-page roots
- one preview and QA override for explicit RTL review without shipping Arabic yet
- one first logical-CSS pass for padding, disclosure chevrons, and entry-transform origin
- tighter compact-width action behavior for localized top bars and popup action rows

## Truth Boundary

This phase does not ship one RTL locale. It only ships the direction contract and one explicit QA override.

The following still remain outside the shipped localized pilot:

- operator workspaces such as interaction-audit and theme-recovery
- raw provider source-truth detail strings that intentionally stay closer to vendor or contract wording
- broader route-by-route RTL validation for any future Arabic tier

## Verification

- `npm run phase177:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

The next repo-owned `Direction 09` slice should move to audit and recovery workspace localization boundary review instead of another narrow layout-only pass.
