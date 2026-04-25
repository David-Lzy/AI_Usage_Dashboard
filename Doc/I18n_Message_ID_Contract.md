# I18n Message ID Contract

Date: 2026-04-25

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
- keep generated runtime explanatory copy grouped behind stable structured builders when a surface would otherwise require dozens of one-off sentence ids

## Current Manifest IDs

- `manifest_ext_name`
  - maps to manifest `name`
- `manifest_ext_description`
  - maps to manifest `description`
- `manifest_action_default_title`
  - maps to manifest `action.default_title`

## Shipped Runtime IDs Through Phase 181

Runtime localization now exists for one broader but still partial manifest plus runtime pilot slice. Current shipped groups are:

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
  - narrow shell labels such as `popup.guidance.eyebrow`, `popup.snapshot_status.eyebrow`, and `popup.triage.eyebrow`
- settings-shell ids shipped through `Phase 173`:
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

## Structured Runtime Copy Through Phase 181

`Phase 174` and `Phase 175` deliberately did not explode the runtime id list with one message id per popup sentence, provider-detail field label, or settings helper paragraph.

Instead, these localized surfaces now ship through shared structured builders in [src/shared/localized-copy.ts](../src/shared/localized-copy.ts):

- popup explanatory copy:
  - snapshot-status copy
  - guidance-card copy
  - featured-section copy
  - featured-card status and primary-detail copy
  - setup-coverage labels and explanatory detail
  - action-section detail
  - surface-roles copy
  - popup-specific aria labels for explanatory sections
- provider-detail shell and static copy:
  - top-bar subtitle and expand title
  - section labels
  - field labels
  - note labels and prefixes
  - localized status badge labels
  - localized helper value labels such as `Granted`, `Missing`, and `Unknown`
  - the provider-detail hero explanatory paragraph
- deeper settings helper copy:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
- operator-workspace shell copy:
  - interaction-audit top bar, hero, guidance, signoff-summary labels, and request-scope shell labels
  - theme-recovery top bar, hero, current-truth labels, theme-state labels, request-scope labels, workflow steps, quick-link labels, output action labels, and generic feedback messages
- store-screenshot runtime helper copy:
  - screenshot seed route labels, headings, preset-applied helper copy, and route-contract copy
  - screenshot seed submission-support captions that map preset ids to localized store-caption guidance without creating one runtime id per caption
  - native popup probe route labels, headings, accepted-state helper copy, and route-contract copy

This keeps `src/shared/i18n.ts` focused on stable app-shell ids while still making the broader `en + zh-CN` pilot executable.

## Locale Preference Contract

- runtime locale preference now persists in `AppSettings.locale`
- shipped values are:
  - `system`
  - `en`
  - `zh-CN`
- `system` resolves from Chrome UI language first, then browser navigator language
- any current `zh*` UI language resolves into the shipped `zh-CN` catalog tier for now
- runtime document roots now sync `lang` and `dir` from the shared runtime i18n layer
- preview and QA can now force `?app-dir=rtl` or `?app-dir=ltr` without implying that a shipped RTL locale already exists

## Runtime Direction

- runtime React localization is now partially shipped, not fully rolled out
- runtime document roots now sync `lang` and `dir` for popup, sidepanel, and full-page surfaces
- the current localized slice covers:
  - popup shell
  - popup explanatory copy
  - dashboard shell
  - the first settings-shell slice
  - deeper settings helper copy
  - provider-detail shell and static copy
  - operator-workspace shell copy
  - store-screenshot runtime helper copy
  - screenshot-adjacent submission-support captions in the store seed helper route
  - shared quick theme-toggle labels
- raw provider source-truth detail strings and deeper operator evidence/export payload copy still remain outside the shipped localized slice
- vendor-owned provider-page text stays outside the managed localization catalog
- locale-aware formatting also stays outside raw message ids so generated values can be formatted per locale without multiplying message ids
- operator workspace copy remains governed by [I18n_Operator_Workspace_Boundary_And_Extraction.md](./I18n_Operator_Workspace_Boundary_And_Extraction.md); `Phase 179` localizes shell/navigation/helper copy while preserving English evidence payloads
- store-screenshot helper copy remains governed by [I18n_Store_Runtime_Helper_Copy.md](./I18n_Store_Runtime_Helper_Copy.md); `Phase 180` localizes visible helper copy and `Phase 181` adds helper-only submission-support captions while preserving automation titles, preset ids, route hashes, final screenshot surfaces, and the manual native-toolbar popup capture truth boundary
- raw provider source-truth copy remains governed by [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md); `Phase 182` separates protected raw fields from provider-source display wrappers that can be localized next

## Locale-Aware Formatting Contract

- locale-aware value formatting now ships through `src/shared/i18n.ts`, not through new message ids
- the current shipped formatting slice covers generated counts, percentages, parseable timestamp primitives, and duration-bearing runtime freshness/reset labels
- the current shipped duration/freshness slice covers:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels
- the current parseable timestamp inputs are limited to:
  - `YYYY-MM-DD`
  - `YYYY-MM-DD HH:mm`
  - those same forms with an explicit trailing `UTC`
- non-parseable vendor-owned strings such as billing-window labels remain source-truthful raw values for now
- compact-width and RTL hardening now ships through document `lang` and `dir` sync, one preview `app-dir` override, and one first logical-CSS review pass under `Phase 177`
- any broader relative-time rollout still remains future work under `Direction 09`

## Translation Tiers

- baseline locale:
  - `en`
- first pilot locale:
  - `zh_CN`
- later planned tiers remain governed by [Direction 09](./Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
