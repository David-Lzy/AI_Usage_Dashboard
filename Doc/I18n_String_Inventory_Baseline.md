# I18n String Inventory Baseline

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current baseline inventory for user-facing strings that will move under the runtime i18n layer
- refresh it when localized surface scope changes materially

## Current Localized Scope

Localized in `Phase 170`:

- manifest `name`
- manifest `description`
- manifest `action.default_title`

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`

## Runtime Surfaces Still English-Only

The following surfaces still need future runtime localization work:

- popup
- dashboard
- settings
- provider detail
- interaction-audit workspace
- theme-recovery workspace
- store-facing runtime captions and screenshot-adjacent helper copy

## Runtime Inventory Buckets

Recommended next extraction order:

1. global app shell labels and route titles
2. popup quick-glance copy
3. dashboard summary and provider-card labels
4. settings sections, actions, and setup guidance
5. provider-detail contract and review copy
6. audit and recovery workspace copy

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app is still effectively English-only until the React localization layer lands
- `zh_CN` currently covers manifest-level Chrome surfaces only, not the in-app popup or sidepanel copy
