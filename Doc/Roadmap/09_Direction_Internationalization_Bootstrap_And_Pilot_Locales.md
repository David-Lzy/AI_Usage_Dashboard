# Direction 09 - Internationalization Bootstrap And Pilot Locales

Date: 2026-05-13

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- documentation-only planning expansion landed on `2026-04-24` through `Phase 154`
- first executable slice landed on `2026-04-24` through `Phase 170`
- second executable slice landed on `2026-04-24` through `Phase 171`
- third executable slice landed on `2026-04-24` through `Phase 172`
- fourth executable slice landed on `2026-04-24` through `Phase 173`
- fifth executable slice landed on `2026-04-24` through `Phase 174`
- sixth executable slice landed on `2026-04-24` through `Phase 175`
- seventh executable slice landed on `2026-04-24` through `Phase 176`
- eighth executable slice landed on `2026-04-25` through `Phase 177`
- ninth executable slice landed on `2026-04-25` through `Phase 178`
- tenth executable slice landed on `2026-04-25` through `Phase 179`
- eleventh executable slice landed on `2026-04-25` through `Phase 180`
- twelfth executable slice landed on `2026-04-25` through `Phase 181`
- thirteenth executable slice landed on `2026-04-25` through `Phase 182`
- fourteenth executable slice landed on `2026-04-25` through `Phase 183`
- fifteenth executable slice landed on `2026-04-25` through `Phase 184`
- sixteenth executable slice landed on `2026-04-25` through `Phase 185`
- seventeenth executable slice landed on `2026-04-25` through `Phase 186`
- eighteenth executable slice landed on `2026-04-25` through `Phase 187`
- nineteenth executable slice landed on `2026-04-25` through `Phase 188`
- twentieth executable slice landed on `2026-04-25` through `Phase 189`
- twenty-first executable slice landed on `2026-04-25` through `Phase 190`
- twenty-second executable slice landed on `2026-04-25` through `Phase 191`
- twenty-third executable slice landed on `2026-04-25` through `Phase 192`
- twenty-fourth executable slice landed on `2026-04-25` through `Phase 193`
- twenty-fifth executable slice landed on `2026-04-25` through `Phase 194`
- twenty-sixth executable slice landed on `2026-04-25` through `Phase 195`
- twenty-seventh executable slice landed on `2026-04-25` through `Phase 196`
- twenty-eighth executable slice landed on `2026-04-25` through `Phase 197`
- twenty-ninth executable slice landed on `2026-04-25` through `Phase 198`
- thirtieth executable slice landed on `2026-04-25` through `Phase 199`
- thirty-first executable slice landed on `2026-05-13` through `Phase 367`
- thirty-second executable slice landed on `2026-05-13` through `Phase 368`
- thirty-third executable slice landed on `2026-05-13` through `Phase 369`
- thirty-fourth executable slice landed on `2026-05-13` through `Phase 370`
- thirty-fifth executable slice landed on `2026-05-13` through `Phase 372`
- thirty-sixth executable slice landed on `2026-05-13` through `Phase 373`
- thirty-seventh executable slice landed on `2026-05-13` through `Phase 374`
- thirty-eighth executable slice landed on `2026-05-13` through `Phase 375`
- thirty-ninth executable slice landed on `2026-05-13` through `Phase 376`
- fortieth executable slice landed on `2026-05-13` through `Phase 377`
- forty-first executable slice landed on `2026-05-13` through `Phase 378`
- forty-second executable slice landed on `2026-05-13` through `Phase 379`
- forty-third executable slice landed on `2026-05-13` through `Phase 380`
- forty-fourth executable slice landed on `2026-05-13` through `Phase 381`
- forty-fifth executable slice landed on `2026-05-13` through `Phase 382`
- forty-sixth executable slice landed on `2026-05-13` through `Phase 383`
- forty-seventh executable slice landed on `2026-05-13` through `Phase 384`
- forty-eighth executable slice landed on `2026-05-13` through `Phase 385`
- forty-ninth executable slice landed on `2026-05-13` through `Phase 386`
- fiftieth executable slice landed on `2026-05-13` through `Phase 387`
- fifty-first documentation inventory slice landed on `2026-05-13` through `Phase 391`
- fifty-second planning split landed on `2026-05-13` through `Phase 392`
- fifty-third executable slice landed on `2026-05-13` through `Phase 392.1`
- fifty-fourth planning split landed on `2026-05-13` through `Phase 392.2`
- fifty-fifth executable slice landed on `2026-05-13` through `Phase 392.3`
- fifty-sixth executable slice landed on `2026-05-13` through `Phase 392.4`
- fifty-seventh slice landed on `2026-05-13` through the `Phase 393` Settings/provider-detail localization split
- fifty-eighth executable slice landed on `2026-05-13` through `Phase 393.1`
- fifty-ninth planning split landed on `2026-05-13` through `Phase 393.2`
- sixtieth executable slice landed on `2026-05-13` through `Phase 393.2.1`
- sixty-first executable slice landed on `2026-05-13` through `Phase 393.2.2`
- sixty-second executable slice landed on `2026-05-13` through `Phase 393.3.1`
- sixty-second planning split landed on `2026-05-13` through `Phase 393.3`
- sixty-third executable slice landed on `2026-05-13` through `Phase 393.3.2`
- sixty-fourth release-gate baseline slice landed on `2026-05-13` through `Phase 396`
- sixty-fifth inventory slice landed on `2026-05-13` through `Phase 397`
- sixty-sixth executable slice landed on `2026-05-13` through `Phase 398`
- sixty-seventh executable slice landed on `2026-05-13` through `Phase 399`
- sixty-eighth executable slice landed on `2026-05-13` through `Phase 400`
- sixty-ninth release-gate baseline slice landed on `2026-05-13` through `Phase 401`
- seventieth inventory slice landed on `2026-05-13` through `Phase 402`
- seventy-first inventory slice landed on `2026-05-13` through `Phase 403`
- seventy-second executable slice landed on `2026-05-13` through `Phase 404`
- seventy-third executable slice landed on `2026-05-14` through `Phase 405`
- seventy-fourth release-gate baseline slice landed on `2026-05-14` through `Phase 406`
- `Phase 200` and `Phase 201` intentionally paused this i18n/diagnostic follow-up line for functionality-first Codex personal usage-context surfacing while Codex budget is constrained
- this direction sharpens [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md) into a more actionable first rollout

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P1`

## Why This Direction Exists

Internationalization is now one of the clearest product gaps.

The current extension:

- already has manifest localization plus an early runtime pilot
- still has much more explanatory English copy than an early prototype
- already has popup, setup, contract, and review language that will stay expensive to retrofit later

At the same time, the user explicitly wants broad language support.

The right question is no longer "should we localize?"
It is:

- how do we build one sustainable localization architecture
- and what is the first safe rollout path toward ten common languages

## Current Truth

As of 2026-05-13:

- the manifest defines `default_locale = en`
- the repo ships manifest-level Chrome catalogs for 14 locale directories: `en`, `zh_CN`, `zh_TW`, `ja`, `ko`, `es_419`, `pt_BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`
- the runtime app now ships one shared localization helper in `src/shared/i18n.ts`
- the runtime message catalog public entry now lives in `src/shared/runtime-message-catalogs.ts`, internal catalog data now lives in `src/shared/runtime-message-catalog-data/`, and locale registry, resolution, direction, and formatter helpers stay in `src/shared/i18n.ts`
- the runtime app now ships a 14-locale registry with runtime locale tags, Chrome locale directory names, native labels, Intl/html language tags, and text direction metadata
- the runtime app now also ships one shared structured-copy helper in `src/shared/localized-copy.ts`
- locale preference now persists in `AppSettings.locale` with current values `system | en | zh-CN | zh-TW | ja | ko | es-419 | pt-BR | fr | de | it | ru | ar | hi | id`
- Settings language options are generated from the registry instead of hard-coded `en / zh-CN` entries
- `ar` resolves to `rtl`; all other shipped runtime locales resolve to `ltr`
- the new non-reviewed runtime locales use complete key coverage with English fallback where human-reviewed translations are not yet present
- every non-English locale in the 14-locale set now has a first runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels; popup first-run guidance, setup coverage, snapshot status, header, featured-section, featured-card, action-section, surface-role, and aria copy now have explicit 14-locale structured coverage through `Phase 392.4`; Settings core layout, Quick Setup, preferences, theme-customization, credential, source-card, and permission helper copy now has explicit 14-locale coverage through `Phase 393.2.2`; Provider Detail helper copy now has explicit 14-locale coverage through `Phase 393.3.1`; provider-source display wrapper copy now has explicit 14-locale coverage through `Phase 393.3.2`; typed warning diagnostic presentation now has explicit 14-locale coverage through `Phase 398`; typed source-selection and source-fallback diagnostic presentation now has explicit 14-locale coverage through `Phase 399`; typed adapter-error diagnostic presentation now has explicit 14-locale coverage through `Phase 400`; operator-workspace helper-owned copy now has explicit 14-locale coverage through `Phase 404`; store-helper copy now has explicit 14-locale coverage through `Phase 405`; deeper structured runtime copy outside those slices still falls back to English until reviewed translations are added
- the diagnostic presentation inventory now maps the completed typed warning, source, and adapter-error presentation copy while preserving raw diagnostic evidence outside localization:
  - [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](../I18n/I18n_Diagnostic_Presentation_14_Locale_Inventory.md)
- the deeper runtime copy backlog now records typed diagnostic presentation as complete through `Phase 400`, with operator/store-helper follow-up remaining later:
  - [I18n_Deeper_Runtime_Copy_Backlog.md](../I18n/I18n_Deeper_Runtime_Copy_Backlog.md)
- operator-workspace helper and consumer copy has a maintained 14-locale inventory for the next implementation slice:
  - [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](../I18n/I18n_Operator_Workspace_14_Locale_Copy_Inventory.md)
- store-helper runtime copy has a maintained 14-locale inventory for the next implementation slice:
  - [I18n_Store_Helper_14_Locale_Copy_Inventory.md](../I18n/I18n_Store_Helper_14_Locale_Copy_Inventory.md)
- focused i18n tests now guard that every non-English locale keeps explicit first-shell runtime message overrides instead of silently relying on English fallback for the shell pilot surface
- Arabic/RTL surfaces now isolate English fallback text direction so fallback punctuation stays readable until reviewed Arabic runtime translations are added
- popup and sidepanel HTML shells now declare notranslate so Chrome/Google Translate overlays do not obscure localized extension-window screenshots
- RDP extension-window locale smoke captures now validate `--locale` against the same 14 runtime tags before opening a Chrome extension window
- `npm run i18n:check` now derives Chrome `_locales` directories from runtime registry metadata and verifies the RDP capture helper locale list against the same runtime tags
- `npm run i18n:check` now also verifies the 14-locale Chrome Web Store listing draft has registry-aligned locale sections and complete listing field structure
- the full `npm run release:check` gate passed after the 14-locale expansion and runtime message catalog split in `Phase 396`, and passed again after typed diagnostic presentation reached 14-locale coverage in `Phase 401`
- the full `npm run release:check` gate passed after operator/store helper localization in `Phase 406`
- active `Phase 407` covers localized operator/store RDP visual QA before queued localization maintenance follow-ups
- the current shipped runtime localized slice covers:
  - popup shell
  - popup explanatory copy
  - popup first-run, featured-provider, action-section, surface-role, and aria structured copy across all 14 runtime locales
  - dashboard shell
  - the first settings-shell slice
  - deeper settings helper copy
  - provider-detail shell and static copy
  - operator-workspace shell copy for interaction-audit and theme-recovery
  - store-screenshot runtime helper copy for the seed route and native popup probe route
  - store-screenshot seed-route submission-support captions that map screenshot presets to localized store-caption guidance
  - provider-source display wrapper labels and helper descriptions generated from typed source/fidelity/availability/connection state
  - warning diagnostic labels and summaries generated from typed warning diagnostics
  - source-selection and source-fallback diagnostic labels and summaries generated from typed source diagnostics
  - adapter-error diagnostic labels and summaries generated from typed adapter diagnostics
  - operator-workspace helper-owned labels, guidance, workflow, links, and output feedback
  - store-helper screenshot seed and native popup probe labels, guidance, captions, and feedback
  - shared quick theme-toggle labels
- the current settings-shell slice includes:
  - settings top bar and actions
  - settings overview card
  - settings section navigation
  - settings summary-strip labels
  - global preferences labels, locale selector labels, and theme preset labels
  - top-level section headings
  - the preferences-saved toast
- the runtime app now also formats generated counts, percentages, and parseable `resetAt / syncedAt` timestamp values per locale
- the deeper settings helper slice now also localizes:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
- the runtime app now also localizes duration-bearing freshness and reset labels across popup snapshot status, popup featured-provider freshness chips, and dashboard provider cards
- deeper operator evidence/export payload copy and raw provider source-truth detail strings that intentionally remain closer to the underlying source contract still remain outside the localized pilot
- popup compact widths were already tight in English, so `Phase 177` shipped one explicit compact-width hardening pass for the current localized pilot
- runtime roots now sync `lang` and `dir` attributes from the shared runtime i18n layer
- preview and QA can now force `?app-dir=rtl` or `?app-dir=ltr` without mutating saved locale settings
- operator workspaces now have one maintained localization boundary and first extraction review:
  - [I18n_Operator_Workspace_Boundary_And_Extraction.md](../I18n/I18n_Operator_Workspace_Boundary_And_Extraction.md)
- the first operator-workspace shell localization slice now routes interaction-audit and theme-recovery shell/navigation/helper copy through `buildOperatorWorkspaceLocalizedCopy` while keeping evidence payloads English
- store-screenshot helper routes now route visible helper copy and screenshot-adjacent submission-support captions through `buildStoreWorkflowLocalizedCopy` while keeping automation titles, preset ids, route hashes, final screenshot surfaces, and native-toolbar popup capture truth boundaries stable
- raw provider source-truth localization now has one maintained policy reference:
  - [I18n_Raw_Provider_Source_Truth_Policy.md](../I18n/I18n_Raw_Provider_Source_Truth_Policy.md)
- adapter diagnostic reason-code planning now has one maintained reference:
  - [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](../I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md)
- Cursor source-selection and fallback diagnostics now have typed metadata beside the existing raw adapter strings
- Codex source-selection and fallback diagnostics now have typed metadata beside the existing raw adapter strings
- Cursor and Codex credential and host-access diagnostics now have typed metadata beside the existing raw adapter warning strings
- Cursor and Codex page-session diagnostics now have typed metadata beside the existing raw adapter warning strings
- Cursor and Codex usage-threshold diagnostics plus Gemini policy-only diagnostics now have typed metadata beside the existing raw warning strings
- sync-engine stale cached-state and automatic-sync-overdue diagnostics now have typed metadata beside the raw sync-engine stale warning strings
- source-state classification now prefers typed warning diagnostics while preserving raw English warning-pattern fallback for older snapshots and unknown codes
- Settings and Provider Detail now show localized labels and short summaries for known typed warning diagnostics while preserving raw diagnostic bodies
- Settings and Provider Detail now show localized labels and short summaries for known typed source-selection and fallback diagnostics while preserving raw source diagnostic bodies
- Settings and Provider Detail now show localized labels and short summaries for known typed adapter-error diagnostics while preserving raw adapter diagnostic bodies
- Cursor, Codex, and Claude Code now populate typed adapter-error diagnostics for stable repo-owned failure paths
- compact diagnostic presentation QA now verifies localized warning/source/adapter summaries beside raw evidence bodies at `420px` Settings and `360px` Provider Detail widths
- diagnostic archive/export compatibility review now locks raw diagnostic fields as evidence fields while keeping localized diagnostic presentation out of archive/export schemas
- maintained sample and store seed states now align typed diagnostic metadata where stable existing codes match raw evidence strings, without changing raw strings or provider coverage claims
- diagnostic fixture and historical evidence alignment now separates mutable maintained fixtures from generated request/handoff packages and frozen historical archives
- the repo ships one store helper i18n boundary reference:
  - [I18n_Store_Runtime_Helper_Copy.md](../I18n/I18n_Store_Runtime_Helper_Copy.md)
- the repo ships maintained i18n references:
  - [I18n_Message_ID_Contract.md](../I18n/I18n_Message_ID_Contract.md)
  - [I18n_String_Inventory_Baseline.md](../I18n/I18n_String_Inventory_Baseline.md)
- the repo now ships one guarded 14-locale Chrome Web Store listing draft:
  - [Store_Listing_Localization_14_Locale_Draft.md](../Store/Store_Listing_Localization_14_Locale_Draft.md)
- the repo also ships the execution-ready child TODO for the remaining i18n track:
  - [09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md](./09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md)

External platform constraints and product signals:

- Chrome extension localization expects `_locales/<locale>/messages.json` plus `default_locale`
- Chrome Web Store metrics can be filtered by country and language, which makes staged locale rollout practical
- competing extensions already advertise multilingual support, so i18n is now also a product-positioning gap, not only a technical gap

## Direction Goal

Ship one localization architecture that can start with a small pilot set and then grow to at least ten common languages without turning every copy change into manual chaos.

## Strategic Decisions

1. Build one architecture before broad translation rollout.
   Do not start by translating ten locales into a monolingual codebase.

2. Stage locale rollout in tiers.
   Current architecture/catalog target:
   - `en`
   - `zh_CN`, `zh_TW`
   - `ja`, `ko`
   - `es_419`, `pt_BR`, `fr`, `de`, `it`
   - `ru`, `ar`, `hi`, `id`
   Future work should replace English fallback runtime copy with reviewed translations instead of adding ad-hoc locale branches.

3. Keep manifest and app strings aligned.
   The manifest and React surfaces should share one stable message-id model even if storage formats differ.

4. Localize extension UI, not vendor-owned raw page text.
   Provider page data should stay source-truthful while surrounding UI copy is translated.

5. Treat compact-width and RTL as first-class QA.
   Long strings and Arabic cannot be treated as a later cosmetic pass.

## Success Criteria

- the manifest ships `default_locale`
- the repo ships `_locales/` catalogs for the 14 target Chrome locale directories
- the runtime app reads translated UI strings from one shared localization contract
- the app uses locale-aware formatting for counts, timestamps, and durations
- at least one pilot locale beyond English is shippable without layout breakage
- Arabic resolves `rtl` from locale metadata and has one representative RDP visual QA baseline, but the new locale set still needs reviewed translations before it is considered fully polished

## Main Risks

- translating before popup, settings, and provider-detail copy stabilizes
- creating separate manifest and runtime catalogs with drifting IDs
- promising 14 polished locales before width and RTL QA exists
- translating every string manually without a maintainable workflow

## Recommendation

This direction is now active repo-owned engineering work, not future planning.

Recommended rollout:

1. manifest string inventory plus stable message IDs - shipped in `Phase 170`
2. manifest localization plumbing - shipped in `Phase 170`
3. runtime localization layer first shell slice - shipped in `Phase 171`
4. locale-aware formatting for counts, percentages, and parseable timestamp primitives - shipped in `Phase 172`
5. settings-shell pilot rollout plus locale selector - shipped in `Phase 173`
6. popup explanatory copy plus provider-detail shell/static copy rollout - shipped in `Phase 174`
7. deeper settings helper copy rollout - shipped in `Phase 175`
8. locale-aware durations and freshness labels - shipped in `Phase 176`
9. compact-width and RTL hardening - shipped in `Phase 177`
10. audit and recovery workspace localization boundary and first extraction review - shipped in `Phase 178`
11. first operator-workspace shell localization slice - shipped in `Phase 179`
12. store-facing runtime helper copy - shipped in `Phase 180`
13. screenshot-adjacent captions inside actual product screenshot surfaces or submission-support UI - shipped in `Phase 181`
14. raw provider source-truth localization policy and presentation-only wrapper review - shipped in `Phase 182`
15. provider-source display wrapper localization - shipped in `Phase 183`
16. adapter diagnostic typed reason-code plan - shipped in `Phase 184`
17. type-only additive diagnostic model - shipped in `Phase 185`
18. Cursor source selection and fallback builders - shipped in `Phase 186`
19. Codex source selection and fallback builders - shipped in `Phase 187`
20. credential and host-access diagnostics - shipped in `Phase 188`
21. page-session diagnostics - shipped in `Phase 189`
22. usage-threshold and policy-only diagnostics - shipped in `Phase 190`
23. sync-stale diagnostics - shipped in `Phase 191`
24. source-state classification typed-diagnostic fallback - shipped in `Phase 192`
25. localized warning diagnostic presentation - shipped in `Phase 193`
26. source-selection and fallback diagnostic presentation expansion - shipped in `Phase 194`
27. adapter-error diagnostic builders and presentation boundary - shipped in `Phase 195`
28. diagnostic presentation compact-width and evidence QA - shipped in `Phase 196`
29. diagnostic archive and export compatibility review - shipped in `Phase 197`
30. sample and store seed diagnostic metadata alignment - shipped in `Phase 198`
31. diagnostic fixture and historical evidence alignment review - shipped in `Phase 199`
32. adapter diagnostic raw fallback regression review - shipped in `Phase 204`
33. 14-locale registry, manifest catalogs, and store listing draft - shipped in `Phase 367`
34. RTL fallback text direction hardening - shipped in `Phase 368`
35. RDP locale capture guard for locale-specific visual QA - shipped in `Phase 369`
36. i18n registry, Chrome catalog, and RDP helper drift guard - shipped in `Phase 370`
37. store listing localization draft structure guard - shipped in `Phase 372`
38. Traditional Chinese runtime shell pilot - shipped in `Phase 373`
39. Japanese runtime shell pilot - shipped in `Phase 374`
40. Korean runtime shell pilot - shipped in `Phase 375`
41. runtime message catalog module split - shipped in `Phase 376`
41.1 runtime message catalog internal data split - shipped in `Phase 395`
42. Latin American Spanish runtime shell pilot - shipped in `Phase 377`
43. Brazilian Portuguese runtime shell pilot - shipped in `Phase 378`
44. French runtime shell pilot - shipped in `Phase 379`
45. German runtime shell pilot - shipped in `Phase 380`
46. Italian runtime shell pilot - shipped in `Phase 381`
47. Russian runtime shell pilot - shipped in `Phase 382`
48. Arabic runtime shell pilot - shipped in `Phase 383`
49. Hindi runtime shell pilot - shipped in `Phase 384`
50. Indonesian runtime shell pilot - shipped in `Phase 385`
51. runtime shell pilot coverage guard - shipped in `Phase 386`
52. notranslate extension shells and representative locale RDP popup QA - shipped in `Phase 387`
53. deeper runtime copy inventory for non-English fallback locales - shipped in `Phase 391`
54. popup guidance implementation split - shipped in `Phase 392`
55. popup first-run guidance 14-locale copy - shipped in `Phase 392.1`
56. popup featured and surface-role 14-locale copy split - shipped in `Phase 392.2`
57. popup featured-card 14-locale copy - shipped in `Phase 392.3`
58. popup action and surface-role 14-locale copy - shipped in `Phase 392.4`
59. Settings and provider-detail 14-locale copy split - shipped in `Phase 393`
60. Settings core 14-locale copy - shipped in `Phase 393.1`
61. Settings source-controls 14-locale copy split - shipped in `Phase 393.2`
62. Settings credentials 14-locale copy - shipped in `Phase 393.2.1`
63. Settings source and permissions 14-locale copy - shipped in `Phase 393.2.2`
64. Provider Detail and source-display 14-locale copy split - shipped in `Phase 393.3`
65. Provider Detail 14-locale copy - shipped in `Phase 393.3.1`
66. Provider-source display 14-locale copy - shipped in `Phase 393.3.2`
67. deeper diagnostic-body localization - deferred until a separate product need exists and the raw evidence compatibility boundary remains intact
68. diagnostic presentation 14-locale inventory - shipped in `Phase 397`
69. warning diagnostic presentation 14-locale copy - shipped in `Phase 398`
70. source diagnostic presentation 14-locale copy - shipped in `Phase 399`
71. adapter-error diagnostic presentation 14-locale copy - shipped in `Phase 400`
72. post-diagnostic localization release check - shipped in `Phase 401`
73. operator-workspace 14-locale copy inventory - shipped in `Phase 402`
74. store-helper 14-locale copy inventory - shipped in `Phase 403`
75. operator-workspace 14-locale copy - shipped in `Phase 404`
76. store-helper 14-locale copy - shipped in `Phase 405`
77. post-helper localization release gate - shipped in `Phase 406`
78. localized operator/store RDP visual QA - active in `Phase 407`
79. localization copy chunk-size audit - queued in `Phase 408`
80. interaction-audit consumer-copy presentation split - queued in `Phase 409`
81. store-helper error presentation split - queued in `Phase 410`

## References

- Chrome extension i18n:
  https://developer.chrome.com/docs/extensions/develop/ui/i18n
- Chrome Web Store metrics:
  https://developer.chrome.com/docs/webstore/metrics/
- [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md)
- `Ai Usage 100%` listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid

## Child TODO

- [09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md](./09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md)
- [09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md](./09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md)
- [09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](./09_3_Adapter_Diagnostic_Reason_Code_TODOs.md)
