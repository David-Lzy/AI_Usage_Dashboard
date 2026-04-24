# Direction 09 - Internationalization Bootstrap And Pilot Locales

Date: 2026-04-24

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- first executable slice landed on `2026-04-24` through `Phase 170`
- documentation-only planning expansion landed on `2026-04-24` through `Phase 154` by turning the next i18n bootstrap line into one explicit child TODO doc
- this direction sharpens [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md) into a more actionable first rollout

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P2`

## Why This Direction Exists

Internationalization is now one of the clearest product gaps.

The current extension:

- is effectively English-only
- has much more explanatory copy than an early prototype
- already has popup, setup, contract, and review language that will be expensive to retrofit later

At the same time, the user explicitly wants broad language support.

The right question is no longer "should we localize?"
It is:

- how do we build one sustainable localization architecture
- and what is the first safe rollout path toward ten common languages

## Current Truth

As of 2026-04-24:

- the manifest now defines `default_locale = en`
- the repo now ships `_locales/en` plus `_locales/zh_CN` for manifest-level Chrome surfaces
- the runtime app still does not yet use a shared localization layer
- the extension does not yet offer locale-aware number, date, or duration formatting
- the popup's compact widths are already tight in English, so longer translated strings will need explicit QA
- the repo now also ships one maintained message-id contract and one baseline string inventory:
  - [I18n_Message_ID_Contract.md](../I18n_Message_ID_Contract.md)
  - [I18n_String_Inventory_Baseline.md](../I18n_String_Inventory_Baseline.md)
- the repo now also ships one execution-ready child TODO for the next i18n architecture pass:
  - [09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md](./09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md)
- this direction is intentionally sequenced after the current Direction 10 surface-expansion work so the first runtime i18n pass does not start against still-moving popup plus full-page contracts

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

- translating before popup and setup copy stabilizes
- creating separate manifest and runtime catalogs with drifting IDs
- promising ten polished locales before width and RTL QA exists
- translating every string manually without a maintainable workflow

## Recommendation

This direction is feasible and should become the next major architecture track after the current Direction 10 surface work settles.

Recommended rollout:

1. manifest string inventory plus stable message IDs - baseline shipped in `Phase 170`
2. manifest localization plumbing - baseline shipped in `Phase 170`
3. runtime localization layer
4. locale-aware formatting
5. `en` and `zh_CN` runtime pilot rollout
6. compact-width and RTL hardening

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
