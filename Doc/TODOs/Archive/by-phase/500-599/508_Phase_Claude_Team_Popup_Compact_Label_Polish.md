# Phase 508 - Claude Team Popup Compact Label Polish

Date: 2026-05-16

Status: completed and archived

## Goal

Make Claude Team popup quota labels follow the same compact pattern as Codex so circular popup cards do not show mixed-language or overly long all-model weekly labels.

## Scope

- add a compact all-model weekly label for popup progress items
- localize the compact all-model weekly label across the shipped 14 runtime locales
- compact weekday reset values such as `Tue 12:30 AM` into shorter localized reset text where possible
- add focused popup render coverage for the Claude Team all-model weekly label

## Preserved Boundaries

- no Claude adapter parsing, provider source truth, snapshot data, or raw reset evidence changed
- no dashboard, provider detail, side-panel, full-page, storage, permission, or release package behavior changed
- no provider availability, warning, or quota math changed

## Acceptance

- Claude Team all-model weekly popup labels no longer render as `周额度 · All models`
- zh-CN popup output renders a compact label such as `全模型周额度，重置：周二 00:30`
- Codex compact popup labels from Phase 507 continue to render unchanged
- non-popup surfaces keep the detailed provider labels

## Verification

- `npm run test -- src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- review popup labels in real Chrome if a later phase opens a visual QA pass before packaging the post-`Phase 508` source boundary.
