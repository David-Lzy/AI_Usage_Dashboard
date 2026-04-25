# Direction 09 - Internationalization Bootstrap And Pilot Locales

Date: 2026-04-25

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

As of 2026-04-25:

- the manifest defines `default_locale = en`
- the repo ships `_locales/en` plus `_locales/zh_CN` for manifest-level Chrome surfaces
- the runtime app now ships one shared localization helper in `src/shared/i18n.ts`
- the runtime app now also ships one shared structured-copy helper in `src/shared/localized-copy.ts`
- locale preference now persists in `AppSettings.locale` with current values `system | en | zh-CN`
- the current shipped runtime localized slice covers:
  - popup shell
  - popup explanatory copy
  - dashboard shell
  - the first settings-shell slice
  - deeper settings helper copy
  - provider-detail shell and static copy
  - operator-workspace shell copy for interaction-audit and theme-recovery
  - store-screenshot runtime helper copy for the seed route and native popup probe route
  - store-screenshot seed-route submission-support captions that map screenshot presets to localized store-caption guidance
  - provider-source display wrapper labels and helper descriptions generated from typed source/fidelity/availability/connection state
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
- preview and QA can now force `?app-dir=rtl` or `?app-dir=ltr` without pretending Arabic already ships
- operator workspaces now have one maintained localization boundary and first extraction review:
  - [I18n_Operator_Workspace_Boundary_And_Extraction.md](../I18n_Operator_Workspace_Boundary_And_Extraction.md)
- the first operator-workspace shell localization slice now routes interaction-audit and theme-recovery shell/navigation/helper copy through `buildOperatorWorkspaceLocalizedCopy` while keeping evidence payloads English
- store-screenshot helper routes now route visible helper copy and screenshot-adjacent submission-support captions through `buildStoreWorkflowLocalizedCopy` while keeping automation titles, preset ids, route hashes, final screenshot surfaces, and native-toolbar popup capture truth boundaries stable
- raw provider source-truth localization now has one maintained policy reference:
  - [I18n_Raw_Provider_Source_Truth_Policy.md](../I18n_Raw_Provider_Source_Truth_Policy.md)
- adapter diagnostic reason-code planning now has one maintained reference:
  - [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](../I18n_Adapter_Diagnostic_Reason_Code_Plan.md)
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
  - [I18n_Store_Runtime_Helper_Copy.md](../I18n_Store_Runtime_Helper_Copy.md)
- the repo ships maintained i18n references:
  - [I18n_Message_ID_Contract.md](../I18n_Message_ID_Contract.md)
  - [I18n_String_Inventory_Baseline.md](../I18n_String_Inventory_Baseline.md)
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
   Recommended rollout:
   - Tier 0: architecture only
   - Tier 1: `en` plus `zh_CN`
   - Tier 2: `zh_TW`, `ja`, `ko`, `es_419`
   - Tier 3: `pt_BR`, `fr`, `de`, `ar`

3. Keep manifest and app strings aligned.
   The manifest and React surfaces should share one stable message-id model even if storage formats differ.

4. Localize extension UI, not vendor-owned raw page text.
   Provider page data should stay source-truthful while surrounding UI copy is translated.

5. Treat compact-width and RTL as first-class QA.
   Long strings and Arabic cannot be treated as a later cosmetic pass.

## Success Criteria

- the manifest ships `default_locale`
- the repo ships `_locales/`
- the runtime app reads translated UI strings from one shared localization contract
- the app uses locale-aware formatting for counts, timestamps, and durations
- at least one pilot locale beyond English is shippable without layout breakage
- RTL has one explicit review plan before Arabic ships

## Main Risks

- translating before popup, settings, and provider-detail copy stabilizes
- creating separate manifest and runtime catalogs with drifting IDs
- promising ten polished locales before width and RTL QA exists
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
32. adapter diagnostic raw fallback regression review - queued after the current functionality-first provider work

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
