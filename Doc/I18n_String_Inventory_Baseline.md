# I18n String Inventory Baseline

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current baseline inventory for user-facing strings that move under the runtime i18n layer
- refresh it when localized surface scope changes materially

## Current Localized Scope

Localized through `Phase 170`, `Phase 171`, `Phase 172`, `Phase 173`, `Phase 174`, `Phase 175`, `Phase 176`, `Phase 177`, `Phase 179`, `Phase 180`, `Phase 181`, and `Phase 183`.

Boundary-reviewed through `Phase 182`:

- raw provider source-truth policy and presentation-only wrapper candidate classification

Localized runtime surfaces:

- manifest `name`
- manifest `description`
- manifest `action.default_title`
- popup loading and error shell
- popup header shell and top summary labels
- popup quick refresh plus full-page-tab action labels
- popup explanatory copy:
  - guidance-card copy
  - setup-coverage copy
  - snapshot-status copy
  - featured-section and featured-card story copy
  - action-section detail
  - surface-roles detail
- dashboard top bar, hero, providers section, empty state, and summary labels
- settings shell, overview, section navigation, and locale selector
- settings global-preferences labels, theme preset labels, summary-strip labels, and top-level section headings
- settings preferences-saved toast copy
- deeper settings helper copy:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
- provider-detail shell plus popup explanatory copy
- provider-detail static shell copy:
  - top bar subtitle and actions
  - section labels
  - field labels
  - note labels and prefixes
  - status badge labels
  - helper values such as granted/missing/unknown
  - hero explanatory paragraph
- shared quick theme-toggle labels for popup and standard sidepanel/full-page top bars
- generated dashboard and popup summary counts
- generated provider-card and provider-detail numeric values plus parseable reset/sync timestamps
- duration-bearing runtime labels:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels
- operator-workspace shell copy:
  - interaction-audit top bar, hero, guidance, signoff summary labels, request-scope labels, and shell helper copy
  - theme-recovery top bar, hero, loading/error labels, current-truth section labels, theme-state labels, request-scope labels, workflow helper copy, quick-link labels, output action labels, and generic feedback messages
- store-screenshot runtime helper copy:
  - screenshot seed helper headings, status copy, preset-applied helper copy, and route-contract copy
  - screenshot seed submission-support captions that map current preset ids to localized store-caption guidance
  - native toolbar popup probe headings, status copy, accepted-state helper copy, and route-contract copy
- provider-source display wrapper copy:
  - source kind and preference labels
  - rollout, availability, fidelity, connection, and contract labels
  - generated fidelity, access-model, credential, cookie, manual-cookie-import, host-access, page-binding, and fallback source-state helper descriptions
  - generated availability summaries

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `src/shared/i18n.ts`
- `src/shared/localized-copy.ts`

## Store Runtime Helper Boundary

`Phase 180` added a maintained store-runtime helper copy reference, and `Phase 181` extended that reference with helper-only submission-support captions:

- [I18n_Store_Runtime_Helper_Copy.md](./I18n_Store_Runtime_Helper_Copy.md)

That reference covers the `#debug-store-screenshot-seed` and `#debug-native-popup-probe` helper routes. It localizes visible operator helper copy and preset-to-caption support guidance while preserving automation titles, preset ids, route hashes, and the truth boundary that helper pages are not final store screenshot surfaces. The added submission-support captions are not injected into final popup, side-panel, or full-page screenshots.

## Operator Workspace Boundary

`Phase 178` added a maintained operator-workspace boundary reference and `Phase 179` shipped the first shell-localized slice:

- [I18n_Operator_Workspace_Boundary_And_Extraction.md](./I18n_Operator_Workspace_Boundary_And_Extraction.md)

That reference covers the interaction-audit and theme-recovery workspaces. It separates shipped shell/helper copy from evidence-preserving English such as request ids, archive ids, generated filenames, export fields, fixture ids, vendor-owned strings, and status terms that currently serve as source-truth labels.

## Raw Provider Source-Truth Boundary

`Phase 182` added a maintained provider source-truth localization policy:

- [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md)

That reference protects raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, provider-source contract evidence, non-parseable vendor or policy labels, provider identifiers, host labels, route hints, URLs, and API names. `Phase 183` localized the safe provider-source display wrappers generated from enums or helper state while keeping those raw evidence fields unchanged.

`Phase 184` added the maintained adapter diagnostic reason-code plan:

- [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](./I18n_Adapter_Diagnostic_Reason_Code_Plan.md)

That reference defines the additive typed diagnostic model that should exist before any raw adapter diagnostic bodies are localized.

`Phase 185` implemented the type-only additive diagnostic model while keeping rendered UI behavior and raw diagnostic strings unchanged.

## Runtime Surfaces Still Mostly English

The following surfaces still need broader runtime localization work:

- raw provider source-truth detail strings that still intentionally surface current contract or vendor wording without translation
- deeper interaction-audit evidence, preset, queue, import, and export payload copy
- deeper theme-recovery evidence summary and provider source-truth copy

## Runtime Inventory Buckets

Recommended next extraction order:

1. source selection and fallback builders
2. revisit deeper operator-workspace evidence copy only after archive-compatibility rules are explicit
3. revisit generated store-listing source localization only after refreshed screenshot assets replace the historical baseline

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app now has a broader but still partial localized slice plus locale-aware formatting after `Phase 183`, not a full translated rollout
- `en` and `zh_CN` currently cover manifest surfaces plus popup/dashboard shell strings, popup explanatory copy, the first settings-shell slice, deeper settings helper copy, provider-detail shell/static copy, provider-source display wrappers, quick theme-toggle labels, generated counts, percentages, parseable timestamp primitives, duration-bearing runtime freshness/reset labels, operator-workspace shell copy, store-screenshot runtime helper copy plus seed-route submission-support captions, and one first compact-width plus RTL hardening pass
- runtime document roots now sync `lang` and `dir`, and preview/QA can now force `?app-dir=rtl` while the shipped locale set still resolves to `ltr`
- raw provider source-truth detail strings and deeper operator evidence payloads still remain outside the shipped pilot, but operator-workspace boundaries are now explicitly documented after `Phase 178` and the shell slice is shipped after `Phase 179`
- provider source-truth values now have an explicit policy boundary after `Phase 182`, provider-source display wrappers are localized after `Phase 183`, typed adapter diagnostic planning is documented after `Phase 184`, and the type-only additive model exists after `Phase 185`; the next safe work is source selection and fallback builders, not translating raw adapter diagnostics directly
- non-parseable vendor-owned window labels such as `Mar 23 - Apr 21` still remain raw strings until a later explicit product decision localizes them
