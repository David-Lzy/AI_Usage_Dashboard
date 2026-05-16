# Phase 509 - Popup Header Actions And Hide Undo

Date: 2026-05-17

Status: completed and archived

## Goal

Make popup provider cards denser without making hide behavior ambiguous: move the card actions into the provider header, shorten the visible labels, persist hide through the provider display setting, and give the user a short Material-style undo window.

## Scope

- move each featured popup provider card's primary action and hide action into the title row between provider name and status badge
- shorten featured card actions from `Open detail` / `Stop showing` to compact localized `Details` / `Hide` copy
- make popup hide call `app:set-provider-enabled` with `enabled: false` so it matches the Settings display model
- add a 3-second undo chip in the popup header and a follow-up Settings notice after undo expires
- keep Claude Team popup all-model weekly labels compact as `week` / `周额度` rather than the longer all-model wording

## Preserved Boundaries

- no provider adapter parsing, raw quota evidence, warning math, snapshot schema, permissions, or stored provider credentials changed
- no popup provider ordering, quota item ordering, action badge selection, toolbar icon, release package, or manifest behavior changed
- no dashboard/provider-detail copy changed beyond the popup card action labels and popup compact progress labels

## Acceptance

- popup provider cards show `Details`/`Hide` style actions in the header instead of footer buttons
- clicking `Hide` removes the provider from visible popup/dashboard surfaces by updating the display-enabled provider setting
- the header shows a 3-second undo control; undo restores the provider display setting
- after the undo window expires, the header shows a compact notice pointing users to Settings to show the provider again
- localized popup card action labels and hide feedback exist for the shipped 14 runtime locales

## Verification

- `npm run test -- src/popup/PopupFeaturedProviderList.test.tsx src/popup/PopupHeaderSection.test.tsx src/popup/PopupHideProviderFeedback.test.tsx src/popup/view-models.test.ts src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- visually recheck popup header wrapping in real Chrome before cutting the next package candidate.
