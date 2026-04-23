# Direction 07 - Internationalization And Localization

Date: 2026-04-23

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- no executable slice has shipped yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P6`

## Why This Direction Exists

The current extension is effectively English-only.

That is becoming a bigger gap because:

- the product is moving beyond a local prototype
- the popup and side panel now have substantial explanatory copy
- provider pages already encounter locale variation in the wild
- the user specifically wants broad language support

Internationalization is feasible, but it is not a small cosmetic pass.
It affects:

- manifest strings
- popup strings
- side-panel strings
- Settings labels
- onboarding copy
- screenshots
- store listing assets
- RTL support

## Current Truth

As of 2026-04-23:

- the manifest does not define `default_locale`
- the repo does not yet ship an `_locales/` tree
- the React app does not yet use `chrome.i18n.getMessage()` or a parallel app-level locale system
- some provider logic already has locale-aware route handling, but the product UI itself is still monolingual

External platform constraints:

- Chrome extension localization expects `_locales/<locale>/messages.json` plus `default_locale`
- manifest fields such as action titles can be localized through message keys
- Chrome Web Store metrics can be filtered by country and language, which is useful for choosing rollout priorities
- current market examples already advertise multilingual support, including Arabic plus RTL

## Direction Goal

Build a sustainable localization system that can eventually support at least ten common languages without turning every product change into translation chaos.

This direction should deliver:

- one extension-level localization architecture
- one app-level runtime text system
- staged locale rollout
- explicit RTL handling
- a repeatable translation and QA workflow

## Strategic Decisions

1. Build the architecture before committing to all ten locales.
   Supporting ten languages is feasible, but only after string extraction, message IDs, formatting rules, and QA paths exist.

2. Use one source of truth for translatable strings.
   Manifest localization and React-surface localization should not diverge into two manually maintained systems if it can be avoided.

3. Treat RTL as first-class.
   If Arabic is in scope, layout, icon mirroring, alignment, and spacing need explicit review.

4. Localize product UI, not vendor-owned extracted page text.
   Provider-captured data should stay truthful to the source while the extension's surrounding UI is translated.

5. Roll out languages in tiers, not all at once.
   Proposed first ten planning locales:
   - `en`
   - `zh_CN`
   - `zh_TW`
   - `ja`
   - `ko`
   - `es_419`
   - `pt_BR`
   - `fr`
   - `de`
   - `ar`

## Success Criteria

- the extension has a real localization architecture
- manifest, popup, and side panel can all render localized UI text
- date, count, and number formatting are locale-aware
- at least one RTL locale is explicitly tested
- translation QA is repeatable enough that future copy changes remain manageable

## Main Risks

- translating before product copy stabilizes
- duplicating string catalogs between manifest and React
- shipping ten locales with weak QA instead of fewer locales with strong QA
- breaking compact popup and Settings layouts with longer translated text

## Recommendation

This direction is feasible, but it should be staged.

Recommended rollout:

1. string inventory plus message-ID architecture
2. manifest and runtime localization plumbing
3. one or two pilot locales
4. layout and RTL hardening
5. then a broader ten-locale rollout

## References

- Chrome extension i18n:
  https://developer.chrome.com/docs/extensions/develop/ui/i18n
- Chrome Web Store metrics:
  https://developer.chrome.com/docs/webstore/metrics/
- `Ai Usage 100%` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid

## Child TODO

- [07_1_Direction_Internationalization_And_Localization_TODOs.md](./07_1_Direction_Internationalization_And_Localization_TODOs.md)
