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

Localized through `Phase 170`, `Phase 171`, and `Phase 172`:

- manifest `name`
- manifest `description`
- manifest `action.default_title`
- popup loading and error shell
- popup header shell and top summary labels
- popup quick refresh plus full-page-tab action labels
- dashboard top bar, hero, providers section, empty state, and summary labels
- shared quick theme-toggle labels for popup and standard sidepanel/full-page top bars
- generated dashboard and popup summary counts
- generated provider-card and provider-detail numeric values plus parseable reset/sync timestamps

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `src/shared/i18n.ts`

## Runtime Surfaces Still Mostly English

The following surfaces still need broader runtime localization work:

- settings sections, controls, and setup guidance
- provider detail contract and review copy
- most popup view-model copy:
  - setup coverage
  - guidance detail
  - featured-provider story
  - action-section detail
  - surface-roles detail
- interaction-audit workspace
- theme-recovery workspace
- store-facing runtime captions and screenshot-adjacent helper copy

## Runtime Inventory Buckets

Recommended next extraction order:

1. settings sections, actions, and setup guidance
2. provider-detail contract and review copy
3. remaining popup explanatory copy
4. locale-aware durations and relative freshness phrases
5. audit and recovery workspace copy

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app now has a narrow localized shell slice plus locale-aware formatting after `Phase 172`, not a full translated rollout
- `en` and `zh_CN` currently cover manifest surfaces plus popup/dashboard shell strings, quick theme-toggle labels, generated counts, percentages, and parseable timestamp primitives
- most settings, provider-detail, popup body copy, and operator workspaces still remain English
- non-parseable vendor-owned window labels such as `Mar 23 - Apr 21` still remain raw strings until a later explicit product decision localizes them
