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
- use dot-separated runtime ids for React surfaces in future phases:
  - `popup.header.title`
  - `dashboard.summary.visible_label`
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

## Runtime Direction

- runtime React localization has not shipped yet
- future runtime ids should group by surface and role instead of by English wording
- vendor-owned provider-page text stays outside the managed localization catalog
- locale-aware formatting should also stay outside raw message ids so counts, dates, and durations can be formatted per locale

## Translation Tiers

- baseline locale:
  - `en`
- first pilot locale:
  - `zh_CN`
- later planned tiers remain governed by [Direction 09](./Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
