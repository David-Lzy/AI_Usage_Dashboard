# Direction 04.1 - Material, Motion, And Responsive Hardening TODOs

Date: 2026-05-03

Document class:

- living strategy

Status note:

- `Phase 53` completed the first executable slice on `2026-04-23` by shipping a Settings overview summary, sticky top actions, section-jump controls, and an earlier `720px` responsive collapse point
- `Phase 54` completed the next executable slice on `2026-04-23` by moving Settings source-card diagnostics behind explicit progressive disclosure while keeping the contract summary visible
- `Phase 55` completed the next executable slice on `2026-04-23` by adding repeatable screenshot-based width review at `360`, `420`, and `720`, and by fixing the `360px` Settings overflow it exposed
- `Phase 56` completed the next executable slice on `2026-04-23` by adding a reduced-motion-safe motion baseline for surface entry, toast feedback, source-card disclosure, and Settings section jumps
- `Phase 57` completed the next executable slice on `2026-04-23` by compressing visible Settings source-card summaries so they stop repeating chip-level current-state facts in the body
- `Phase 58` completed the next executable slice on `2026-04-23` by grouping expanded source-card diagnostics into clearer sections for source decision, value semantics, and trust boundary
- `Phase 59` completed the next executable slice on `2026-04-23` by compressing the session-page track block into a compact structured layout
- `Phase 60` completed the next executable slice on `2026-04-23` by adding a repeatable compact Settings and reduced-motion QA review pass
- `Phase 61` completed the next executable slice on `2026-04-23` by unifying focus-visible and interaction states across the main Settings and popup controls, then adding a repeatable keyboard interaction review pass
- `Phase 62` completed the next executable slice on `2026-04-23` by harmonizing warning, error, and success surfaces across the main UI states and adding a repeatable status-surface review pass
- `Phase 63` completed the next executable slice on `2026-04-23` by harmonizing text hierarchy inside toned warning, error, and success surfaces and adding a repeatable toned-content review pass
- `Phase 64` completed the next executable slice on `2026-04-23` by polishing pointer pressed states for the remaining Settings controls and adding a repeatable pointer hover plus press review pass
- `Phase 65` completed the next executable slice on `2026-04-23` by making unknown progress explicitly indeterminate, tightening compact chip tokens, and adding a repeatable chip-and-progress review pass
- `Phase 66` completed the next executable slice on `2026-04-23` by unifying supporting-surface hierarchy across provider detail and expanded Settings diagnostics, then adding a repeatable detail-supporting-surface review pass
- `Phase 67` completed the next executable slice on `2026-04-23` by shipping a fixed-width interaction-audit hub for the real dashboard, settings, detail, and popup surfaces, then adding a repeatable audit-hub review pass
- `Phase 68` completed the next executable slice on `2026-04-23` by adding preset-driven review shortcuts and inline status feedback to the audit hub, then adding a repeatable audit-preset review pass
- `Phase 69` completed the next executable slice on `2026-04-23` by turning the audit-hub presets into an ordered evidence pack with visible expectations, per-preset screenshots, and machine-readable status output
- `Phase 70` completed the next executable slice on `2026-04-23` by adding visible per-surface manual checks and generating a reusable markdown signoff pack from those checks plus the latest phase 69 evidence
- `Phase 71` completed the next executable slice on `2026-04-23` by adding a persistent in-browser signoff workspace with live draft plus JSON export and a repeatable persistence review pass
- `Phase 72` completed the next executable slice on `2026-04-23` by adding signoff import plus handoff support so exported workspace JSON can restore the local audit state, then adding a repeatable import review pass
- `Phase 73` completed the next executable slice on `2026-04-23` by adding a visible handoff summary plus a repeatable current-state handoff bundle that links workspace conclusions to the latest preset evidence
- `Phase 74` completed the next executable slice on `2026-04-23` by adding an explicit operator workflow note plus a reusable bundle-builder command for exported signoff JSON, then adding a repeatable operator-bundle review pass
- `Phase 75` completed the next executable slice on `2026-04-23` by adding review-session metadata to the audit hub workspace and generated bundles, then adding a repeatable metadata persistence plus import/export review pass
- `Phase 76` completed the next executable slice on `2026-04-23` by adding direct downloadable audit artifacts plus metadata-aware filenames, then adding a repeatable download-export review pass
- `Phase 77` completed the next executable slice on `2026-04-23` by adding a live review queue with next-target guidance plus jump actions, then adding a repeatable queue-order and jump review pass
- `Phase 78` completed the next executable slice on `2026-04-23` by adding a repo-backed review-archive workflow plus a clearly labeled seeded baseline archive, then adding a repeatable archive-generation review pass
- `Phase 79` completed the next executable slice on `2026-04-23` by making the durable review archive self-indexing, then adding a repeatable archive-index generation review pass
- `Phase 80` completed the next executable slice on `2026-04-23` by adding a repo-backed pending operator review-request workflow, then adding a repeatable request-package review pass
- `Phase 81` completed the next executable slice on `2026-04-23` by making the review-request flow self-indexing and fulfillable, then adding a repeatable request-lifecycle review pass
- `Phase 82` completed the next executable slice on `2026-04-23` by making request-linked archives traceable in both directions, then adding a repeatable request-to-archive traceability review pass
- `Phase 83` completed the next executable slice on `2026-04-23` by adding request-template integrity gates to completion, then adding a repeatable mismatched-export rejection review pass
- `Phase 84` completed the next executable slice on `2026-04-23` by binding exported audit workspaces to one pending request context, then adding a repeatable wrong-request rejection review pass
- `Phase 85` completed the next executable slice on `2026-04-23` by surfacing pending-request template drift and rejecting stale request packages during completion, then adding a repeatable drift-gate review pass
- `Phase 86` completed the next executable slice on `2026-04-23` by superseding stale requests through one regenerate workflow and proving the replacement request can complete end to end
- `Phase 87` completed the next executable slice on `2026-04-23` by adding a no-side-effect request-completion preflight and proving aligned, wrong-bound, and drifted exports are reported truthfully without mutating the pending request
- `Phase 88` completed the next executable slice on `2026-04-23` by making repo-backed request scope visible in the audit hub and proving bound exports also carry request identity into downloaded filenames
- `Phase 89` completed the next executable slice on `2026-04-23` by making request-bound evidence resolution truthful, visible in preflight, and preserved in completion archives
- `Phase 90` completed the next executable slice on `2026-04-23` by snapshotting request evidence into each repo-backed package, preferring that snapshot during resolution, and backfilling the shipped pending request into the same self-contained shape
- `Phase 91` completed the next executable slice on `2026-04-23` by recording request-snapshot digests, rejecting tampered packaged evidence during preflight plus completion, and adding a repeatable integrity-mismatch review pass
- `Phase 92` completed the next executable slice on `2026-04-23` by recording request-package revision digests, rejecting exports bound to older revisions of the same pending request, and backfilling the shipped pending request into the same revision-bound shape
- `Phase 93` completed the next executable slice on `2026-04-23` by surfacing request revisions in the audit hub, preserving them in bound downloads plus handoff text, and adding a repeatable revision-visibility review pass
- `Phase 94` completed the next executable slice on `2026-04-23` by preserving request binding plus request revision through generated handoff bundles, durable archives, and the generated archive index
- `Phase 95` completed the next executable slice on `2026-04-23` by preserving evidence source plus integrity summary through generated handoff bundles, durable archives, and the generated archive index
- `Phase 96` completed the next executable slice on `2026-04-23` by preserving fulfillment receipt metadata inside fulfilled request manifests, request README output, and the generated request index
- `Phase 236` completed the dashboard provider-card Material unification slice on `2026-05-03` by aligning dashboard provider cards with Material card, supporting-surface, progress, chip, and action roles
- `Phase 237` completed the first post-Phase 236 maintenance split on `2026-05-03` by moving provider-card CSS into `src/sidepanel/theme/provider-card.css`
- `Phase 238` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving shared usage progress CSS into `src/sidepanel/theme/usage-progress.css` for sidepanel and popup use
- `Phase 239` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving sidepanel-only interaction-audit CSS into `src/sidepanel/theme/interaction-audit.css`
- `Phase 240` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving sidepanel-only theme-recovery CSS into `src/sidepanel/theme/theme-recovery.css`
- `Phase 241` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving Settings appearance CSS into `src/sidepanel/theme/settings-appearance.css`
- `Phase 242` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving shared sidepanel detail-surface CSS into `src/sidepanel/theme/detail-surfaces.css`
- `Phase 243` completed the next post-Phase 236 maintenance split on `2026-05-03` by moving Settings source-card CSS into `src/sidepanel/theme/settings-source-cards.css`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 04 - Material, Motion, And Responsive Hardening](./04_Direction_Material_Motion_And_Responsive_Hardening.md)

## Detailed TODOs

### A. Material System Audit

- map current components against intended Material roles:
  - top app bar
  - cards
  - assist chips
  - progress indicators
  - form controls
  - snackbar/toast
- identify where the implementation is only "Material-like" instead of system-driven
- current shipped baseline:
  - top-bar buttons, text buttons, Settings nav chips, form controls, switch rows, and source-card disclosure toggles now share one interaction vocabulary for hover, press, and keyboard focus
  - visibility toggles now surface container-level focus treatment when the inner checkbox is keyboard-focused, instead of leaving the row visually inert
  - dashboard summary pills, warning provider cards, warning permission prompts, popup status cards, popup featured provider cards, and success/error toast feedback now use a more consistent tonal-surface system instead of mixing border-only and fill-only state treatments
  - toned warning, error, and success surfaces now also use a clearer content hierarchy so titles, large values, and subordinate supporting copy no longer all inherit the same neutral text color
  - Settings selects and visibility switch rows now also expose explicit pressed states for pointer input, and the repo now has a repeatable hover-plus-press review baseline in addition to the earlier keyboard-focus pass
  - token chips, status badges, meta chips, and credential-state badges now sit on a clearer compact-chip token baseline, and unknown progress no longer pretends to be a real measured percentage
  - provider-detail fields, neutral detail notes, and expanded Settings diagnostic groups now share a more explicit supporting-surface hierarchy instead of mixed neutral container fills, and dense detail values now wrap explicitly on compact widths
- current shipped baseline:
  - dashboard provider cards now use a Material header/status hierarchy, summary supporting surface, quota progress supporting surface, compact chip row, and right-aligned footer action hierarchy
  - Codex-style structured usage-window progress remains visible on dashboard cards while warning/error cards preserve state-toned surfaces
  - `ProviderCard` was updated as a presentation slice only; provider snapshots, source-selection semantics, sync behavior, and provider truth labels remain unchanged
  - provider-card CSS now has a focused module in `src/sidepanel/theme/provider-card.css` instead of continuing to grow the main Material theme file
  - shared usage-progress CSS now has a focused module in `src/sidepanel/theme/usage-progress.css`, loaded by both sidepanel and popup entries while preserving provider-card-specific overrides
  - interaction-audit workspace CSS now has a focused sidepanel-only module in `src/sidepanel/theme/interaction-audit.css`
  - theme-recovery workspace CSS now has a focused sidepanel-only module in `src/sidepanel/theme/theme-recovery.css`
  - Settings appearance CSS now has a focused sidepanel-only module in `src/sidepanel/theme/settings-appearance.css`
  - shared sidepanel detail-surface CSS now has a focused module in `src/sidepanel/theme/detail-surfaces.css`
  - Settings source-card CSS now has a focused sidepanel-only module in `src/sidepanel/theme/settings-source-cards.css`
- maintenance follow-up after the provider-card contract is stable:
  - continue splitting the remaining oversized theme and Settings files into smaller ownership units
  - keep file-splitting phases narrow so future diffs remain easier to review

### B. Motion System

- define a small motion vocabulary for:
  - route changes
  - toast entrance and exit
  - refresh feedback
  - expand and collapse transitions
- add `prefers-reduced-motion` support before any non-trivial animation ships
- current shipped baseline:
  - the side panel now has motion tokens for duration, easing, and movement distance
  - top-level app surfaces now use a light entry animation instead of appearing abruptly
  - Settings section jumps now scroll smoothly by default and switch back to instant jumps when reduced motion is requested
  - toast entrance and source-card disclosure now animate lightly in motion-safe mode and disable those animations in reduced-motion mode
  - `scripts/phase60-compact-settings-review.mjs` now verifies that compact reduced-motion scenarios resolve the shipped motion duration token to `0ms`

### C. Responsive Layout

- add more than one breakpoint
- test width ranges that match realistic side-panel use:
  - around `360px`
  - around `420px`
  - wider pinned panels
- consider height-aware layout decisions for long settings sections and sticky controls
- current shipped baseline:
  - the side-panel CSS now adds an intermediate `720px` collapse point before the older `480px` compact breakpoint
  - summary strips, settings grids, detail grids, and source-card grids now collapse earlier on medium-narrow widths
  - sticky Settings actions and section anchors now make long-screen navigation more predictable
  - `Phase 60` now also reviews a denser compact Settings state at `360x740` and `420x900`, instead of only full-height previews
  - `Phase 67` now also provides fixed-width embedded real-product frames so later human QA can inspect those compact widths without repeatedly resizing tabs by hand
  - `Phase 68` now also provides preset actions that jump those embedded frames into the highest-value review states instead of forcing the operator to prepare each state by hand

### D. Settings Page Restructure

- reduce repetition across provider source cards
- improve scannability of credential, source, and permission sections
- consider progressive disclosure for dense provider diagnostics
- make primary actions easier to find without scrolling through the entire page
- current shipped baseline:
  - Settings now opens with a compact overview summary plus direct section-jump controls
  - the Settings top bar is now sticky so `Back` and `Save` stay reachable while scrolling
  - credential cards are now grouped under one explicit credentials section instead of reading like isolated standalone blocks
  - source cards now keep preference, contract, fidelity, state, fallback, and availability summary visible by default while moving deeper diagnostics into an explicit expandable section
  - section-jump controls now use motion-safe smooth scrolling by default without forcing motion on reduced-motion users
  - source-card header chips now own the current path, contract, fidelity, and state labels, so the body summary can stay shorter and focus on preference, access model, fallback, and availability
  - source-card operational notes now stay collapsed from the default view unless fallback or warning-state context needs explanation
  - expanded source-card diagnostics now read as grouped sections instead of one flat two-column field grid
  - session-page track blocks now use chips, field rows, and conditional notes instead of stacked descriptive paragraphs

### E. Visual Verification

- add screenshot-based review points for dashboard and settings at multiple widths
- review motion with and without reduced-motion
- verify the visual system still matches the project's Material direction after changes
- current shipped baseline:
  - `scripts/phase55-multi-width-visual-review.mjs` now captures dashboard plus settings screenshots at `360`, `420`, and `720`
  - the script also records machine-readable overflow, summary-column, and sticky-top-bar checks in `tmp/phase55-visual-review/phase55-results.json`
  - the first shipped review pass confirmed `overflow=0` for dashboard and settings across those widths after the narrow Settings overflow fix
  - `scripts/phase60-compact-settings-review.mjs` now captures compact Settings review screenshots plus reduced-motion checks in `tmp/phase60-compact-settings-review/phase60-results.json`
  - `scripts/phase61-interaction-state-review.mjs` now captures keyboard focus-visible review screenshots plus machine-readable focus-state diffs in `tmp/phase61-interaction-state-review/phase61-results.json`
  - `scripts/phase62-status-surface-review.mjs` now captures dashboard, settings, popup, and toast status-surface screenshots plus machine-readable color checks in `tmp/phase62-status-surface-review/phase62-results.json`
  - `scripts/phase63-toned-content-review.mjs` now captures dashboard, settings, and popup toned-content screenshots plus machine-readable text-color hierarchy checks in `tmp/phase63-toned-content-review/phase63-results.json`
  - `scripts/phase64-pointer-state-review.mjs` now captures Settings and popup hover plus pressed-state screenshots and machine-readable pointer-style deltas in `tmp/phase64-pointer-state-review/phase64-results.json`
  - `scripts/phase65-chip-progress-review.mjs` now captures dashboard, settings, popup, and provider-detail screenshots plus machine-readable chip and progress checks in `tmp/phase65-chip-progress-review/phase65-results.json`
  - `scripts/phase66-detail-supporting-surface-review.mjs` now captures provider-detail and expanded Settings screenshots plus machine-readable supporting-surface checks in `tmp/phase66-detail-supporting-surface-review/phase66-results.json`
  - `scripts/phase67-interaction-audit-hub-review.mjs` now captures the fixed-width audit hub and machine-readable embedded-surface checks in `tmp/phase67-interaction-audit-hub-review/phase67-results.json`
  - `scripts/phase68-interaction-audit-preset-review.mjs` now captures the preset-driven audit hub and machine-readable preset-state checks in `tmp/phase68-interaction-audit-preset-review/phase68-results.json`
  - `scripts/phase69-interaction-audit-evidence-pack.mjs` now captures one overview screenshot plus ordered per-preset surface screenshots, visible preset expectations, audit-state messages, and machine-readable evidence under `tmp/phase69-interaction-audit-evidence-pack/phase69-results.json`
  - `scripts/phase70-interaction-audit-manual-signoff-pack.mjs` now captures visible per-surface manual checks, links them to the latest phase 69 evidence, and writes a reusable markdown signoff template under `tmp/phase70-interaction-audit-manual-signoff-pack/interaction-audit-manual-signoff.md`
  - `scripts/phase71-interaction-audit-signoff-workspace-review.mjs` now verifies the live signoff workspace, including per-check state, per-surface pass or follow-up status, note persistence across reload, reset behavior, and the presence of markdown plus JSON export actions
  - `scripts/phase72-interaction-audit-signoff-import-review.mjs` now verifies empty-input and invalid-JSON feedback, successful restoration from exported signoff JSON, and persisted workspace state after reload under `tmp/phase72-interaction-audit-signoff-import-review/phase72-results.json`
  - `scripts/phase73-interaction-audit-handoff-bundle-review.mjs` now verifies the visible handoff summary counts and unresolved-work lists, then writes a current-state handoff bundle linked to the latest phase 69 evidence under `tmp/phase73-interaction-audit-handoff-bundle-review/`
  - `scripts/build-interaction-audit-handoff-bundle.mjs` now turns exported signoff JSON plus the latest phase 69 evidence into reusable markdown and JSON handoff artifacts for later operator review
  - `scripts/phase74-interaction-audit-operator-bundle-review.mjs` now verifies the visible operator workflow note, then runs the reusable bundle-builder command on exported-style input under `tmp/phase74-interaction-audit-operator-bundle-review/`
  - `scripts/phase75-interaction-audit-review-session-metadata-review.mjs` now verifies reviewer/session/reviewed-at metadata capture, persistence, reset, reimport, and metadata-aware bundle generation under `tmp/phase75-interaction-audit-review-session-metadata-review/`
  - `scripts/phase76-interaction-audit-download-export-review.mjs` now verifies direct file downloads for signoff draft, signoff JSON, and handoff summary, including metadata-aware filenames and downloaded file contents under `tmp/phase76-interaction-audit-download-export-review/`
  - `scripts/phase77-interaction-audit-review-queue-review.mjs` now verifies review-queue counts, next-target updates, queue ordering, and jump-to-surface focus behavior under `tmp/phase77-interaction-audit-review-queue-review/`
  - `scripts/phase78-interaction-audit-review-archive-review.mjs` now verifies repo-backed archive layout, metadata preservation, and seeded archive truth under `tmp/phase78-interaction-audit-review-archive-review/`
  - `scripts/archive-interaction-audit-review.mjs` now writes durable review records under `Doc/testing/operator_reviews/`, and the first archived record lives at `Doc/testing/operator_reviews/2026-04-23-codex-seeded-review-archive-baseline/`
  - `scripts/build-interaction-audit-review-archive-index.mjs` now rebuilds `Doc/testing/Interaction_Audit_Review_Archive.md` plus `Doc/testing/operator_reviews/index.json` from archive manifests
  - `scripts/phase79-interaction-audit-review-archive-index-review.mjs` now verifies seeded and operator archive grouping, generated markdown index output, and machine-readable archive catalog output under `tmp/phase79-interaction-audit-review-archive-index-review/`
  - `scripts/create-interaction-audit-review-request.mjs` now writes pending operator review packages under `Doc/testing/operator_review_requests/`
  - `scripts/phase80-interaction-audit-review-request-review.mjs` now verifies pending request-package layout, honesty wording, and imported-template readiness under `tmp/phase80-interaction-audit-review-request-review/`
  - `scripts/phase84-interaction-audit-request-bound-export-context-review.mjs` now verifies that pending request templates carry bound request context, wrong-request exports are rejected even when shape still matches, and correctly bound exports still fulfill the request normally
  - `scripts/phase85-interaction-audit-request-template-drift-gate-review.mjs` now verifies that drifted pending requests are flagged in the generated request index and rejected during completion until the request is regenerated
  - `scripts/regenerate-interaction-audit-review-request.mjs` now supersedes one stale request and writes one aligned replacement request from the current source template
  - `scripts/phase86-interaction-audit-request-regeneration-review.mjs` now verifies stale-request supersession, replacement request generation, and end-to-end completion of the regenerated request
  - `scripts/preflight-interaction-audit-review-request.mjs` now evaluates seeded-state rejection, request binding, workspace shape, and current-template drift without writing archive output
  - `scripts/phase87-interaction-audit-request-completion-preflight-review.mjs` now verifies aligned exports pass preflight, wrong-bound and drifted exports fail preflight, and the pending request stays unchanged
  - `scripts/phase88-interaction-audit-request-scope-visibility-review.mjs` now verifies default ad-hoc scope, bound request-scope guidance after import, and request-aware signoff JSON download filenames
  - `scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs` now verifies request-bound completion uses the request package evidence by default, explicit `--evidence` overrides remain truthful, and preflight surfaces evidence-pack readiness
  - `scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs` now verifies a request package snapshots its evidence locally, still preflights and completes after the original external evidence file is removed, and archives the snapshot path truthfully
  - `scripts/phase91-interaction-audit-request-evidence-integrity-review.mjs` now verifies preflight plus completion reject packaged evidence whose current file no longer matches the digest recorded in the request manifest
  - `scripts/phase92-interaction-audit-request-revision-binding-review.mjs` now verifies exports bound to older revisions of the same pending request are rejected after that request package is refreshed in place
  - `scripts/phase93-interaction-audit-request-revision-visibility-review.mjs` now verifies the audit hub surfaces the current request revision and that bound downloads plus handoff text preserve the same revision truth
  - `scripts/phase94-interaction-audit-request-context-bundle-archive-review.mjs` now verifies request-bound signoff exports preserve request binding plus request revision through generated handoff bundles, archive manifests, archive README output, and the generated archive index
  - `scripts/phase95-interaction-audit-evidence-provenance-bundle-archive-review.mjs` now verifies bundle and archive artifacts preserve evidence source plus integrity summary, and that the generated archive index surfaces the same provenance truth
  - `scripts/phase96-interaction-audit-request-fulfillment-receipt-review.mjs` now verifies fulfilled request manifests, request README output, and the generated request index preserve one compact completion receipt after real request completion
  - `scripts/phase236-dashboard-provider-card-material-review.mjs` now verifies dashboard provider cards at `360px`, `420px`, and full-page width in light and dark themes, including Codex structured usage-window progress, warning/error state-toned cards, footer action density, and overflow checks
- next active visual verification gap:
  - keep future file-splitting phases covered by focused review scripts so the newly unified provider-card visual contract does not regress

## Out Of Scope

- dark mode as a priority before the base light theme is stabilized
- illustration-heavy marketing polish
- changing the extension into a non-Material design system
