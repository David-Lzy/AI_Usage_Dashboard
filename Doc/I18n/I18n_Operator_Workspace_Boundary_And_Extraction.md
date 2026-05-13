# I18n Operator Workspace Boundary And Extraction

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current localization boundary for operator-only review workspaces
- refresh it when interaction-audit or theme-recovery workspace copy moves further under the runtime i18n pilot
- `Phase 402` adds the 14-locale implementation inventory:
  - [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](./I18n_Operator_Workspace_14_Locale_Copy_Inventory.md)

## Goal

Define the first extraction boundary for operator workspaces before translating them.

The operator pages are not ordinary product surfaces. They produce review evidence, handoff text, archive inputs, request bindings, and source-truth labels. Their copy should be localized only where it helps the operator navigate the workspace without weakening the evidence vocabulary that downstream scripts and archives expect.

## Workspaces In Scope

### Interaction audit workspace

Runtime route:

- `src/sidepanel/index.html#debug-interaction-audit`

Source file:

- [InteractionAuditPage.tsx](../../src/sidepanel/routes/InteractionAuditPage.tsx)

Current role:

- fixed-width real-browser QA hub
- embedded surface review harness
- operator signoff draft workspace
- signoff JSON and handoff-summary export surface
- request-bound completion input for later interaction-audit archives

### Theme recovery workspace

Runtime route:

- `src/sidepanel/index.html#debug-theme-recovery-review`

Source file:

- [ThemeRecoveryReviewPage.tsx](../../src/sidepanel/routes/ThemeRecoveryReviewPage.tsx)

Current role:

- real-session theme recovery review surface
- extension surface and vendor-session link hub
- summary and JSON export surface
- request-bound completion input for later theme-recovery archives

## First Extraction Review

`Phase 178` did not translate these pages. It made their first extraction review repeatable.

The repeatable review script is:

- [phase178-operator-workspace-i18n-boundary-review.mjs](../../scripts/phase178-operator-workspace-i18n-boundary-review.mjs)

The script verifies that both workspaces still contain the expected operator markers, then writes a temporary extraction snapshot to:

- `tmp/phase178-operator-workspace-i18n-boundary-review/operator-workspace-copy-inventory.json`

That snapshot is evidence for the scale and categories of copy still outside the pilot, not a committed translation catalog.

## Phase 179 Shell Localization

`Phase 179` shipped the first operator-workspace shell-localized slice for `en + zh_CN`.

The runtime implementation lives in:

- [localized-copy.ts](../../src/shared/localized-copy.ts)
- [InteractionAuditPage.tsx](../../src/sidepanel/routes/InteractionAuditPage.tsx)
- [ThemeRecoveryReviewPage.tsx](../../src/sidepanel/routes/ThemeRecoveryReviewPage.tsx)
- [App.tsx](../../src/sidepanel/App.tsx)

The localized scope is intentionally presentation-only:

- workspace top bar titles and subtitles
- primary navigation labels
- hero cards
- top-level guidance sections
- theme-recovery workflow and quick-link labels
- copy/download action labels and generic feedback messages

Evidence payloads remain English. Export schemas, request bindings, generated filenames, archive-facing status values, fixture ids, provider source-truth values, and vendor-owned text remain outside this shipped shell slice.

## Phase 402 14-Locale Inventory

`Phase 402` inventories the next expansion from `en + zh-CN` to the 14 shipped runtime locales.

Implementation planning now lives in:

- [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](./I18n_Operator_Workspace_14_Locale_Copy_Inventory.md)

That inventory separates:

- existing structured helper buckets that can move directly to explicit 14-locale copy
- hardcoded interaction-audit panels that can move behind helper keys if `Phase 404` remains small enough
- evidence/export/request/preset/command values that must remain raw and stable

## Candidate Localizable Copy

These categories can move into the runtime i18n pilot first:

- workspace top bar titles and subtitles
- navigation actions such as opening dashboard, settings, popup, provider detail, or vendor routes
- section labels and section titles
- non-evidence helper paragraphs that explain how to use the workspace
- button labels for copy, download, refresh, reset, import, and export commands
- generic error or empty-state text where no archive payload depends on the exact English phrase

Recommended first implementation slice:

1. localize top bars, section headings, and primary actions
2. localize non-evidence helper copy
3. localize generic feedback messages
4. keep export payload fields and source-truth labels stable until downstream archive consumers are explicitly reviewed

## Evidence-preserving English

These categories should stay in English until a separate archive-compatibility decision is made:

- exported JSON field names
- request ids, archive ids, revision labels, and generated filenames
- signoff state values that archive scripts parse or display as source truth
- fixture or preset ids such as `dashboard-360`, `settings-420`, `popup-360`, and provider route ids
- vendor-owned strings and raw provider source-truth wording
- exact status terms already used as evidence labels inside existing archives or request manifests

If one of these categories is localized later, the implementation must first decide whether the localized string is presentation-only or whether the evidence schema itself changes.

## Current Boundary

As of `Phase 199`:

- the runtime app already localizes the main product surfaces in `en + zh_CN`
- the operator workspaces now have shell-localized navigation and helper copy
- store helper routes now have localized helper copy plus helper-only submission-support captions
- raw provider source-truth strings now have a maintained policy boundary
- provider-source display wrappers now localize enum/helper-state labels and descriptions without translating raw adapter evidence
- adapter diagnostic reason-code planning now exists before any diagnostic-body localization
- the type-only additive diagnostic model now exists without changing rendered UI behavior
- Cursor source-selection and fallback typed diagnostics now exist beside raw adapter strings
- Codex source-selection and fallback typed diagnostics now exist beside raw adapter strings
- Cursor and Codex credential plus host-access typed diagnostics now exist beside raw adapter warning strings
- Cursor and Codex page-session typed diagnostics now exist beside raw adapter warning strings
- Cursor and Codex usage-threshold typed diagnostics plus Gemini policy-only typed diagnostics now exist beside raw adapter warning strings
- sync-engine stale cached-state and automatic-sync-overdue typed diagnostics now exist beside raw sync-engine warning strings
- source-state classification now prefers typed warning diagnostics while keeping raw English warning-pattern matching for compatibility
- warning diagnostic presentation now localizes known typed warning labels and summaries while keeping raw warning bodies available
- source diagnostic presentation now localizes known typed source-selection and fallback labels and summaries while keeping raw source bodies available
- adapter-error diagnostic presentation now localizes known typed `adapter.*` labels and summaries while keeping raw adapter warning bodies available
- compact diagnostic presentation QA now verifies localized summaries and raw evidence bodies together at narrow Settings and Provider Detail widths
- diagnostic archive/export compatibility review now records that localized diagnostic presentation is not an operator evidence schema
- maintained sample and store seed typed metadata now aligns stable codes with raw diagnostic evidence strings without changing evidence schemas
- diagnostic fixture and historical evidence alignment now keeps generated request/handoff packages and frozen archives out of typed diagnostic backfills
- archive payload semantics remain English and unchanged
- the repo has a maintained extraction boundary for deeper operator-workspace localization decisions
- the next implementation step should avoid evidence-schema changes unless a later dedicated compatibility review explicitly approves them

## Follow-Up

After `Phase 402`, typed diagnostic presentation has explicit 14-locale coverage and the remaining operator-workspace helper-copy boundary is inventoried in [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](./I18n_Operator_Workspace_14_Locale_Copy_Inventory.md). The remaining `Direction 09` follow-up should continue with store-helper inventory and then the approved operator/store helper implementation slices:

- keep raw source-selection, fallback, warning, and adapter-error diagnostic bodies available for provider detail, exports, and archive evidence
- keep operator evidence payload fields, request identifiers, preset ids, filenames, route hashes, and generated evidence strings untranslated
- keep raw provider `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` values unchanged
- keep generated store-listing source docs out of runtime code unless that copy is shown by the extension

Operator evidence payload fields, request identifiers, and generated evidence strings should remain out of scope until a dedicated archive-compatibility review says otherwise.
