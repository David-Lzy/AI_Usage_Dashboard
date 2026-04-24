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
  - `settings.theme.mode_label`
- keep one id stable when the product concept stays the same and only wording changes
- create a new id only when the UI meaning changes enough that old translations would become misleading

## Current Manifest IDs

- `manifest_ext_name`
  - maps to manifest `name`
- `manifest_ext_description`
  - maps to manifest `description`
- `manifest_action_default_title`
  - maps to manifest `action.default_title`

## Shipped Runtime IDs In Phase 171

Runtime localization now exists for one narrow popup plus dashboard shell slice. Current shipped groups are:

- app shell status ids:
  - `app.loading.*`
  - `app.error.*`
- shared action and theme ids:
  - `common.actions.*`
  - `common.theme.toggle_to_dark_*`
  - `common.theme.toggle_to_light_*`
- dashboard shell ids:
  - `dashboard.topbar.*`
  - `dashboard.hero.title` and the rest of `dashboard.hero.*`
  - `dashboard.providers.*`
  - `dashboard.empty.*`
  - `dashboard.summary.*`
- popup shell ids:
  - `popup.loading.*`
  - `popup.error.*`
  - `popup.header.title` and the rest of `popup.header.*`
  - `popup.summary.*`
  - narrow static shell labels such as `popup.guidance.eyebrow`, `popup.snapshot_status.eyebrow`, and `popup.triage.eyebrow`

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
- the current localized slice covers popup shell and dashboard shell strings plus shared quick theme-toggle labels
- settings body copy, provider-detail body copy, most popup view-model copy, and operator workspaces still remain outside the shipped localized slice
- vendor-owned provider-page text stays outside the managed localization catalog
- locale-aware formatting also stays outside raw message ids so counts, dates, and durations can be formatted per locale in later phases

## Translation Tiers

- baseline locale:
  - `en`
- first pilot locale:
  - `zh_CN`
- later planned tiers remain governed by [Direction 09](./Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
