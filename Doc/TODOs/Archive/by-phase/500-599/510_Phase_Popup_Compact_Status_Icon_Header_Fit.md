# Phase 510 - Popup Compact Status Icon Header Fit

Date: 2026-05-17

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../00_Phase_Index.md)

## Goal

Keep popup provider-card headers on one line in English and other longer locales after `Details` / `Hide` moved into the header.

## Scope

- Add a compact `StatusBadge` mode for popup provider cards.
- Render popup provider status as a small icon chip with `aria-label` and `title` preserving the localized status text.
- Make the popup provider-card title row single-line by truncating only the provider name when space is tight.
- Preserve full text status chips outside popup provider cards.

## Preserved Boundaries

- No provider health, quota, warning, or display eligibility behavior changed.
- No popup action routing, hide persistence, undo timing, or Settings re-enable semantics changed.
- No localization strings or raw provider evidence changed.

## Acceptance

- English `Warning` / `Healthy` status no longer wraps onto a second header line in compact popup cards.
- Popup status remains accessible through `aria-label` and hover title.
- `Details` / `Hide` remain visible in the provider-card header.
- Non-popup status badges keep their full text labels.

## Verification

- `npm run test -- src/popup/PopupFeaturedProviderList.test.tsx src/popup/PopupHeaderSection.test.tsx src/popup/PopupHideProviderFeedback.test.tsx src/popup/view-models.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Run a visual popup smoke pass before the next package cut, especially for `en`, `zh-CN`, `de`, and `ar`.
