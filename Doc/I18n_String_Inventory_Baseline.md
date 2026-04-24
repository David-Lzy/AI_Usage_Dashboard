# I18n String Inventory Baseline

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current baseline inventory for user-facing strings that move under the runtime i18n layer
- refresh it when localized surface scope changes materially

## Current Localized Scope

Localized through `Phase 170`, `Phase 171`, `Phase 172`, `Phase 173`, and `Phase 174`:

- manifest `name`
- manifest `description`
- manifest `action.default_title`
- popup loading and error shell
- popup header shell and top summary labels
- popup quick refresh plus full-page-tab action labels
- popup explanatory copy:
  - guidance-card copy
  - setup-coverage copy
  - snapshot-status copy
  - featured-section and featured-card story copy
  - action-section detail
  - surface-roles detail
- dashboard top bar, hero, providers section, empty state, and summary labels
- settings shell, overview, section navigation, and locale selector
- settings global-preferences labels, theme preset labels, summary-strip labels, and top-level section headings
- settings preferences-saved toast copy
- provider-detail shell plus popup explanatory copy
- provider-detail static shell copy:
  - top bar subtitle and actions
  - section labels
  - field labels
  - note labels and prefixes
  - status badge labels
  - helper values such as granted/missing/unknown
  - hero explanatory paragraph
- shared quick theme-toggle labels for popup and standard sidepanel/full-page top bars
- generated dashboard and popup summary counts
- generated provider-card and provider-detail numeric values plus parseable reset/sync timestamps

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `src/shared/i18n.ts`
- `src/shared/localized-copy.ts`

## Runtime Surfaces Still Mostly English

The following surfaces still need broader runtime localization work:

- deeper settings setup guidance, credential help copy, and source-card diagnostics
- raw provider source-truth detail strings that still intentionally surface current contract or vendor wording without translation
- settings custom-seed status messaging
- interaction-audit workspace
- theme-recovery workspace
- store-facing runtime captions and screenshot-adjacent helper copy
- localized durations and relative freshness phrasing

## Runtime Inventory Buckets

Recommended next extraction order:

1. deeper settings setup and source/credential helper copy
2. locale-aware durations and relative freshness phrases
3. audit and recovery workspace copy
4. store-facing runtime helper copy that later appears in screenshots or submission support material

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app now has a broader but still partial localized slice plus locale-aware formatting after `Phase 174`, not a full translated rollout
- `en` and `zh_CN` currently cover manifest surfaces plus popup/dashboard shell strings, popup explanatory copy, the first settings-shell slice, provider-detail shell/static copy, quick theme-toggle labels, generated counts, percentages, and parseable timestamp primitives
- deeper settings helper copy, raw provider source-truth detail strings, localized durations, and operator workspaces still remain outside the shipped pilot
- non-parseable vendor-owned window labels such as `Mar 23 - Apr 21` still remain raw strings until a later explicit product decision localizes them
