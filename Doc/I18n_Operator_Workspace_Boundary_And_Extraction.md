# I18n Operator Workspace Boundary And Extraction

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current localization boundary for operator-only review workspaces
- refresh it when interaction-audit or theme-recovery workspace copy moves under the runtime i18n pilot

## Goal

Define the first extraction boundary for operator workspaces before translating them.

The operator pages are not ordinary product surfaces. They produce review evidence, handoff text, archive inputs, request bindings, and source-truth labels. Their copy should be localized only where it helps the operator navigate the workspace without weakening the evidence vocabulary that downstream scripts and archives expect.

## Workspaces In Scope

### Interaction audit workspace

Runtime route:

- `src/sidepanel/index.html#debug-interaction-audit`

Source file:

- [InteractionAuditPage.tsx](../src/sidepanel/routes/InteractionAuditPage.tsx)

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

- [ThemeRecoveryReviewPage.tsx](../src/sidepanel/routes/ThemeRecoveryReviewPage.tsx)

Current role:

- real-session theme recovery review surface
- extension surface and vendor-session link hub
- summary and JSON export surface
- request-bound completion input for later theme-recovery archives

## First Extraction Review

`Phase 178` does not translate these pages yet. It makes their first extraction review repeatable.

The repeatable review script is:

- [phase178-operator-workspace-i18n-boundary-review.mjs](../scripts/phase178-operator-workspace-i18n-boundary-review.mjs)

The script verifies that both workspaces still contain the expected operator markers, then writes a temporary extraction snapshot to:

- `tmp/phase178-operator-workspace-i18n-boundary-review/operator-workspace-copy-inventory.json`

That snapshot is evidence for the scale and categories of copy still outside the pilot, not a committed translation catalog.

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

As of `Phase 178`:

- the runtime app already localizes the main product surfaces in `en + zh_CN`
- the operator workspaces remain English by design
- the repo now has a maintained extraction boundary for those workspaces
- the next implementation step can localize a narrow operator shell without changing archive payload semantics

## Follow-Up

The next `Direction 09` implementation slice should localize the operator-workspace shell only:

- top bar title and subtitle
- section labels and section titles
- primary navigation and copy/download action labels
- generic helper copy that does not appear in request or archive payloads

Archive payload fields, request identifiers, and generated evidence strings should remain out of scope until a dedicated archive-compatibility review says otherwise.
