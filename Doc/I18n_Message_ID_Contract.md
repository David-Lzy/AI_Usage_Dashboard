# I18n Message ID Contract

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current message-id contract for manifest and runtime localization work
- refresh it when new localized surfaces, naming rules, or locale tiers change materially

## Goal

Keep manifest and runtime localization on one stable naming contract so later copy edits do not create ad-hoc or drifting message keys.

## Naming Rules

- use lowercase snake_case for manifest-owned message ids
- reserve the `manifest_` prefix for strings consumed directly by `src/manifest.json`
- use dot-separated runtime ids for React surfaces:
  - `popup.header.title`
  - `dashboard.summary.visible`
  - `settings.preferences.theme_mode_label`
- keep one id stable when the product concept stays the same and only wording changes
- create a new id only when the UI meaning changes enough that old translations would become misleading

## Current Manifest IDs

- `manifest_ext_name`
  - maps to manifest `name`
- `manifest_ext_description`
  - maps to manifest `description`
- `manifest_action_default_title`
  - maps to manifest `action.default_title`

## Shipped Runtime IDs Through Phase 173

Runtime localization now exists for one narrow manifest plus runtime pilot slice. Current shipped groups are:

- app shell status ids:
  - `app.loading.*`
  - `app.error.*`
- shared action and theme ids:
  - `common.actions.*`
  - `common.theme.toggle_to_dark_*`
  - `common.theme.toggle_to_light_*`
- dashboard shell ids:
  - `dashboard.topbar.*`
  - `dashboard.hero.*`
  - `dashboard.providers.*`
  - `dashboard.empty.*`
  - `dashboard.summary.*`
- popup shell ids:
  - `popup.loading.*`
  - `popup.error.*`
  - `popup.header.*`
  - `popup.summary.*`
  - narrow static shell labels such as `popup.guidance.eyebrow`, `popup.snapshot_status.eyebrow`, and `popup.triage.eyebrow`
- settings-shell ids shipped in `Phase 173`:
  - `settings.topbar.*`
  - `settings.overview.*`
  - `settings.sections.*`
  - `settings.summary.*`
  - `settings.preferences.*`
  - `settings.theme_customization.*`
  - `settings.visibility.*`
  - `settings.credentials.*`
  - `settings.sources.*`
  - `settings.permissions.*`
  - `settings.toast.*`

## Locale Preference Contract

- runtime locale preference now persists in `AppSettings.locale`
- shipped values are:
  - `system`
  - `en`
  - `zh-CN`
- `system` resolves from Chrome UI language first, then browser navigator language
- any current `zh*` UI language resolves into the shipped `zh-CN` catalog tier for now

## Runtime Direction

- runtime React localization is now partially shipped, not fully rolled out
- the current localized slice covers popup shell, dashboard shell, the first settings-shell slice, and shared quick theme-toggle labels
- the settings-shell slice now includes:
  - top bar title and actions
  - overview card
  - section navigation
  - summary-strip labels
  - global preferences labels
  - locale selector labels
  - theme mode and theme preset labels
  - top-level credentials, sources, and permissions section headings
  - preferences-saved toast copy
- deeper settings helper copy, provider-detail body copy, most popup explanatory copy, and operator workspaces still remain outside the shipped localized slice
- vendor-owned provider-page text stays outside the managed localization catalog
- locale-aware formatting also stays outside raw message ids so generated values can be formatted per locale without multiplying message ids

## Locale-Aware Formatting Contract

- locale-aware value formatting now ships through `src/shared/i18n.ts`, not through new message ids
- the current shipped formatting slice covers generated counts, percentages, and parseable timestamp primitives
- the current parseable timestamp inputs are limited to:
  - `YYYY-MM-DD`
  - `YYYY-MM-DD HH:mm`
  - those same forms with an explicit trailing `UTC`
- non-parseable vendor-owned strings such as billing-window labels remain source-truthful raw values for now
- localized duration and relative-time phrasing still remains future work under `Direction 09`

## Translation Tiers

- baseline locale:
  - `en`
- first pilot locale:
  - `zh_CN`
- later planned tiers remain governed by [Direction 09](./Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
