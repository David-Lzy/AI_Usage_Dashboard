# Phase 507 - Popup Compact Progress Reset Labels

Date: 2026-05-16

Status: completed and archived

## Goal

Make toolbar popup quota labels compact enough for the Chrome action surface while still showing reset timing for line, classic circle, soft ring, and gauge ring progress styles.

## Scope

- add a popup-only compact progress-label helper for visible provider progress items
- replace verbose popup labels such as "5-hour usage window" and "Weekly usage window" with compact labels such as `5h, reset: 01:11` and `week, reset: 19/05`
- keep Chinese compact labels aligned with the same rule, such as `5小时，重置：01:11`
- keep reset details folded into the visible popup label so circular progress styles no longer hide reset timing
- update the Settings popup appearance preview to use the same compact label shape
- add focused popup and preview render tests for compact reset labels

## Preserved Boundaries

- no provider adapter, parser, snapshot, storage, permission, or source-truth behavior changed
- no side-panel dashboard, full-page dashboard, or provider-detail labels changed
- no raw provider evidence, reset source values, diagnostic bodies, archive exports, or release package changed
- no manifest version bump or release packaging was performed

## Acceptance

- popup circular labels show compact quota context plus reset timing when `resetAt` is available
- popup line labels use the same compact label source as circular styles
- model-specific labels keep useful model context without repeating long source text
- usage windows with no usable reset time simply omit the reset suffix
- Settings preview no longer shows the verbose "Weekly usage window" sample

## Verification

- `npm run test -- src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- package a post-`Phase 507` candidate only if the next Chrome Web Store resubmission should include this popup-label polish.
