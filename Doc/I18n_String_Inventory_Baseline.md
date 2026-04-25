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

Localized through `Phase 170`, `Phase 171`, `Phase 172`, `Phase 173`, `Phase 174`, `Phase 175`, `Phase 176`, and `Phase 177`:

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
- deeper settings helper copy:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
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
- duration-bearing runtime labels:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `src/shared/i18n.ts`
- `src/shared/localized-copy.ts`

## Runtime Surfaces Still Mostly English

The following surfaces still need broader runtime localization work:

- raw provider source-truth detail strings that still intentionally surface current contract or vendor wording without translation
- interaction-audit workspace
- theme-recovery workspace
- store-facing runtime captions and screenshot-adjacent helper copy

## Runtime Inventory Buckets

Recommended next extraction order:

1. audit and recovery workspace localization boundary and first extraction review
2. store-facing runtime helper copy that later appears in screenshots or submission support material
3. revisit the remaining raw provider source-truth detail policy after the broader runtime pilot stabilizes

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app now has a broader but still partial localized slice plus locale-aware formatting after `Phase 177`, not a full translated rollout
- `en` and `zh_CN` currently cover manifest surfaces plus popup/dashboard shell strings, popup explanatory copy, the first settings-shell slice, deeper settings helper copy, provider-detail shell/static copy, quick theme-toggle labels, generated counts, percentages, parseable timestamp primitives, duration-bearing runtime freshness/reset labels, and one first compact-width plus RTL hardening pass
- runtime document roots now sync `lang` and `dir`, and preview/QA can now force `?app-dir=rtl` while the shipped locale set still resolves to `ltr`
- raw provider source-truth detail strings and operator workspaces still remain outside the shipped pilot
- non-parseable vendor-owned window labels such as `Mar 23 - Apr 21` still remain raw strings until a later explicit product decision localizes them
