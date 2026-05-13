# Phase 391 - Runtime I18n Deeper Copy Inventory

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

Inventory the runtime copy that still falls back to English after the 14-locale shell pilot, then define the next translation slices without changing runtime behavior.

## Scope

- Audit runtime catalog and structured-copy helpers for English-only or fallback-only user-visible copy.
- Group remaining copy by surface: popup guidance, Settings helpers, provider detail labels, diagnostics presentation, empty states, operator surfaces, and store-helper surfaces.
- Add or update one maintained `Doc/I18n/` backlog document that records the deeper-copy buckets, risk level, and recommended implementation order.
- Update roadmap references only where they currently overstate or understate runtime localization coverage.

## Preserved Boundaries

- Do not translate raw provider evidence, diagnostic raw bodies, archive/export payloads, generated request identifiers, route hashes, filenames, or provider/vendor source text.
- Do not change locale registry behavior, manifest locale directories, Chrome Web Store listing drafts, or shipped provider claims.
- Do not add machine translations in this inventory phase.

## Acceptance

- The deeper-copy backlog identifies which runtime copy buckets are still English fallback and which are intentionally raw evidence.
- `Phase 392` and `Phase 393` have clear source buckets and boundaries before implementation starts.
- Current i18n docs still describe the 14-locale shell pilot and deeper-copy fallback boundary accurately.

## Planned Verification

- `rg 'resolvedLocale === \"zh-CN\"|locale === \"zh-CN\"|fallback|English' src Doc/I18n Doc/Roadmap`
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added [I18n_Deeper_Runtime_Copy_Backlog.md](../I18n/I18n_Deeper_Runtime_Copy_Backlog.md) as the maintained backlog for non-`zh-CN` deeper runtime copy fallback.
- Confirmed the 14-locale runtime message catalog covers the shell pilot while deeper structured-copy helpers still mostly branch on `zh-CN` and fall back to English.
- Mapped `Phase 392` to popup and new-user guidance copy.
- Mapped `Phase 393` to Settings, provider-detail, and provider-source wrapper copy.
- Deferred typed diagnostic presentation, operator workspaces, and store-helper copy to later follow-up unless the next implementation slices stay small enough to split safely.
- Updated the i18n README, string inventory baseline, and Direction 09 roadmap references.

## Verification

- `rg 'resolvedLocale === \"zh-CN\"|locale === \"zh-CN\"|fallback|English' src Doc/I18n Doc/Roadmap`
  - reviewed expected `zh-CN` structured-copy branches, English fallback boundaries, and raw-evidence notes
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start popup/new-user translation expansion in `Phase 392`.
