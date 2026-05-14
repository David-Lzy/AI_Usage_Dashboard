# Strategic Directions Index

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- living strategy

Status note:

- this file is the current strategic priority index for roadmap directions
- refresh it whenever latest completed slices or direction-priority ordering changes

Purpose:

- capture the next high-level product directions after the currently queued release work
- separate strategic direction-setting from the active numbered phase queue
- keep the roadmap honest about what is already shipped, what is partially solved, and what is still exploratory

Important scope note:

- these roadmap files are not replacements for the active phase files in `Doc/TODOs/`
- numbered phases are still used for narrow execution slices; roadmap directions decide priority when there is no active phase

## Current Truth Snapshot

As of 2026-05-14:

- the numbered phase queue is completed through `Phase 432`; no active numbered phase is queued after the provider display-preference and Settings carousel closeout
- `Phase 154` completed a documentation-only slice that expanded the roadmap into explicit next-step TODO docs for:
  - Direction 10 surface expansion plus ambient theme controls
  - Direction 10 store asset pack plus submission readiness
  - Direction 09 runtime i18n bootstrap plus pilot locales
  - Direction 05 theme-recovery real-operator closure
  - Direction 04 interaction-audit real-operator closure
- `Phase 155` completed the first runtime slice under that new Direction 10.2 plan by shipping a shared route-entry contract for route-preserving full-page shell state through the existing sidepanel entry, plus one repeatable review for dashboard, settings, and provider-detail full-page preview states
- `Phase 156` completed the next runtime slice under that same Direction 10.2 plan by shipping one compact popup-header expand control that opens the dashboard full-page tab through the shared route-entry contract
- `Phase 157` completed the next runtime slice under that same Direction 10.2 plan by shipping one compact sidepanel top-bar expand control that preserves the current dashboard, settings, or provider-detail route when opening the shared full-page shell
- `Phase 158` completed the next runtime slice under that same Direction 10.2 plan by shipping one popup plus sidebar quick light-dark toggle that also carries into the standard full-page shell without changing preset or custom-seed state
- `Phase 159` completed the next runtime slice under that same Direction 10.2 plan by shipping short-lived popup-expand and sidepanel-expand entry hints, plus restrained source-aware full-page entry motion that stays disabled under reduced-motion mode
- `Phase 160` completed the next runtime slice under that same Direction 10.2 plan by refreshing real RDP runtime captures for popup, sidepanel settings, and standard full-page routes while adding runtime-window cleanup into the helper workflow
- `Phase 161` completed the first `Direction 10.3` slice by shipping one screenshot selection/stale-review pack, updating the storyboard toward native toolbar-bubble popup capture plus full-page depth capture, and marking the first screenshot archive as a historical baseline rather than the final submission pack
- `Phase 162` completed the next `Direction 10.3` slice by shipping one refreshed pending screenshot-capture request, tightening request-generation truth rules for manual popup capture, and preserving fulfilled historical request semantics during package refresh
- `Phase 163` completed the next `Direction 10.3` slice by shipping one native-toolbar popup probe, confirming that the current `RDP Chrome` runtime does not expose the real popup bubble as a separately capturable X11 top-level window, and preserving manual popup capture as the truthful boundary for refreshed store assets
- `Phase 164` completed the next `Direction 10.3` slice by shipping one hybrid capture-plan plus request-bound full-page staging pass, so the refreshed pending request now carries truthful staged depth captures while manual native-toolbar popup slots remain unresolved
- `Phase 165` completed the next `Direction 10.3` slice by shipping one dedicated manual screenshot handoff and archive-readiness preflight, so the refreshed pending request now exposes the remaining manual popup work through generated handoff files instead of only through the larger request README
- `Phase 166` completed the next `Direction 10.3` slice by shipping one manual screenshot import workflow, so the refreshed pending request now exposes one repo-backed way to copy real native-toolbar popup captures plus optional popup-note overlays back into the request package before archive completion
- `Phase 167` completed the next `Direction 10.3` slice by shipping one generated popup-notes overlay template plus one popup-capture checklist, so the refreshed pending request now carries the last missing generated inputs for the final manual popup pass
- `Phase 168` completed the next `Direction 10.3` slice by shipping one request-bound completion default path, so once the real popup files are imported back into the pending request, archive completion no longer needs a separate `--captures-dir` argument
- `Phase 169` completed the next `Direction 10.3` slice by shipping one request-bound manual finalize command, so popup import, archive-readiness validation, and request completion can now run through one repo-backed operator step once the real native-toolbar popup files exist
- `Phase 170` completed the first `Direction 09` slice by shipping one manifest i18n bootstrap baseline: `default_locale = en`, `_locales/en`, `_locales/zh_CN`, one message-id contract, and one baseline string inventory
- `Phase 171` completed the next `Direction 09` slice by shipping one shared runtime i18n helper, persisted locale normalization, and the first localized popup/dashboard shell slice while keeping broader settings, provider-detail, popup body copy, and operator workspaces English for now
- `Phase 172` completed the next `Direction 09` slice by shipping locale-aware formatting for generated counts, percentages, and parseable timestamp primitives across popup, dashboard, and provider-detail surfaces while keeping most deeper runtime body copy and durations outside the localized rollout for now
- `Phase 173` completed the next `Direction 09` slice by shipping the first settings-shell localization rollout, including the locale selector, top-level settings headings, summary labels, and localized preferences-saved feedback while keeping deeper settings helper copy, provider-detail copy, and popup explanatory copy outside the localized slice for now
- `Phase 174` completed the next `Direction 09` slice by localizing popup explanatory copy plus provider-detail shell/static copy under one shared structured-copy helper while keeping deeper settings helper copy, raw provider source-truth detail strings, localized durations, and operator workspaces outside the shipped pilot for now
- `Phase 175` completed the next `Direction 09` slice by localizing deeper settings helper copy across theme-customization status messaging, credential cards, source-card diagnostics/session-track helper copy, and permission prompts while keeping localized durations, operator workspaces, and raw provider source-truth detail strings outside the shipped pilot for now
- `Phase 176` completed the next `Direction 09` slice by localizing duration-bearing freshness and reset labels across popup snapshot status, popup featured-provider freshness chips, and dashboard provider cards while keeping raw provider source-truth detail strings and operator workspaces outside the shipped pilot and moving compact-width plus RTL hardening next
- `Phase 177` completed the next `Direction 09` slice by shipping runtime `lang` and `dir` sync, one preview `app-dir` override, one first logical-CSS hardening pass, and tighter compact-width action behavior for the current `en + zh_CN` pilot while keeping raw provider source-truth detail strings and operator workspaces outside the shipped pilot
- `Phase 178` completed the next `Direction 09` slice by adding one maintained operator-workspace localization boundary and one repeatable extraction review for interaction-audit plus theme-recovery workspaces while keeping evidence payloads and source-truth labels English for now
- `Phase 179` completed the next `Direction 09` slice by localizing the interaction-audit and theme-recovery workspace shell/navigation/helper copy for `en + zh_CN` while keeping evidence payloads, export schemas, request identifiers, fixture ids, filenames, and source-truth labels English
- `Phase 180` completed the next `Direction 09` slice by localizing store-screenshot seed and native popup probe helper-route copy while preserving automation titles, preset ids, route hashes, helper-not-final-screenshot wording, and the manual native-toolbar popup capture dependency
- `Phase 181` completed the next `Direction 09` slice by adding localized screenshot-adjacent submission-support captions to the store seed helper route while keeping final popup, side-panel, and full-page screenshot surfaces unchanged
- `Phase 182` completed the next `Direction 09` slice by adding a maintained raw provider source-truth localization policy that protects adapter evidence fields while identifying provider-source display wrappers as the next safe localized bucket
- `Phase 183` completed the next `Direction 09` slice by localizing provider-source display wrappers for source labels, availability/fidelity/connection labels, helper descriptions, and generated availability summaries while preserving raw adapter evidence strings unchanged
- `Phase 184` completed the next `Direction 09` slice by adding a maintained adapter diagnostic reason-code plan plus one `09.3` child TODO, so raw adapter diagnostics now have a type-first migration path before any diagnostic-body localization
- `Phase 185` completed the next `Direction 09` slice by adding a type-only additive diagnostic model, known diagnostic code categories, raw-message fallback helpers, and focused tests without changing rendered UI behavior
- `Phase 186` completed the next `Direction 09` slice by adding shared source-selection/fallback diagnostic builders and populating Cursor typed source diagnostics while preserving raw adapter strings unchanged
- `Phase 187` completed the next `Direction 09` slice by populating Codex typed source diagnostics through the same shared builders while preserving raw adapter strings unchanged
- `Phase 188` completed the next `Direction 09` slice by populating Cursor and Codex typed credential plus host-access warning diagnostics while preserving raw adapter strings unchanged
- `Phase 189` completed the next `Direction 09` slice by populating Cursor and Codex typed page-session warning diagnostics while preserving raw adapter strings unchanged
- `Phase 190` completed the next `Direction 09` slice by populating usage-threshold and policy-only typed warning diagnostics while preserving raw adapter strings unchanged
- `Phase 191` completed the next `Direction 09` slice by populating sync-engine stale cached-state and automatic-sync-overdue typed diagnostics while preserving raw stale warning strings unchanged
- `Phase 192` completed the next `Direction 09` slice by making source-state classification prefer typed warning diagnostics while preserving raw English warning-pattern fallback for older snapshots and unknown diagnostic codes
- `Phase 193` completed the next `Direction 09` slice by adding localized labels and short summaries for known typed warning diagnostics while preserving raw warning/source strings unchanged
- `Phase 194` completed the next `Direction 09` slice by adding localized labels and short summaries for known typed source-selection and fallback diagnostics while preserving raw source-selection/fallback strings unchanged
- `Phase 195` completed the next `Direction 09` slice by adding adapter-error diagnostic builders, stable adapter-error population for Cursor/Codex/Claude Code failure paths, and localized adapter-error presentation while preserving raw adapter warning bodies unchanged
- `Phase 196` completed the next `Direction 09` slice by adding repeatable compact-width QA for combined localized warning/source/adapter diagnostic presentation while preserving raw warning, source-selection, and fallback evidence visibility
- `Phase 197` completed the next `Direction 09` slice by adding diagnostic archive/export compatibility review, including one maintained reference and one static gate proving localized diagnostic presentation remains separate from raw evidence schemas
- `Phase 198` completed the next `Direction 09` slice by aligning maintained sample and store seed typed diagnostic metadata where stable existing codes match raw evidence strings
- `Phase 199` completed the next `Direction 09` slice by adding diagnostic fixture and historical evidence alignment review, separating mutable maintained fixtures from generated request/handoff packages and frozen historical archives
- `Phase 367` reopened `Direction 09` for a source-only 14-locale expansion: runtime locale registry, Settings locale options, Chrome manifest `_locales` catalogs, i18n completeness checking, and a guarded Chrome Web Store listing localization draft now cover `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`
- `Phase 368` hardened Arabic/RTL fallback rendering so untranslated English runtime fallback sentences keep natural punctuation order while Arabic remains an RTL locale
- `Phase 369` hardened locale-specific RDP visual QA by validating `--locale` against those 14 runtime tags and sharing the `app-locale` URL override helper across extension-window captures
- `Phase 370` folded runtime registry, Chrome catalog directory, and RDP locale helper alignment into the standard `npm run i18n:check` drift gate
- `Phase 372` extended that i18n drift gate to the 14-locale Chrome Web Store listing draft, including locale section coverage and required listing field counts
- `Phase 373` added the first `zh-TW` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 374` added the first `ja` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 375` added the first `ko` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 376` moved the large runtime message catalog into `src/shared/runtime-message-catalogs.ts`, keeping locale registry, resolution, and formatting ownership in `src/shared/i18n.ts`
- `Phase 395` split runtime message catalog internals into `src/shared/runtime-message-catalog-data/` while preserving the public `src/shared/runtime-message-catalogs.ts` export path and catalog behavior
- `Phase 396` ran the full post-localization maintenance release gate after the 14-locale expansion and runtime message catalog split; `npm run release:check` passed without changing release artifacts or product behavior
- `Phase 397` added a maintained diagnostic presentation 14-locale inventory and split the remaining work into warning, source, and adapter-error implementation slices
- `Phase 398` added explicit 14-locale warning diagnostic presentation while preserving raw warning evidence fields and unknown-code fallback behavior
- `Phase 399` added explicit 14-locale source-selection and source-fallback diagnostic presentation while preserving raw source-selection and fallback evidence boundaries
- `Phase 400` added explicit 14-locale adapter-error diagnostic presentation while preserving raw adapter diagnostic evidence boundaries
- `Phase 377` added the first `es-419` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 378` added the first `pt-BR` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 379` added the first `fr` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 380` added the first `de` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 381` added the first `it` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 382` added the first `ru` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 383` added the first `ar` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while preserving the existing `rtl` locale direction boundary
- `Phase 384` added the first `hi` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 385` added the first `id` runtime shell pilot for dashboard, popup, Settings, common actions, and theme-toggle labels while keeping deeper structured copy on the existing fallback boundary
- `Phase 386` added a focused runtime shell pilot coverage guard so every non-English locale must keep explicit first-shell message overrides even though deeper runtime copy can still fall back to English
- `Phase 387` added notranslate markers to the extension HTML shells and verified representative localized RDP popup captures no longer show Chrome/Google Translate overlay UI
- `Phase 407` captured representative localized operator/store helper RDP Chrome screenshots for `en`, `zh-CN`, `ja`, `de`, and `ar`, preserving the current Arabic RTL and German long-label visual QA evidence under [2026-05-14-phase407](../testing/localized_operator_store_rdp_visual_qa/2026-05-14-phase407/README.md)
- `Phase 408` audited localization copy chunk size after the operator/store helper copy rollout and recorded that the current `sidepanel.js` raw-size warning is acceptable unless a later release gate chooses to lazy-load special debug/helper routes
- `Phase 409` documented the interaction-audit presentation/export split, preserving signoff exports, handoff drafts, request ids, route ids, preset ids, command text, and manual-check evidence while queuing Review Queue display-copy localization as a narrow follow-up
- `Phase 410` added localized store-helper error wrappers while preserving raw invalid-preset, malformed-seed, and native popup probe error text inside the rendered helper message
- `Phase 411` added localized interaction-audit Review Queue display labels while keeping queue status enums, surface titles, signoff exports, and generated handoff drafts unchanged
- `Phase 412` added localized interaction-audit Surface Card chrome labels while keeping surface definitions, manual-check evidence, frame-action raw messages, iframe identity, signoff exports, and generated handoff drafts unchanged
- `Phase 413` added localized interaction-audit Workspace Controls display labels and signoff-workspace feedback while keeping pasted JSON, parsed import errors, signoff export JSON, generated Markdown drafts, filenames, MIME types, storage keys, request binding, and request revision formatting unchanged
- `Phase 414` added localized interaction-audit Request Scope command headings while keeping generated command text, request ids, request revisions, archive path examples, input filename examples, signoff export JSON, generated Markdown drafts, filenames, and MIME types unchanged
- `Phase 415` added localized interaction-audit Handoff Summary presentation labels and safe handoff feedback while keeping handoff draft content, generated bundle command text, operator notes, surface ids, surface titles, manual-check evidence, filenames, MIME types, and signoff export schemas unchanged
- `Phase 416` added typed frame-readiness and preset-result codes plus optional raw-message separation while keeping existing display messages, preset execution behavior, iframe behavior, signoff exports, handoff drafts, and archive/request schemas unchanged
- `Phase 417` added 14-locale display copy for typed interaction-audit frame-readiness and preset-result codes while keeping raw selector/preset diagnostics untranslated and preserving the English fallback message fields
- `Phase 418` inventoried remaining interaction-audit presentation-copy boundaries and queued route feedback/accessibility labels, typed import-error presentation, and surface-definition display/source split as separate follow-up phases
- `Phase 419` added localized interaction-audit route feedback and accessibility labels while keeping dynamic surface titles source-bound and preserving route paths, iframe sources, ids, presets, signoff exports, handoff drafts, and archive/request schemas
- `Phase 420` added typed signoff import-error codes and localized display copy while preserving pasted JSON, parsed payload fields, accepted import compatibility, generated drafts, filenames, MIME types, storage keys, and request binding/revision formatting
- `Phase 421` added localized interaction-audit surface-definition display copy for all 14 runtime locales while preserving source ids, route paths, iframe sources, preset ids, data attributes, signoff exports, generated Markdown drafts, filenames, MIME types, storage keys, and request binding/revision formatting
- post-`Phase 421` closeout packaged the current source boundary as `0.1.0-rc.16` while preserving RC13 as the submitted Chrome Web Store review boundary
- `Phase 422` started the provider display-preference architecture queue for independent popup, sidebar, and full-page provider ordering, per-surface quota item visibility/order, polished progress ring styles, and Settings provider carousel work. The queue is now completed through `Phase 432` and kept provider source truth, raw evidence, credentials, host permissions, and RC13/RC16 release boundaries unchanged.
- `Phase 422` completed that first slice by adding shared display preference types, defaults, normalizers, and storage migration while leaving current UI rendering behavior unchanged for `Phase 423`.
- `Phase 423` consumed the provider-order preference in popup, sidebar, and full-page dashboard rendering while preserving the existing default health/status ordering for surfaces without a saved custom order.
- `Phase 424` exposed provider-order editing in Settings for popup, sidebar, and full-page tab surfaces while preserving provider enabled state, permissions, credentials, source preferences, and sync behavior.
- `Phase 425` added shared provider progress item inventory for primary quota, usage-window, and usage-balance items while preserving usage facts, raw provider evidence, diagnostic bodies, archive/export payloads, and visible rendering behavior.
- `Phase 426` added Settings controls for per-provider progress item visibility and order across popup, sidebar, and full-page tab surfaces while preserving existing runtime progress rendering until `Phase 427`.
- `Phase 427` made popup, sidebar dashboard cards, full-page dashboard cards, and provider detail consume the shared per-surface progress item selection/rendering path while keeping usage facts supplemental and preserving provider snapshots, adapter output, raw evidence, export payloads, source truth labels, and popup featured-provider count.
- `Phase 428` added soft and gauge SVG ring styles under the same `UsageProgress` API, kept the classic circle ring valid, changed fresh popup defaults to `circle-soft`, and preserved determinate/indeterminate accessibility semantics plus provider value boundaries.
- `Phase 429` exposed all four progress style choices through localized Settings option labels and made the popup appearance preview render the selected `UsageProgress` style directly while preserving existing stored `line`/`circle` values and provider evidence boundaries.
- `Phase 430` added a reusable Settings `ProviderCarousel` foundation with previous/next controls, slide dots, keyboard arrow navigation, pointer drag threshold helpers, RTL direction semantics, focus-visible styling, and reduced-motion CSS while leaving section migration to `Phase 431`.
- `Phase 431` migrated Quick Setup, Visibility, Permissions, Credentials, and Source provider-shaped Settings sections onto `ProviderCarousel` while preserving data hooks, business controls, focused deep-link behavior, runtime text direction, and advanced/debug visibility boundaries.
- `Phase 432` closed the UI preference track with docs alignment and representative Playwright visual QA for popup, sidebar-sized dashboard, full-page dashboard, and Arabic Settings carousel; RDP Chrome capture produced invalid blank images in this run, so the limitation is recorded as capture-path evidence rather than a product visual pass.
- `Phase 200` completed a functionality-first Codex personal slice by preserving multiple visible usage windows, expanding Codex page-capture snippets, and surfacing the most constrained visible percentage window across dashboard, provider detail, and popup paths
- `Phase 201` completed the next functionality-first Codex personal slice by preserving visible flex credit balance cards as supplemental usage context without changing the primary percentage-window quota model
- `Phase 202` completed repeatable unpacked-extension verification for Codex personal multi-window plus flex-balance context, while fixing DOM capture so repeated percentages and single-character balance values are not lost before parsing
- `Phase 203` completed Cursor personal billing-period usage-summary surfacing across dashboard, provider detail, and popup while preserving that the personal page does not expose exact remaining included requests
- `Phase 204` completed adapter diagnostic raw fallback regression coverage, proving unknown or absent typed diagnostics still fall back to raw evidence in source-state, Settings, Provider Detail inputs, and localized presentation boundaries without changing runtime product behavior
- `Phase 205` compressed structured personal usage context inside popup featured-provider cards, keeping the popup focused on the most-constrained visible usage window plus one visible balance while preserving fuller dashboard and provider-detail context
- `Phase 206` hardened Codex personal parsing for merged DOM snippets such as inline remaining percentages and full-width percent text while preserving the visible-window and supplemental-balance truth boundary
- `Phase 207` hardened Codex personal parsing for merged usage-window label/value snippets while keeping normalized labels free of runtime percentages and preserving the same visible-window truth boundary
- `Phase 208` rendered every visible structured usage window as a remaining progress bar on dashboard and provider-detail surfaces, including weekly and model-specific Codex windows, while keeping popup compact
- `Phase 209` rendered structured toolbar-popup usage windows as compact circular remaining progress indicators while preserving dashboard/provider-detail bars and summary-only popup fallbacks
- `Phase 210` added per-surface line/circle progress style preferences and made the toolbar popup quota-first when provider quota cards exist
- `Phase 211` added popup size, corner, and shadow appearance preferences without changing sidebar/full-page behavior
- `Phase 212` added a Settings-side popup appearance preview so the popup appearance presets are not blind controls
- `Phase 213` verified the native toolbar popup in RDP Chrome after extension reload and tightened popup-only circular quota density for the current four-ring Codex quota state
- `Phase 214` packaged `0.1.0-rc.3`, so the installable zip now includes the Phase 200-213 functional provider and popup-surface changes after the older `rc.2` release boundary
- `Phase 215` added a Settings `Use current page` action for shipped session-page tracks, so real Codex or Cursor usage pages can be bound from the active tab before immediate provider refresh
- `Phase 216` added background page-binding lifecycle reconciliation for closed or navigated-away session-page tabs
- `Phase 217` added a distinct `capture_unavailable` session-page state for open Codex or Cursor tabs that cannot be read by extension scripting
- `Phase 218` added background `tabs.onReplaced` handling so matching replacement tabs keep the saved session-page binding
- `Phase 219` surfaced `page_session.capture_unavailable` as a dedicated provider source state across dashboard cards, provider detail, popup guidance, localized copy, and theme-recovery review snapshots
- `Phase 220` suppressed empty single-value percent progress on dashboard and provider detail when no measured percent value exists, preserving structured usage-window progress and documented non-percent total context
- `Phase 221` added direct dashboard-card and provider-detail source-page recovery actions for shipped session-page providers
- `Phase 222` extended direct source-page recovery into popup featured-provider cards
- `Phase 223` suppressed popup empty percent progress for unavailable measurements while preserving structured usage-window rings
- `Phase 224` made existing matching source-page recovery bind and refresh automatically, while preserving manual refresh for newly opened pages
- `Phase 225` reloaded existing capture-unavailable source tabs before binding and refreshing, including popup dispatch ordering that completes sync before focusing the provider tab
- `Phase 226` added a popup shell visual corner mask for extension-owned popup pixels while preserving the Chrome-owned native host boundary
- `Phase 227` added a popup host-edge blend plus stronger clipping markers to reduce the visible light rectangular transition around rounded native toolbar popups on dark Chrome surfaces
- `Phase 228` reset the Chrome action surface to a rectangular popup canvas after the host-edge blend proved visually worse than the standard default_popup treatment
- `Phase 229` replaced the Settings sync interval and warning threshold selects with a Material-style editable numeric combobox that keeps presets while accepting validated custom values
- `Phase 230` added Codex managed source-tab refresh for scheduled and manual session-page sync after saved page-binding metadata exists, without storing ChatGPT cookies or auth headers
- `Phase 231` unified user-facing Settings fixed option controls on a Material-style select-only combobox, including Source Connections source preference
- `Phase 232` added automatic Codex managed-page sync before a saved page binding exists, while preserving the inactive managed-tab boundary instead of claiming a fully hidden offscreen scrape
- `Phase 233` added Codex hydration retry for matched analytics routes whose usage-window DOM content appears after Chrome reports the tab loaded
- `Phase 234` added action badge quota selection so the toolbar badge can keep the attention count or show one selected remaining-quota value from dynamic provider/window candidates
- `Phase 235` added Settings sticky section navigation inside the existing top bar plus a return-to-top FAB for long Settings pages
- `Phase 236` completed dashboard provider-card Material unification under `Direction 04`, so dashboard provider cards now use Material card, supporting-surface, progress, chip, and footer-action roles without changing provider data, sync behavior, source truth labels, or Codex/Cursor fidelity claims
- `Phase 237` completed the first maintenance-oriented file split by moving provider-card CSS into `src/sidepanel/theme/provider-card.css` and reusing the Phase 236 visual review as the regression gate
- `Phase 238` completed the next maintenance-oriented file split by moving shared usage progress CSS into `src/sidepanel/theme/usage-progress.css` and importing it from both sidepanel and popup entries
- `Phase 239` completed the next maintenance-oriented file split by moving sidepanel-only interaction-audit workspace CSS into `src/sidepanel/theme/interaction-audit.css`
- `Phase 240` completed the next maintenance-oriented file split by moving sidepanel-only theme-recovery workspace CSS into `src/sidepanel/theme/theme-recovery.css`
- `Phase 241` completed the next maintenance-oriented file split by moving Settings theme-customization and popup-appearance preview CSS into `src/sidepanel/theme/settings-appearance.css`
- `Phase 242` completed the next maintenance-oriented file split by moving shared sidepanel detail-field and detail-note CSS into `src/sidepanel/theme/detail-surfaces.css`
- `Phase 243` completed the next maintenance-oriented file split by moving Settings source-card, disclosure, and diagnostic-row CSS into `src/sidepanel/theme/settings-source-cards.css`
- `Phase 244` completed the next maintenance-oriented file split by moving sidepanel form-field, Material select, editable number combobox, and switch-row CSS into `src/sidepanel/theme/form-controls.css`
- `Phase 245` completed the next maintenance-oriented file split by moving popup-only page, shell, provider-card, progress-ring, and responsive CSS into `src/popup/popup-theme.css`
- `Phase 246` completed the next maintenance-oriented file split by moving Settings grid, section navigation, section anchor, and back-to-top FAB CSS into `src/sidepanel/theme/settings-navigation.css`
- `Phase 247` completed the next maintenance-oriented file split by moving permission prompt, credential, and toast feedback CSS into `src/sidepanel/theme/access-feedback.css`
- `Phase 248` completed the next maintenance-oriented file split by moving sidepanel Top App Bar layout, sticky, title, and action-row CSS into `src/sidepanel/theme/top-app-bar.css`
- `Phase 249` completed the next maintenance-oriented file split by moving shared sidepanel/popup app-shell layout and shell-entry keyframes into `src/sidepanel/theme/app-shell.css`
- `Phase 250` completed the next maintenance-oriented file split by moving shared icon-button and text-button CSS into `src/sidepanel/theme/buttons.css`
- `Phase 251` completed the next maintenance-oriented file split by moving shared token-chip, status-chip, and meta-chip CSS into `src/sidepanel/theme/chips.css`
- `Phase 252` completed the next maintenance-oriented file split by moving shared hero-card and status-card CSS into `src/sidepanel/theme/surfaces.css`
- `Phase 253` completed the next maintenance-oriented file split by moving shared text hierarchy and copy primitive styling into a shared typography CSS module, loaded by both sidepanel and popup before surface tone overrides
- `Phase 254` completed the next maintenance-oriented file split by moving shared summary-strip, summary-pill, token-panel, dashboard-section, and narrow layout primitive styling into a shared layout primitives CSS module
- `Phase 255` completed the Settings navigation component extraction by moving Settings section ids, sticky section navigation rendering, and the back-to-top FAB from the oversized Settings page into focused sidepanel modules
- `Phase 256` completed the Settings overview visibility component extraction by moving the overview summary and provider visibility switch section out of the oversized Settings page into focused section components
- `Phase 257` completed the Settings permissions component extraction by moving permissions rendering out of the oversized Settings page into the focused Settings section component module
- `Phase 258` completed the Settings credentials component extraction by moving credential card/form rendering out of the oversized Settings page into the focused Settings section component module while preserving draft state and dispatch ownership in `SettingsPage.tsx`
- `Phase 259` completed the Settings section navigation hook extraction by moving active-section observation and scroll helpers out of the oversized Settings page into `src/sidepanel/use-settings-section-navigation.ts`
- `Phase 260` completed the Settings source section component extraction by moving Source Connections card rendering out of the oversized Settings page into `src/sidepanel/components/SettingsSourceSection.tsx` while preserving source preference controls, diagnostics, and session-page actions
- `Phase 261` completed the Settings preferences section component extraction by moving global preference rendering and option assembly out of the oversized Settings page into `src/sidepanel/components/SettingsPreferencesSection.tsx`
- `Phase 262` completed the `App.tsx` special-route app split by moving debug/operator route parsing, rendering, and special-route-only theme/locale hydration into `src/sidepanel/special-route-app.tsx`
- `Phase 263` completed the `App.tsx` browser-controls split by moving Chrome capability checks, tab sorting, and full-page route opening into `src/sidepanel/app-browser-controls.ts`
- `Phase 264` completed the `App.tsx` standard-app runtime hook extraction by moving initialization, theme sync, shared message application, toast/loading/error state, and retry logic into `src/sidepanel/use-standard-app-runtime.ts`
- `Phase 265` completed the `App.tsx` standard-app actions split by moving provider, settings, session-page, and full-page action handlers into `src/sidepanel/standard-app-actions.ts`
- `Phase 266` completed the `localized-copy.ts` provider-source display copy split by moving `buildProviderSourceDisplayLocalizedCopy` into `src/shared/provider-source-display-localized-copy.ts` while preserving the legacy re-export path
- `Phase 267` completed the `localized-copy.ts` provider-detail copy split by moving provider-detail copy plus badge and permission label helpers into `src/shared/provider-detail-localized-copy.ts` while preserving the legacy re-export path
- `Phase 268` completed the `localized-copy.ts` store-workflow copy split by moving store screenshot seed and native popup probe copy into `src/shared/store-workflow-localized-copy.ts` while preserving the legacy re-export path
- `Phase 269` completed the `localized-copy.ts` operator-workspace copy split by moving interaction-audit and theme-recovery operator copy into `src/shared/operator-workspace-localized-copy.ts` while preserving the legacy re-export path
- `Phase 270` completed the `localized-copy.ts` popup copy split by moving `buildPopupLocalizedCopy` into `src/shared/popup-localized-copy.ts` while preserving the legacy re-export path
- `Phase 271` completed the `localized-copy.ts` settings copy split by moving `buildSettingsLocalizedCopy` plus source-label helpers into `src/shared/settings-localized-copy.ts` while preserving the legacy re-export path
- `Phase 272` completed the `localized-copy.ts` diagnostic presentation split by moving `getProviderDiagnosticPresentation` plus private diagnostic formatters into `src/shared/provider-diagnostic-presentation.ts`, reducing `localized-copy.ts` to a compatibility export aggregator
- `Phase 273` completed the standard-app session-page actions split by moving Chrome tab discovery, source-page recovery, page-binding, and active-page attach handlers into `src/sidepanel/standard-app-session-page-actions.ts`
- `Phase 274` completed the Settings credential draft hook split by moving provider API key and Codex workspace draft state plus save/clear/input handlers into `src/sidepanel/use-settings-credential-drafts.ts`
- `Phase 275` completed the Settings preference options split by moving select, numeric combobox, and action badge option assembly into `src/sidepanel/settings-preference-options.ts`
- `Phase 276` completed the Popup appearance preview component split by moving Settings popup preview rendering into `src/sidepanel/components/PopupAppearancePreview.tsx`
- `Phase 277` completed the Theme customization card component split by moving Settings custom seed form and preview rendering into `src/sidepanel/components/ThemeCustomizationCard.tsx`
- `Phase 278` completed the Settings page view model and seed hook split by moving route-derived Settings models into `src/sidepanel/settings-page-view-models.ts` and custom seed draft behavior into `src/sidepanel/use-settings-theme-custom-seed-draft.ts`
- `Phase 279` completed the Settings source card component split by moving Source Connections article rendering into `src/sidepanel/components/SettingsSourceCard.tsx`
- `Phase 280` completed the Settings credentials section split by moving credential card rendering into `src/sidepanel/components/SettingsCredentialsSection.tsx`
- `Phase 281` completed the standard-app settings actions split by moving Settings update, credential, Codex workspace, source-preference, page-binding-clear, and preferences-saved handlers into `src/sidepanel/standard-app-settings-actions.ts`
- `Phase 282` completed the standard route app split by moving dashboard, settings, and provider-detail route rendering into `src/sidepanel/standard-route-app.tsx`
- `Phase 283` completed the Codex page-session capture reload retry by reloading an unreadable existing Codex tab with `bypassCache: true` and retrying capture once before surfacing `capture_unavailable`
- `Phase 283` then passed user-run RDP Chrome real-device validation with no issue reported, so the reload-retry path is no longer waiting on an extra manual smoke check
- `Phase 284` packaged `0.1.0-rc.4` after that validation, preserving current provider truth boundaries while moving the installable package beyond the old `rc.3` release boundary
- `Phase 285` completed post-rc4 smoke polish for dashboard provider-card circular boundaries, horizontal source chips, Settings sticky-chip density, full-page Settings back-to-top positioning, and direct host access refresh prompt recovery
- `Phase 286` packaged `0.1.0-rc.5` so the current install/review artifact includes Phase 285 fixes rather than the older `rc.4` package boundary
- `Phase 287` fixed cramped dashboard provider-card linear progress rows by restoring row padding, separating divider lines from content, and hardening remaining-label wrapping before packaging `0.1.0-rc.6`
- `Phase 288` fixed Settings source-card chips so source, contract, fidelity, and state labels use horizontal wrapping rows instead of a single-column chip stack, then packaged `0.1.0-rc.7`
- `Phase 289` fixed Settings top app bar density by using a wide title/chips/actions row and centered sidebar-width action/navigation rows, then packaged `0.1.0-rc.8`
- `Phase 290` fixed provider-card linear progress divider visibility by removing row gap/border stacking and drawing explicit row pseudo-dividers, then packaged `0.1.0-rc.9`
- `Phase 291` added Cursor managed session-page sync parity with Codex: `https://cursor.com/cn/dashboard/usage` is now the preferred open route, unreadable captures use real reload, freshly opened dashboards retry hydration, automatic sync can open a non-active managed tab under the same trigger gates, and `0.1.0-rc.10` packages the update
- post-`Phase 291` source work fixed Cursor usage-page logged-out detection, promoted visible Cursor billing-period and spend values into structured usage facts, compacted line-style usage-window reset labels into each window title row, and reformatted the action-badge hover tooltip so enabled Cursor facts are included in visible-provider context
- `Phase 292` reconciled docs around that post-rc10 source truth and made `Phase 293` the packaging slice because the then-current `rc.10` zip did not include those later fixes
- `Phase 293` packaged `0.1.0-rc.11`, rebuilt `dist`, generated `release/ai-usage-dashboard-0.1.0-rc.11.zip`, and made the post-rc10 Cursor, usage-window, and action-badge tooltip fixes available for the next install/review pass
- `Phase 294` recorded the user-run RDP Chrome visual smoke pass for `0.1.0-rc.11`; the user reported no obvious issue across full-page dashboard, toolbar popup, action-badge tooltip, and sidebar settings surfaces
- `Phase 295` accepted the user-reviewed mixed store screenshot candidate pack, replacing the older product requirement for three native popup screenshots with one native toolbar popup quick-glance image plus full-page/provider/source-depth images
- `Phase 296` captured that mixed screenshot pack from RDP Chrome and completed [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md), so the refreshed store screenshot request is fulfilled and the generated indexes now show `0` pending screenshot requests
- `Phase 297` fixed Codex stale-but-readable usage pages by forcing a cache-bypassing source-page reload before DOM capture
- `Phase 298` packaged `0.1.0-rc.12`, refreshed the trimmed transparent Chrome icon set, rebuilt `dist`, generated `release/ai-usage-dashboard-0.1.0-rc.12.zip`, and made the Phase 297 Codex freshness fix installable
- `Phase 299` created the [RC12 Chrome Web Store upload-candidate milestone](../Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md), aligning code, release package, screenshot evidence, icon evidence, README, release guide, and roadmap/TODO docs without changing runtime code
- `Phase 300` completed the post-submission provider expansion: Claude Team `https://claude.ai/settings/usage` is now shipped in current source as a session-page partial source
- `Phase 301` tightened that Claude Team session-page source by filtering generic helper/navigation copy from usage windows while preserving the four meaningful live rows (`Current session`, `All models`, `Claude Design`, and `Daily included routine runs`) and ordered duplicate percent snippets before quota-window pairing
- `Phase 302` made tracked root/`Doc/` workflow docs canonical again, ignored local-only `.agent/`, made project scripts auto-fall back to Node 22, made release packaging verify built-manifest version alignment, and packaged `0.1.0-rc.13` so the current upload candidate matched source through that slice
- `Phase 303` fixed Claude Team multi-row settings capture so the extension preserves ordered duplicate snippets plus the known visible usage rows before parser pairing
- `Phase 304` simplified Settings IA around the personal-user path with persisted user levels, Quick Setup, reduced basic-mode preferences, and one gated Advanced container for enterprise/API plus source controls
- `Phase 305` added current-source-only post-`rc.13` polish: cached-first full-page bootstrap with a sync-writeback drift guard, Settings select layering fixes, always-visible common `Appearance & Sync` controls plus a `More` disclosure, and a `3` minute minimum periodic sync with bounded startup jitter
- `Phase 306` packaged that follow-up polish into `0.1.0-rc.14`, extended cached-first bootstrap to the side panel, routed popup setup/problem actions into focused Settings targets, added popup quick-hide/setup affordances, restored always-visible app language, and fixed English display-level labels while keeping the RC13 milestone as the submitted review boundary
- `Phase 307` made Chrome plus the Playwright CRX bridge the default local browser automation path, changed project RDP helper defaults to Chrome-first with Brave fallback, and made profile audit discover the current unpacked extension id from the selected profile
- `Phase 308` recorded the `0.1.0-rc.14` Chrome helper smoke pass across dashboard, Settings, focused Settings, provider-detail, full-page dashboard, and popup surfaces while preserving the direct Playwright MCP restart boundary
- `Phase 312` added a testable RDP extension-window route map and locked ordinary Chrome tab/app-window captures of sidepanel-derived routes to the full-page surface path
- `Phase 313` reused that RDP route map from store screenshot runtime capture plans so screenshot request generation and extension-window smoke helpers share route path/title/size values
- `Phase 314` split interaction-audit iframe readiness and preset-action helpers out of the route component while preserving signoff and export behavior
- `Phase 315` shared the text-file download helper across interaction-audit and theme-recovery operator pages while preserving artifact content and filenames
- `Phase 316` shared clipboard-write behavior across interaction-audit and theme-recovery operator pages while preserving interaction-audit feedback distinctions
- `Phase 317` shared default operator runtime i18n bootstrap across interaction-audit and theme-recovery operator pages without changing runtime locale resolution rules
- `Phase 318` added Settings render coverage for source and Quick Setup focused deep links used by popup setup/problem actions
- `Phase 319` centralized popup Settings-action focus mapping and covered explicit-provider plus visible-provider-derived targets
- `Phase 320` extracted and tested popup source-page recovery tab selection while preserving binding and activation behavior
- `Phase 321` extracted popup route-opening actions and covered preview plus Chrome full-page handoffs
- `Phase 322` added active-tab and current-window Chrome sidePanel route-action coverage
- `Phase 323` extracted popup source-page recovery actions and covered fallback, direct-open, existing-tab, and created-tab branches
- `Phase 324` extracted popup refresh behavior and covered direct refresh, denied host-access, browser rejection, and granted host-access continuation branches
- `Phase 325` extracted popup theme-toggle update behavior and covered light, dark, system-resolved, and update-failure branches
- `Phase 326` extracted popup hide-provider behavior and covered provider-disable success plus message-bus failure branches
- `Phase 327` extracted popup guidance routing and covered Settings focus, dashboard, provider-detail, source-page, and hide-provider no-op branches
- `Phase 328` extracted popup provider progress rendering and covered usage-window, single-value, and hidden empty-percent branches
- `Phase 329` extracted popup snapshot-status view-model logic and covered no-provider, aligned, mixed, warning, and error decisions
- `Phase 330` extracted popup guidance-card view-model logic and covered first setup, missing access, missing credential, blocked provider, policy-only, and ready-provider decisions
- `Phase 331` extracted popup featured-section view-model logic and covered zero-provider, needs-attention, policy-only, and all-clear section stories
- `Phase 332` extracted popup secondary-action and surface-roles view-model logic and covered no-guidance, primary-route, zero-provider, policy-only, and fallback route-story decisions
- `Phase 333` extracted popup localized view-model orchestration while preserving the public `localizePopupViewModel` export path
- `Phase 348` extracted popup featured-provider list rendering while preserving quota-first provider-card rendering, route-owned action execution, settings-focus targeting, and featured-card data hooks
- `Phase 349` extracted popup header rendering while preserving route-owned refresh, theme-toggle, dashboard-tab behavior, pending states, and header data hooks
- `Phase 350` extracted popup guidance-card rendering while preserving route-owned action routing, settings-focus targeting, tone mapping, and guidance-card data hooks
- `Phase 351` extracted popup setup-coverage rendering while preserving route-owned action routing, settings-focus targeting, summary-strip rendering, and setup-coverage data hooks
- `Phase 352` extracted popup snapshot-status rendering while preserving route-owned display gating, tone mapping, and snapshot-status data hooks
- `Phase 353` extracted popup action-section rendering while preserving route-owned action execution, action ordering, button keys, and action-section data hooks
- `Phase 354` extracted popup surface-roles rendering while preserving route-owned display gating, route-story copy, and surface-roles data hooks
- `Phase 355` extracted popup featured-section rendering while preserving route-owned display gating, empty-state copy, heading levels, and featured-section data hooks
- `Phase 356` extracted popup loading and error-state rendering while preserving route-owned retry and dashboard/settings open actions
- `Phase 357` extracted Settings source-card compact-field, session-track, and diagnostics view-model logic while preserving the existing `settings-view-models.ts` compatibility export path
- `Phase 358` extracted Settings Quick Setup action ids, card construction, setup-state resolution, and helper text selection while preserving the existing `settings-view-models.ts` compatibility export path
- `Phase 359` extracted page-session tab priority scoring and sorting while preserving existing exact URL, hash-stripped URL, prefix URL, matched-title, active-tab, and recency weighting semantics
- `Phase 360` extracted page-session tab lifecycle helpers while preserving existing open-missing-tab, reload-tab, load-wait, reload-option normalization, and close cleanup semantics
- `Phase 361` extracted page-session script execution and page snapshot helpers while preserving existing DOM snapshot, boot-data, main-world window-value, and network observer semantics
- `Phase 362` extracted page-session network observer bridge helpers while preserving existing bridge id, fetch/XHR capture defaults, and malformed snapshot fallback semantics
- `Phase 363` extracted page-session candidate-tab selection while preserving bound-tab lookup, query-only fallback, duplicate filtering, binding-missing reporting, and auto priority sorting semantics
- `Phase 364` packaged the post-`rc.14` maintenance boundary into `0.1.0-rc.15`, aligned package and manifest versions, generated the release artifact, and recorded a new follow-up milestone while keeping RC13 as the submitted review boundary
- `Phase 365` added a source-only provider host-permission contract guard so provider route hints, Settings host origins, and manifest optional host permissions stay aligned without changing runtime permissions or provider support claims
- `Phase 366` verified first-run RDP Chrome extension screenshots, added a dashboard empty-state Quick Setup action, and made hidden-provider Quick Setup deep links fall back to the Quick Setup section instead of the top of Settings
- `Phase 334` extracted interaction-audit per-surface card rendering while preserving route-owned audit refs, preset actions, manual checks, and signoff callbacks
- `Phase 335` extracted interaction-audit review queue rendering while preserving route-owned queue construction and jump behavior
- `Phase 336` extracted interaction-audit request-scope rendering while preserving route-owned request-context state plus binding, revision, and next-command display
- `Phase 337` extracted interaction-audit signoff session rendering while preserving route-owned metadata state plus summary metrics, timestamp action, and session-summary hooks
- `Phase 338` extracted interaction-audit handoff summary rendering while preserving route-owned handoff draft generation, copy/download handlers, grouped surface lists, and workflow display
- `Phase 345` extracted interaction-audit guidance rendering while preserving route-owned URL construction, checklist copy, route links, and link data hooks
- `Phase 346` extracted interaction-audit workspace-control rendering while preserving route-owned state, import parsing, copy/download/reset behavior, feedback semantics, and preview hooks
- `Phase 347` extracted interaction-audit surface-grid rendering while preserving route-owned refs, readiness state, callbacks, fallback signoff state, and surface-card props
- `Phase 339` extracted theme-recovery current-state rendering while preserving route-owned snapshot construction, live action-badge reads, and summary value hooks
- `Phase 340` extracted theme-recovery theme-state rendering while preserving route-owned snapshot and live action-badge inputs plus theme detail hooks
- `Phase 341` extracted theme-recovery request-scope rendering while preserving route-owned query parsing, request-context state, and request identity hooks
- `Phase 342` extracted theme-recovery provider-list rendering while preserving route-owned snapshot construction, recovery classification, status badges, and provider hooks
- `Phase 343` extracted theme-recovery workflow-link rendering while preserving workflow checklist copy, extension/vendor link ids, hrefs, target behavior, and data hooks
- `Phase 344` extracted theme-recovery output rendering while preserving draft generation, export actions, feedback note rendering, and output data hooks
- provider closure still waits on available accounts or product decisions for JetBrains org-console, individual Claude Pro / Max behavior, and Gemini project-metrics graduation; Claude Team no longer belongs in the blocked-by-account queue
- operator evidence means archived real human/operator review exports for interaction-audit or theme-recovery workspaces; it remains useful, but it sits behind release package and store asset closeout
- the originally queued local-safe file splitting targets are now closed enough that further splitting should be driven by a concrete maintenance risk instead of the old Phase 236-era queue
- `Direction 10.3` no longer has a screenshot archive, icon, or packaging blocker for the current RC13 store pack; the next store step is human Chrome Web Store listing upload and review using the Phase 302 milestone
- `Phase 41` is now resolved for the narrowed RC selected on `2026-04-23`
- `Phase 42` has packaged `0.1.0-rc.2` and closed the release-closeout track for the narrowed RC
- `Phase 43` completed the first `Direction 02` slice by productizing source-fidelity semantics in the side panel
- `Phase 44` completed the next `Direction 02` slice by productizing trust-boundary and access-model semantics in the side panel
- `Phase 45` completed the next `Direction 02` slice by productizing provider-contract semantics for shipped and deferred paths in the side panel
- `Phase 46` completed the next `Direction 02` slice by productizing provider-contract visibility on the dashboard overview
- `Phase 47` completed the next `Direction 02` slice by productizing graduation-gate semantics for deferred provider contracts
- `Phase 48` completed the first `Direction 03` slice by shipping a compact toolbar popup that hands off into the full side panel
- `Phase 49` completed the next `Direction 03` slice by shipping an action badge whose meaning is the count of visible providers needing attention
- `Phase 50` completed the next `Direction 03` slice by shipping popup-to-sidepanel deep-link handoff for featured provider detail
- `Phase 51` completed the next `Direction 03` slice by shipping popup quick actions for dashboard and settings
- `Phase 52` completed the next `Direction 03` slice by making cached popup snapshot freshness explicit
- `Phase 53` completed the first `Direction 04` slice by shipping a Settings overview summary, sticky top actions, section-jump controls, and an earlier `720px` responsive collapse point
- `Phase 54` completed the next `Direction 04` slice by moving Settings source-card diagnostics behind explicit progressive disclosure
- `Phase 55` completed the next `Direction 04` slice by adding repeatable multi-width screenshot review and fixing the narrow Settings overflow it exposed
- `Phase 56` completed the next `Direction 04` slice by shipping a reduced-motion-safe motion baseline for surface entry, toast feedback, disclosure, and section jumps
- `Phase 57` completed the next `Direction 04` slice by compressing visible Settings source-card summaries and removing duplicate chip-level current-state fields from the body
- `Phase 58` completed the next `Direction 04` slice by grouping expanded Settings source-card diagnostics into clearer disclosure sections
- `Phase 59` completed the next `Direction 04` slice by compressing session-page track blocks into a compact structured layout
- `Phase 60` completed the next `Direction 04` slice by adding a repeatable compact Settings and reduced-motion QA baseline
- `Phase 61` completed the next `Direction 04` slice by unifying form-control and focus-state treatment across Settings and popup controls, then adding a repeatable keyboard interaction review pass
- `Phase 62` completed the next `Direction 04` slice by harmonizing status surfaces across dashboard, settings, popup, and toast feedback, then adding a repeatable tone review pass
- `Phase 63` completed the next `Direction 04` slice by harmonizing text hierarchy inside toned warning, error, and success surfaces, then adding a repeatable toned-content review pass
- `Phase 64` completed the next `Direction 04` slice by polishing pointer pressed states for Settings controls and adding a repeatable pointer hover plus press review pass
- `Phase 65` completed the next `Direction 04` slice by making unknown progress explicitly indeterminate, tightening compact chip tokens, and adding a repeatable chip-and-progress review pass
- `Phase 66` completed the next `Direction 04` slice by unifying supporting-surface hierarchy across provider detail and expanded Settings diagnostics, then adding a repeatable detail-supporting-surface review pass
- `Phase 67` completed the next `Direction 04` slice by shipping a fixed-width interaction-audit hub for dashboard, settings, detail, and popup surfaces, then adding a repeatable audit-hub review pass
- `Phase 68` completed the next `Direction 04` slice by adding preset-driven state shortcuts and inline status feedback to the audit hub, then adding a repeatable audit-preset review pass
- `Phase 69` completed the next `Direction 04` slice by turning those audit presets into an evidence pack with visible expectations, ordered screenshots, and machine-readable audit-state output
- `Phase 70` completed the next `Direction 04` slice by adding visible manual checks to each audit surface and generating a reusable markdown signoff pack from those checks plus the latest preset evidence
- `Phase 71` completed the next `Direction 04` slice by adding a persistent signoff workspace to the audit hub, including live draft plus JSON export and repeatable persistence review
- `Phase 72` completed the next `Direction 04` slice by adding signoff import plus local handoff support to the audit hub, including repeatable restoration review for exported workspace JSON
- `Phase 73` completed the next `Direction 04` slice by adding a visible handoff summary plus a current-state handoff bundle that links workspace conclusions to the latest preset evidence
- `Phase 74` completed the next `Direction 04` slice by adding an explicit operator workflow note plus a reusable bundle-builder command for exported signoff JSON
- `Phase 75` completed the next `Direction 04` slice by preserving review-session metadata across audit-hub export, reload, reset, import, and generated handoff bundles
- `Phase 76` completed the next `Direction 04` slice by adding direct downloadable audit artifacts plus metadata-aware filenames for local operator handoff
- `Phase 77` completed the next `Direction 04` slice by adding a live review queue with next-target guidance plus per-surface jump actions for human audit flow
- `Phase 78` completed the next `Direction 04` slice by adding a repo-backed review archive workflow plus a clearly labeled seeded baseline archive record
- `Phase 79` completed the next `Direction 04` slice by making the durable review archive self-indexing and machine-readable
- `Phase 80` completed the next `Direction 04` slice by adding a repo-backed pending operator review-request workflow for the first non-seeded human pass
- `Phase 81` completed the next `Direction 04` slice by making the request flow self-indexing plus fulfillable through one linked archived exported review record
- `Phase 82` completed the next `Direction 04` slice by making request-linked archives traceable in both directions through preserved source-request metadata
- `Phase 83` completed the next `Direction 04` slice by adding request-template integrity gates so mismatched exported workspace shapes can no longer fulfill the wrong request
- `Phase 84` completed the next `Direction 04` slice by binding exported audit workspaces to one pending request context so wrong-request exports are rejected even when shape still matches
- `Phase 85` completed the next `Direction 04` slice by surfacing pending-request template drift and rejecting stale request packages before they can be completed as current review scope
- `Phase 86` completed the next `Direction 04` slice by adding a regenerate workflow that supersedes stale requests and proves the aligned replacement request can complete end to end
- `Phase 87` completed the next `Direction 04` slice by adding a no-side-effect completion preflight that validates request-bound exports before request or archive state changes
- `Phase 88` completed the next `Direction 04` slice by making repo-backed request scope visible in the audit hub and by carrying bound request identity into downloaded artifact filenames
- `Phase 89` completed the next `Direction 04` slice by making request-bound source evidence explicit in preflight and by preserving the actual evidence path used during request completion
- `Phase 90` completed the next `Direction 04` slice by making repo-backed request packages self-contained through local evidence snapshots and by teaching preflight plus completion to prefer that request-local snapshot
- `Phase 91` completed the next `Direction 04` slice by making repo-backed request packages tamper-evident through recorded snapshot digests and by rejecting snapshot-integrity mismatches before archive state can be written
- `Phase 92` completed the next `Direction 04` slice by making repo-backed request exports revision-bound and by rejecting older exports after the same pending request package is refreshed in place
- `Phase 93` completed the next `Direction 04` slice by making request revisions visible in the audit hub plus bound download artifacts before the first real non-seeded export enters the repo
- `Phase 94` completed the next `Direction 04` slice by preserving request binding plus request revision through generated handoff bundles, durable archives, and the generated archive index
- `Phase 95` completed the next `Direction 04` slice by preserving evidence source plus integrity summary through generated handoff bundles, durable archives, and the generated archive index
- `Phase 96` completed the next `Direction 04` slice by preserving fulfillment receipt metadata inside fulfilled request manifests, request README output, and the generated request index
- `Phase 97` completed a documentation-only slice that expanded the roadmap for adaptive theming, toolbar product benchmark work, and staged internationalization
- `Phase 98` completed the first `Direction 05` slice by shipping shared `System / Light / Dark` theme-mode support plus the first dark-token foundation
- `Phase 99` completed the next `Direction 05` slice by shipping a repeatable theme review baseline for explicit-mode override plus `System` follow behavior across settings, dashboard, and popup
- `Phase 100` completed the next `Direction 05` slice by shipping a repeatable dark-surface review baseline for warning, error, progress, and supporting surfaces across dashboard, settings, and provider detail
- `Phase 101` completed the next `Direction 05` slice by shipping the first preset accent system with `Default Blue`, `Meadow`, and `Sunset`, plus a repeatable preset-theme review baseline across settings, dashboard, and popup
- `Phase 102` completed the next `Direction 05` slice by aligning the audit hub to the same persisted theme runtime and by shipping a repeatable review baseline for initial theme hydration plus live updates from the embedded Settings frame
- `Phase 103` completed the next `Direction 05` slice by shipping the first validated custom-seed input with preview plus reset actions and by shipping a repeatable cross-surface review baseline for custom-seed propagation
- `Phase 104` completed the next `Direction 05` slice by shipping a repeatable popup-local plus audit-local custom-seed review baseline and by normalizing themed text-button rendering so local accent surfaces no longer fall back to default blue
- `Phase 105` completed the next `Direction 05` slice by shipping a repeatable popup plus audit non-accent surface-stability review baseline so custom-seed changes do not silently perturb neutral, supporting, or warning surfaces
- `Phase 106` completed the next `Direction 05` slice by shipping a repeatable dashboard plus Settings plus provider-detail non-accent surface-stability review baseline so custom-seed changes do not silently perturb the main product surfaces
- `Phase 107` completed the next `Direction 05` slice by shipping a repeatable compact-width custom-seed review baseline so dashboard, Settings, provider detail, and popup stay overflow-free while preserving the same saved theme state
- `Phase 108` completed the next `Direction 05` slice by shipping a repeatable provider-state-specific custom-seed review baseline so warning or error treatments stay state-colored while neutral accent-bound surfaces still follow the active seed
- `Phase 109` completed the next `Direction 05` slice by shipping a repeatable seeded recovered-state review baseline so Cursor and Codex session-page surfaces can be proven to recover from host-access warnings back to neutral healthy treatments under the same saved seed
- `Phase 110` completed the next `Direction 05` slice by shipping a repeatable preview-interaction recovered-state review baseline so the shipped Settings host-access controls can drive that same Cursor and Codex recovery path without theme drift
- `Phase 111` completed the next `Direction 05` slice by shipping a repeatable extension-mode recovered-state review baseline so the real unpacked MV3 runtime can carry that same Cursor and Codex recovery path with pre-granted host access plus synthetic vendor tabs
- `Phase 112` completed the next `Direction 05` slice by shipping one dedicated theme-recovery operator workspace plus runbook so the remaining native-prompt or real-session gap is now about human evidence, not missing review tooling
- `Phase 113` completed the next `Direction 05` slice by shipping direct theme-recovery downloads plus a durable seeded archive workflow and generated archive index so recovery evidence no longer has to stay only in `tmp/`
- `Phase 114` completed the next `Direction 05` slice by shipping one repo-backed theme-recovery review-request workflow and generated request index so the first real operator pass now has a durable pending request package
- `Phase 115` completed the next `Direction 05` slice by shipping one repo-backed theme-recovery request-completion workflow and archive traceability so a future real operator export can now fulfill that pending request into one durable archive-linked receipt
- `Phase 116` completed the next `Direction 05` slice by shipping request-bound theme-recovery exports plus mismatch rejection so future real operator exports now preserve explicit request identity instead of remaining interchangeable
- `Phase 117` completed the next `Direction 05` slice by shipping one no-mutation theme-recovery preflight workflow so future real operator exports can now be checked safely before the archive-linked completion step
- `Phase 118` completed the first `Direction 06` slice by shipping one toolbar benchmark matrix plus one compact popup next-step guidance card for no-provider, missing-access, blocked-provider, and policy-only states
- `Phase 119` completed the next `Direction 06` slice by making the popup featured-provider area switch honestly between attention, healthy, policy-only, and empty states instead of keeping one fixed hierarchy
- `Phase 120` completed the next `Direction 06` slice by routing credential-backed setup states back to Settings directly from the popup instead of falling through to generic blocked-provider guidance
- `Phase 121` completed the next `Direction 06` slice by adding one compact popup setup-coverage summary so visible-provider breadth is scannable before the user drills into one next step
- `Phase 122` completed the next `Direction 06` slice by tightening popup setup-summary copy and adding one repeatable `360px` plus `420px` width review for the onboarding stack
- `Phase 123` completed the next `Direction 06` slice by making popup setup coverage itself stateful through one explicit stage hierarchy and adding one repeatable `360px` plus `420px` width review for those first-run setup states
- `Phase 124` completed the next `Direction 06` slice by suppressing the empty popup snapshot card for no-provider states and adding one repeatable `360px` plus `420px` width review for top-stack density
- `Phase 125` completed the next `Direction 06` slice by making popup quick actions explicitly secondary when a guidance card already provides the primary next step, and adding one repeatable action-hierarchy review
- `Phase 126` completed the next `Direction 06` slice by making popup header copy and top-summary labels specific to toolbar setup story, and adding one repeatable header-plus-summary review
- `Phase 127` completed the next `Direction 06` slice by making popup featured-provider badges plus supporting copy popup-specific, and adding one repeatable featured-card story review
- `Phase 128` completed the next `Direction 06` slice by making popup featured-provider CTA routing stateful, and adding one repeatable featured-card action review
- `Phase 129` completed the next `Direction 06` slice by reducing popup featured-provider density through fewer chips and shorter healthy or contract-only secondary copy, and adding one repeatable featured-card density review
- `Phase 130` completed the next `Direction 06` slice by replacing the last static popup contract explainer with one stateful `Surface roles` note, and adding one repeatable width review for that lower popup story layer
- `Phase 131` completed one build-and-workflow hardening slice by stabilizing unpacked-extension build entry names and formalizing the `commit / push / rebuild` closeout rule plus the RDP Chrome reload rule
- `Phase 132` completed one documentation-only slice by auditing current documentation completion truth and adding three sharper roadmap directions for doc completion, i18n bootstrap, and toolbar competitive fit
- `Phase 133` completed the first executable `Direction 08` slice by shipping a project-level documentation taxonomy, guardrail rules for doc classes, and explicit `generated operational ledger` labeling for the repo-backed request and archive indexes
- `Phase 134` completed the next executable `Direction 08` slice by shipping explicit freshness labels for the benchmark snapshot, documentation audit snapshot, historical MVP design baseline, current runbooks, the maintained manual checklist, and the maintained release guide
- `Phase 135` completed the next executable `Direction 08` slice by extending those explicit maintained-reference and freshness labels into all provider notes plus the page-session fixture conventions doc
- `Phase 136` completed the next executable `Direction 08` slice by labeling the remaining ambiguity-prone backlog plus index docs and by adding one lightweight executable taxonomy consistency check
- `Phase 137` completed the next executable `Direction 08` slice by labeling generated request/archive package READMEs, refreshing the current repo packages through generator-driven output, and extending the taxonomy consistency check to package-level docs
- `Phase 138` completed the next executable `Direction 08` slice by labeling the remaining roadmap direction files as explicit `living strategy` docs and extending the taxonomy consistency check to the full roadmap set
- `Phase 139` completed the next executable `Direction 08` slice by making the remaining convention-only doc boundary explicit and surfacing that policy through checker output
- `Phase 140` completed the next executable `Direction 08` slice by moving the documentation-completion line into maintenance mode and handing default strategic follow-up back to `Direction 10` and `Direction 09`
- `Phase 371` reopened `Direction 08` for one maintenance guard by extending `docs:check` to validate README, top-level TODO, and strategic-index current-phase references against the latest archived phase
- `Phase 141` completed the first executable `Direction 10` slice by shipping one competitive-fit decision matrix plus one truthful screenshot storyboard pack for store-facing toolbar work
- `Phase 142` completed the next executable `Direction 10` slice by shipping one maintained screenshot-capture runbook plus one generator-backed baseline capture pack for truthful extension-mode store capture
- `Phase 143` completed the next executable `Direction 10` slice by shipping one pending screenshot-capture request workflow for the first real RDP Chrome operator pass
- `Phase 144` completed the next executable `Direction 10` slice by shipping one screenshot completion plus archive workflow while truthfully keeping the repo at `1 pending request / 0 archived screenshot sets`
- `Phase 145` completed the next executable `Direction 10` slice by proving that the current RDP Chrome profile can open and capture real popup plus sidepanel runtime windows for future truthful store assets
- `Phase 146` completed the next executable `Direction 10` slice and added request-bound capture notes plus archive-preserved truth-note metadata, so future real screenshot sets can durably record omission, approximation, and fallback boundaries
- `Phase 147` completed the next executable `Direction 10` slice and added one request-bound screenshot seed plus runtime-lock workflow and one RDP capture runner, so future real screenshot sets can now reproduce stable storyboard states inside the real unpacked extension runtime before capture
- `Phase 148` completed the next executable `Direction 10` slice and added one fast-fail timeout plus stale-probe cleanup path for RDP capture commands, so failed X11 probes no longer hang the shell indefinitely before the next real screenshot attempt
- `Phase 149` completed the next executable `Direction 10` slice and archived the first real RDP Chrome screenshot set, so the direction now has one durable store-screenshot evidence package instead of only pending request flow
- `Phase 150` completed the next executable `Direction 10` slice and added one maintained store-listing copy pack anchored to that first archived screenshot set, so truthful screenshot evidence now has one matching copy hierarchy for future store updates
- `Phase 151` completed the next executable `Direction 10` slice and added one maintained store-listing localization source pack anchored to the manifest, maintained listing-copy pack, and first archived screenshot set, so future translated store listings can stay aligned with the same truthful evidence package
- `Phase 152` completed the next executable `Direction 10` slice and added one explicit popup host-width contract plus one repeatable width review for real Chrome action-popup rendering, so last-mile popup runtime verification no longer depends on browser-guessed document width
- `Phase 153` completed the next executable `Direction 10` slice and moved the popup width contract into the static popup bootstrap while routing repo-backed commands through one preferred local Node wrapper, so first-paint popup sizing and build/runtime verification no longer depend on post-boot class mutation or the older bundled Node runtime
- `Phase 155` completed the first executable runtime part of that Direction 10.2 line by proving a shared route-preserving full-page shell contract through the existing sidepanel entry and explicit `?surface=full-page` query state
- `Phase 156` completed the popup expand CTA to the dashboard full-page tab without changing the current popup quick-action sidepanel handoff semantics
- `Phase 157` completed the sidebar expand CTA to the route-preserving full-page shell across dashboard, settings, and provider-detail routes while hiding that expand control inside the full-page surface itself
- `Phase 158` completed the popup plus sidebar light-dark toggle button and carried that same quick control into the standard full-page shell without replacing Settings as the advanced theme surface
- `Phase 159` completed motion polish for popup-expand and sidepanel-expand full-page entry by adding short-lived entry hints plus restrained source-aware full-page shell entry motion that stays disabled when reduced motion is requested
- `Phase 160` completed the RDP Chrome runtime QA refresh by refreshing popup, sidepanel-settings, and standard full-page dashboard/settings/provider-detail captures while adding runtime-window cleanup into the helper workflow
- `Phase 161` completed the first `Direction 10.3` slice by turning the first screenshot archive into an explicit selection/stale-review pack and by updating the storyboard toward native toolbar-bubble popup capture plus full-page depth capture
- `Phase 162` completed the next `Direction 10.3` slice by creating one refreshed pending screenshot-capture request whose popup slots stay manual-only and whose deeper slots now target the full-page shell
- `Phase 163` completed the next `Direction 10.3` slice by probing native toolbar-popup exposure and confirming that the current `RDP Chrome` session still keeps final popup capture manual rather than exposing one separate capturable X11 bubble
- `Phase 164` completed the next `Direction 10.3` slice by adding one hybrid capture plan and request-bound staging pass, so the refreshed pending request now already carries full-page slots `4` and `5` while popup slots `1` through `3` stay manual native-toolbar capture
- `Phase 165` completed the next `Direction 10.3` slice by generating one dedicated manual screenshot handoff plus archive-readiness preflight, so the refreshed pending request now exposes remaining popup work in a smaller operator-facing bundle
- `Phase 166` completed the next `Direction 10.3` slice by adding one supported manual screenshot import workflow, so a real native-toolbar popup pass can now be copied back into the pending request without hand-editing the generated package files
- `Phase 167` completed the next `Direction 10.3` slice by generating one request-bound popup-notes overlay template plus one popup-capture checklist, so the final manual popup pass no longer needs ad-hoc note scaffolding
- `Phase 168` completed the next `Direction 10.3` slice by making archive completion default to the request package itself once popup files are imported, so the last remaining real-world step is now the actual popup capture rather than another manual path handoff
- `Phase 169` completed the next `Direction 10.3` slice by adding one request-bound manual finalize command plus handoff update, so the remaining real-world work is now the popup capture itself instead of popup capture plus extra repo bookkeeping
- `Phase 296` completed the mixed candidate screenshot file intake plus archive completion under `10_3_Store_Asset_Pack_And_Submission_TODOs.md`
- the previous repo-owned engineering default was adapter diagnostic raw fallback regression review for the shipped `en + zh_CN` runtime pilot under Direction 09, captured in `09_3_Adapter_Diagnostic_Reason_Code_TODOs.md`
- because `0.1.0-rc.16` is now packaged as the aligned follow-up candidate while the RC13 milestone remains the submitted store-review boundary, the active functional priority is now review-feedback or deliberate resubmission follow-up only if the Chrome Web Store flow asks for it
- the remaining high-value work in Direction 05 and Direction 04 is now evidence closure, not more tool-building:
  - `05_2_Theme_Recovery_Real_Operator_Closure_TODOs.md`
  - `04_2_Interaction_Audit_Real_Operator_Closure_TODOs.md`
- provider coverage gaps still remain truthful and unchanged:
  - JetBrains stays deferred for the active promise
  - Claude personal support is not yet graduated
  - Gemini remains policy-only
  - Codex and Cursor personal support remain partial, not absolute-remaining-balance claims
- the broader `Doc/` tree is not "fully done" even though the numbered phase queue is completed through `Phase 299`, because roadmap, request, archive-index, package-record, and reference docs remain living or maintained by design
- the numbered phase queue is now completed through `Phase 299`, and the repo now has one explicit documentation-class vocabulary plus one explicit freshness-label vocabulary plus one lightweight executable consistency check that also covers generated package READMEs, the full roadmap set, and the current convention-only boundary
- `Codex` personal support is already shipped as a `session_page` path, but it currently exposes usage-window percentages and reset timing, not one absolute remaining credit balance
- `Cursor` personal support is already shipped as a `session_page` path, but it currently exposes billing-period usage context, not one exact remaining included-request counter
- the extension action now opens a compact popup on click, the popup makes cached snapshot freshness explicit, and the badge shows the count of visible providers needing attention
- the popup now also includes one compact `Start here / Next step` guidance card, so the current toolbar-first story is no longer only freshness plus featured-provider cards
- the popup setup-coverage card now also carries one explicit stage hierarchy, so first-run setup state is visible before the user has to interpret individual counts
- the popup snapshot-status layer now also stays narrower in scope, so freshness stops repeating setup or action guidance already carried by the other top-stack cards
- the popup action row now also has a clearer hierarchy, so guidance owns the primary CTA and lower actions stay supplemental
- the popup header and top summary now also communicate setup state more directly, so first-run toolbar states stop borrowing broader dashboard summary language
- the popup featured-provider cards now also use popup-specific status labels plus a state-first lead line, so lower provider cards stop jumping back into side-panel contract prose immediately after the popup top story establishes setup context
- the popup featured-provider cards now also use stateful CTA routing, so setup blockers and contract-only states stop implying that provider detail is always the next surface
- the popup featured-provider cards now also use a lower-density chip and secondary-copy contract, so popup cards stop carrying three chips plus long side-panel contract prose in healthy and contract-only states
- the popup featured-provider area now also changes hierarchy honestly, so healthy and empty states no longer masquerade as `Needs attention`
- the popup now also distinguishes missing stored credentials from generic blocked-provider states, so credential-backed setup work now routes directly to Settings
- the popup now also exposes one compact setup-coverage summary, so users can see visible-provider readiness, access gaps, credential gaps, and policy-only coverage at a glance
- the popup onboarding stack now also has one repeatable width-range proof, so the newer guidance plus setup-summary layers are checked at realistic compact popup widths instead of only in one default preview size
- the popup now also has Settings-controlled size, corner, and shadow presets, so users can tune the Chrome action surface without adopting another extension's design language or changing sidebar/full-page behavior
- Settings now also has one popup appearance preview, so those presets are visible before reopening the native Chrome action popup
- the native toolbar popup has now been checked in RDP Chrome after extension reload, and popup-only circular quota density was tightened so four Codex quota rings stay focused on progress and labels instead of reset details
- the popup now also has one popup shell visual corner mask, so extension-owned document pixels follow the selected corner treatment while the Chrome action-popup host shape remains a browser-owned boundary
- the popup now also has one popup host-edge blend, so the remaining browser-owned backing is muted on dark Chrome surfaces without claiming true native transparency
- the popup now uses one rectangular popup canvas for the browser-owned action surface, keeping rounded treatment on internal cards and controls instead of fighting the native host window shape
- Codex session-page sync can now reopen a previously bound analytics page in an inactive managed tab during scheduled or manual refresh, keeping successful source tabs available for later alarms while prompting instead of repeating auto-open attempts after logged-out detection
- the user-facing Settings surface now uses Material-style select-only combobox controls for fixed option sets, so global preferences and Source Connections no longer fall back to native browser dropdown menus
- the UI uses a Material-like token system, now has a small reduced-motion-safe motion baseline, and also has an intermediate `720px` responsive collapse point, a more scannable Settings entry, a less repetitive source-card summary pattern, clearer grouped diagnostics inside disclosure, a compact session-track layout, consistent keyboard-focus treatment on the main interactive controls, harmonized status surfaces across the main warning/error/success states, clearer toned-surface text hierarchy, explicit pressed states on the remaining Settings pointer controls, a more coherent compact chip system, honest indeterminate progress treatment for unknown values, a clearer supporting-surface hierarchy across provider detail and expanded Settings diagnostics, one dedicated fixed-width interaction-audit hub for the main shipped surfaces, preset-driven shortcuts plus visible expectation copy plus visible manual checks plus a persistent signoff workspace plus signoff-import handoff support plus a visible handoff summary plus an explicit operator workflow and reusable bundle-builder path for the main manual review states, and repeatable width plus compact-height plus keyboard-interaction plus pointer-interaction plus status-surface plus toned-content plus chip-progress plus supporting-surface plus audit-hub plus audit-preset plus evidence-pack plus signoff-pack plus signoff-workspace plus signoff-import plus handoff-bundle plus operator-bundle review baselines
- the current theme foundation now ships shared `System / Light / Dark` mode selection, the first shipped preset accents, one validated custom-seed path, one repeatable explicit-override plus system-follow QA baseline, one repeatable dark-surface review baseline, one repeatable preset-theme review baseline, one repeatable audit-hub theme-alignment review baseline, one repeatable custom-seed review baseline, one repeatable popup-local plus audit-local custom-seed review baseline, one repeatable popup plus audit non-accent surface-stability review baseline, one repeatable dashboard plus Settings plus provider-detail non-accent surface-stability review baseline, one repeatable compact-width custom-seed review baseline, one repeatable provider-state-specific custom-seed review baseline, one repeatable seeded recovered-state review baseline, one repeatable preview-interaction recovered-state review baseline, one repeatable extension-mode recovered-state review baseline, one dedicated theme-recovery operator workspace plus runbook, one durable seeded theme-recovery archive workflow plus generated archive index, and one durable pending theme-recovery request workflow plus generated request index, but it still lacks any real fulfilled operator or native-prompt recovery archive and any decision on dual light-dark seeds
- the current popup architecture is already shipped, which means future toolbar work should focus on competitive product fit, onboarding, and store discoverability rather than restarting popup shell design
- the current extension now has manifest localization plus a broader runtime pilot slice in `en` and `zh_CN`, covering popup/dashboard shells, popup explanatory copy, the first settings-shell rollout, deeper settings helper copy, provider-detail shell/static copy, provider-source display wrappers, locale-aware generated values, duration-bearing runtime freshness/reset labels, one first compact-width plus RTL hardening pass, runtime root `lang` plus `dir` sync with one preview `app-dir` override, one maintained operator-workspace localization boundary, first operator-workspace shell localization, store-screenshot runtime helper localization, store seed submission-support caption localization, one raw provider source-truth localization policy, Cursor plus Codex source-selection/fallback plus credential/host-access plus page-session typed diagnostics, Cursor plus Codex usage-threshold typed diagnostics, Gemini policy-only typed diagnostics, sync-engine sync-stale typed diagnostics, typed-diagnostic-first source-state classification where covered, localized warning diagnostic presentation, localized source diagnostic presentation, localized adapter-error diagnostic presentation, compact-width QA for combined diagnostic presentation stacks, diagnostic archive/export compatibility, sample/store seed diagnostic metadata alignment, and diagnostic fixture/historical evidence alignment; raw provider source-truth detail strings plus deeper operator evidence/export payload copy still remain outside the shipped pilot

## Priority Order

### 2026-04-24 strategic refresh

1. [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
   Why first now:
   the immediate next local product work is the newly formalized popup plus sidepanel plus full-page surface-expansion track with ambient theme controls, and the store-readiness line already has truthful screenshot and listing evidence to build on.

2. [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
   Why second now:
   internationalization remains one of the clearest product gaps, but it should begin as one architecture pass after the current Direction 10 surface contract settles.

3. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why third now:
   the shared theme runtime is already strong and the first real operator recovery archive is now fulfilled, so this direction should stay in maintenance mode unless new theme states or regressions create fresh review work.

4. [Direction 04 - Material, Motion, And Responsive Hardening](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
   Why fourth now:
   the interaction-audit line is now mature enough that the best remaining work is real operator closure rather than more request/archive mechanism building.

5. [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
   Why fifth now:
   the repo now has one explicit taxonomy, one freshness model, one checker, and one convention-only boundary, so this direction should stay in maintenance mode unless new doc families or checker drift justify reopening it.

### Active continuation order

1. [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
   Why first now:
   `0.1.0-rc.16` is now packaged as the next aligned follow-up candidate, the mixed screenshot archive is complete, the trimmed transparent icon refresh and Claude Team usage-page path are already in the submitted RC13 boundary, and the next work is only review-feedback or deliberate resubmission follow-up after the human Chrome Web Store flow returns.

2. [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
   Why second now:
   the current pilot is broad enough to stay in maintenance mode unless a concrete diagnostic-body or provider-facing localization need appears.

3. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why third now:
   the current theme system is mature and truthful, and its first real operator evidence closure is complete; future work should be regression-driven rather than another generic tooling pass.

4. [Direction 04 - Material, Motion, And Responsive Hardening](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
   Why fourth now:
   the interaction-audit and operator-review workflow is similarly mature, and first real operator signoff is complete; future work should start only from a new surface, manual-check, or regression need.

5. [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
   Why fifth now:
   the documentation-governance line is already in maintenance mode and should now stay behind product, architecture, and evidence-closure work unless checker drift forces it back open.

### Additional requested directions from 2026-04-23

1. [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
   Why first among the new requests:
   the popup already exists, and `Phase 118` has now started the benchmark plus onboarding track with a fully local product slice that does not depend on future operator evidence.

2. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why second among the new requests:
   the theme system is strong and truthful, but its next most valuable slice is increasingly tied to real operator recovery evidence rather than more local-only tooling.

3. [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md)
   Why third among the new requests:
   full multi-language support is feasible, but it is broad, cross-cutting, and should follow one real localization architecture instead of a rushed ten-language text dump.

### Additional requested directions from 2026-04-24

1. [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
   Why first among the new requests:
   the popup already has real onboarding and stateful CTA behavior, so the next high-value step is competitive fit plus store-readiness, not popup shell invention.

2. [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
   Why second among the new requests:
   the project now has a 14-locale registry, manifest catalog set, guarded store listing draft, Arabic RDP visual baseline, guarded locale-specific RDP capture helper, first runtime shell pilots for every non-English locale in the 14-locale set, a split runtime catalog module, a focused shell-pilot coverage guard, and notranslate-protected extension shells for localized screenshots, but broad runtime copy still needs reviewed translations before it should be treated as fully localized product surface.

3. [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
   Why third among the new requests:
   the numbered phase queue is now closed through `Phase 371`, and the repo now has one explicit documentation taxonomy plus one freshness-label model plus one lightweight consistency check that reaches package-level generated docs, the full roadmap set, the current convention-only boundary, and current-phase reference drift; this direction is maintenance work, not the next default expansion line.

Completed first:

- [Direction 01 - Release Truthfulness And Closeout](./01_Direction_Release_Truthfulness_And_Closeout.md)
  Result:
  the narrowed RC was made truthful, verified, and packaged as `0.1.0-rc.2` on `2026-04-23`.

## External Reference Set

These links informed the roadmap decisions:

- Chrome `sidePanel` API:
  https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome extension i18n:
  https://developer.chrome.com/docs/extensions/develop/ui/i18n
- Chrome Web Store Program Policies:
  https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store user data guidance:
  https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- Chrome Web Store discovery:
  https://developer.chrome.com/docs/webstore/discovery/
- Chrome Web Store listing guidance:
  https://developer.chrome.com/docs/webstore/best-listing
- Chrome Web Store metrics:
  https://developer.chrome.com/docs/webstore/metrics/
- Material Web theming:
  https://material-web.dev/theming/material-theming/
- Material Web color:
  https://material-web.dev/theming/color/
- Material Web dark theme support note:
  https://material-web.dev/about/support/
- `Ai Usage 100%` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/quotameter/mbbkamghkbadgggdnjpflfobkfaepbbo

## Direction Files

- [01_Direction_Release_Truthfulness_And_Closeout.md](./01_Direction_Release_Truthfulness_And_Closeout.md)
- [01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md](./01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md)
- [01_2_Direction_JetBrains_Gate_Resolution.md](./01_2_Direction_JetBrains_Gate_Resolution.md)
- [01_2_Direction_JetBrains_Gate_Resolution_TODOs.md](./01_2_Direction_JetBrains_Gate_Resolution_TODOs.md)
- [02_Direction_Personal_User_Product_Semantics.md](./02_Direction_Personal_User_Product_Semantics.md)
- [02_1_Direction_Personal_User_Product_Semantics_TODOs.md](./02_1_Direction_Personal_User_Product_Semantics_TODOs.md)
- [03_Direction_Toolbar_Popup_And_Badge_Entry.md](./03_Direction_Toolbar_Popup_And_Badge_Entry.md)
- [03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md](./03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md)
- [04_Direction_Material_Motion_And_Responsive_Hardening.md](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
- [04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md](./04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md)
- [05_Direction_Adaptive_Theming_And_Color_Modes.md](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
- [05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md](./05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md)
- [06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
- [06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md](./06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md)
- [07_Direction_Internationalization_And_Localization.md](./07_Direction_Internationalization_And_Localization.md)
- [07_1_Direction_Internationalization_And_Localization_TODOs.md](./07_1_Direction_Internationalization_And_Localization_TODOs.md)
- [08_Direction_Documentation_Completion_And_Truth_Audit.md](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
- [08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md](./08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md)
- [09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
- [09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md](./09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md)
- [10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md](./10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md)
