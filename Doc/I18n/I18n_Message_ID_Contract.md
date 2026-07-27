# I18n Message ID Contract

Date: 2026-05-13

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

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
  - `settings.preferences.ui_font_label`
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

## Shipped Runtime IDs Through Phase 648

Runtime localization now exists for the stable manifest plus runtime message id
catalog across all 14 shipped locales. Current shipped groups are:

- app shell status ids:
  - `app.loading.*`
  - `app.error.*`
- shared action and theme ids:
  - `common.actions.*`
  - `common.theme.toggle_to_dark_*`
  - `common.theme.toggle_to_light_*`
  - `common.theme.toggle_to_system_*`
  - `common.theme.toggle_to_time_*`
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
  - `settings.preferences.ui_font.*` covers the Settings UI font-family preference labels/helper added in `Phase 465`
  - `settings.theme_customization.*` legacy ids remain in the catalog for compatibility, though the current Settings UI uses structured accent color dropdown copy after `Phase 455`
  - `settings.visibility.*`
  - `settings.credentials.*`
  - `settings.sources.*`
  - `settings.permissions.*`
  - `settings.toast.*`

## Structured Runtime Copy Through Phase 181

`Phase 174` and `Phase 175` deliberately did not explode the runtime id list with one message id per popup sentence, provider-detail field label, or settings helper paragraph.

Instead, these localized surfaces now ship through shared structured builders in [src/shared/localized-copy.ts](../../src/shared/localized-copy.ts):

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
- typed warning diagnostic presentation:
  - known warning diagnostic labels
  - short diagnostic summaries generated from typed params
  - raw warning bodies kept outside translated message ids
- typed source diagnostic presentation:
  - known source-selection and fallback diagnostic labels
  - short source diagnostic summaries generated from typed params
  - raw source-selection and fallback bodies kept outside translated message ids
- typed adapter-error diagnostic presentation:
  - known `adapter.*` diagnostic labels
  - short adapter diagnostic summaries generated from typed params
  - raw adapter warning bodies kept outside translated message ids
- custom JSON source cards:
  - card action labels, endpoint/sync labels, empty-state copy, warning chips, and aria labels
  - user-defined source labels, endpoint URLs, descriptions, fetched summaries, and raw response-derived values remain unchanged

This keeps `src/shared/i18n.ts` focused on stable app-shell ids while larger
localized surfaces can continue to use typed structured builders. `Phase 367`
expanded the runtime catalog shape to 14 locales with English fallback for
non-reviewed runtime copy. `Phase 648` replaced the remaining runtime catalog
fallback ids with explicit shipped-locale entries, so key completeness and
explicit runtime translation coverage are both enforced for managed runtime ids.
`Phase 649` added 14-locale structured copy for Custom JSON source cards while
keeping user-defined labels, endpoint URLs, fetched summaries, and raw
response-derived values unchanged.

## Locale Preference Contract

- runtime locale preference now persists in `AppSettings.locale`
- shipped values are:
  - `system`
  - `en`
  - `zh-CN`
  - `zh-TW`
  - `ja`
  - `ko`
  - `es-419`
  - `pt-BR`
  - `fr`
  - `de`
  - `it`
  - `ru`
  - `ar`
  - `hi`
  - `id`
- `system` resolves from Chrome UI language first, then browser navigator language
- `zh-TW`, `zh-HK`, `zh-MO`, and `zh-Hant*` resolve to `zh-TW`; other `zh*` values resolve to `zh-CN`
- `pt*` resolves to `pt-BR`
- `es*` resolves to `es-419`
- other supported language prefixes resolve to their matching shipped locale, with unknown values falling back to `en`
- runtime document roots now sync `lang` and `dir` from the shared runtime i18n layer
- `ar` resolves to `rtl`; all other shipped locales resolve to `ltr`
- popup and sidepanel HTML entry roots declare notranslate so browser translation overlays do not obscure already-localized extension UI
- preview and QA can still force `?app-dir=rtl` or `?app-dir=ltr`, and `Phase 367` adds `?app-locale=<supported-locale>` for extension-window visual checks without mutating saved settings
- `Phase 368` added bidirectional isolation for fallback rendering; after `Phase 648`, shipped runtime message ids have explicit Arabic entries, but the isolation guard remains useful for structured-copy base branches and raw evidence boundaries
- `Phase 369` validates RDP extension-window `--locale` values against the shipped runtime locale tags before opening a Chrome window

## Runtime Direction

- runtime React localization is broadly shipped for stable runtime ids; some structured-copy surfaces still use base branches or documented raw evidence boundaries
- runtime message catalog public helpers now live in `src/shared/runtime-message-catalogs.ts`, internal catalog data lives in `src/shared/runtime-message-catalog-data/`, and `src/shared/i18n.ts` owns the locale registry, locale resolution, text direction, formatting, and public runtime helper functions
- runtime locale architecture now covers 14 locales; shipped runtime message ids have explicit entries for every non-English locale in the 14-locale set
- focused i18n tests guard explicit runtime override coverage for every non-English runtime locale
- runtime document roots now sync `lang` and `dir` for popup, sidepanel, and full-page surfaces
- the current localized slice covers:
  - popup shell
  - popup explanatory copy
  - dashboard shell
  - the settings runtime catalog
  - deeper settings helper copy
  - provider-detail shell and static copy
  - operator-workspace shell copy
  - store-screenshot runtime helper copy
  - screenshot-adjacent submission-support captions in the store seed helper route
  - shared quick theme-toggle labels
- raw provider source-truth detail strings and deeper operator evidence/export payload copy still remain outside managed runtime localization
- vendor-owned provider-page text stays outside the managed localization catalog
- locale-aware formatting also stays outside raw message ids so generated values can be formatted per locale without multiplying message ids
- Chrome manifest message ids are guarded by `npm run i18n:check`, which now derives Chrome catalog directories from `APP_LOCALE_METADATA`, verifies the RDP capture helper locale list against `SUPPORTED_APP_LOCALES`, and checks the 14-locale Chrome Web Store listing draft structure
- runtime and structured-copy coverage can be audited with `npm run i18n:audit`;
  the audit reports explicit runtime message coverage, structured copy locale
  coverage, protected raw evidence fields, and layout-stress locales for manual
  review
- operator workspace and store-screenshot helper localization records are historical private implementation notes under ignored `.local/` history; public localization contracts should stay focused on shipped user-facing copy and protected evidence fields
- raw provider source-truth copy remains governed by [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md); `Phase 182` separates protected raw fields from provider-source display wrappers, and `Phase 183` localizes those wrappers through `ProviderSourceDisplayCopy` plus `buildProviderSourceDisplayLocalizedCopy` while preserving raw adapter evidence fields
- adapter diagnostic body localization uses typed reason codes for user-facing presentation while keeping raw adapter bodies outside translated message ids
- `Phase 196` adds compact-width QA for localized diagnostic presentation stacks and keeps raw diagnostic bodies outside translated message ids
- `Phase 197` adds diagnostic archive/export compatibility review and keeps localized diagnostic presentation out of archive/export schema message ids
- `Phase 198` aligns maintained sample and store seed typed diagnostic metadata while keeping raw diagnostic strings outside translated message ids
- `Phase 199` separates mutable diagnostic fixtures from generated request/handoff packages and frozen historical archives, keeping those evidence records outside translated message ids

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
- first reviewed broad runtime locale:
  - `zh-CN`
- explicit runtime catalog locales:
  - `zh-TW`
  - `ja`
  - `ko`
  - `es-419`
  - `pt-BR`
  - `fr`
  - `de`
  - `it`
  - `ru`
  - `ar`
  - `hi`
  - `id`
- structured-copy base branches may still use `en` plus `zh-CN` with explicit
  records for other shipped locales depending on the module; audit this with
  `npm run i18n:audit`
- shipped architecture and manifest locale set:
  - `en`
  - `zh-CN`
  - `zh-TW`
  - `ja`
  - `ko`
  - `es-419`
  - `pt-BR`
  - `fr`
  - `de`
  - `it`
  - `ru`
  - `ar`
  - `hi`
  - `id`
- Chrome `_locales` directory names use Chrome format such as `zh_CN`, `zh_TW`, `es_419`, and `pt_BR`; runtime locale tags use BCP-style tags such as `zh-CN`, `zh-TW`, `es-419`, and `pt-BR`
- `npm run i18n:check` is the drift gate for runtime locale tags, metadata `chromeLocale` values, manifest catalog ids, the RDP capture locale helper, and the store listing localization draft structure
- translation review and visual QA should follow the public localization contracts in this directory plus private local QA notes when browser-profile evidence is required

## Cross-Language Visual QA

`npm run i18n:visual-check` runs a local Playwright/Chrome visual matrix against
the built Chrome extension output in `dist/chrome/`. It serves Popup, Sidebar,
full-page Dashboard, Provider detail, and full-page Settings routes with locale,
direction, and theme preview parameters, captures screenshots, and writes a
JSON summary. Settings entries also open the application-language menu and
validate the floating menu before closing it.

The default matrix covers:

- routes:
  - popup
  - sidebar
  - dashboard full page
  - provider detail full page
  - settings full page
- widths:
  - `360px`
  - `430px`
  - `720px`
  - `1280px`
- all 14 shipped runtime locales
- light theme by default; pass `--themes light,dark` for dual-theme coverage

The report flags:

- document horizontal overflow
- visible elements extending outside the viewport
- controls whose text scrolls inside the control
- the open Settings language menu extending beyond the viewport or clipping an option
- Settings sticky-header/section-anchor overlap
- runtime direction mismatches such as Arabic rendering outside RTL
- resolved-theme mismatches

Use `--smoke` for a small `en`, `de`, and `ar` subset, and
`--fail-on-issues` when a release or layout-hardening change should fail on any
flagged issue:

```sh
npm run build
npm run i18n:visual-check -- --smoke
npm run i18n:visual-check -- --locales en,de,ar,hi --themes light,dark --fail-on-issues
npm run i18n:visual-check -- --fail-on-issues
```

Screenshots and visual reports are local QA evidence and are written under
ignored `.local/visual-checks/i18n/` paths. Do not commit them.
