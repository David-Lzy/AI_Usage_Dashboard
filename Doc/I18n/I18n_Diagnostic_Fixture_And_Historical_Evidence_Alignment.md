# I18n Diagnostic Fixture And Historical Evidence Alignment

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the `Phase 199` fixture and historical evidence boundary for diagnostic fields
- refresh it when fixtures, request packages, archive schemas, diagnostic payload fields, or generated evidence workflows change materially

## Goal

Prevent future diagnostic localization or typed-metadata work from treating every raw diagnostic string as equally mutable.

Some raw diagnostic strings live in maintained source fixtures and can be aligned later. Other strings are historical evidence and must remain frozen unless a dedicated migration is approved.

## Scope Classes

### Mutable maintained fixtures

These are repo-owned source inputs:

- `fixtures/*`
- `src/shared/constants.ts`
- `src/sidepanel/store-screenshot-seed.ts`
- review scripts and tests that intentionally seed diagnostic states

Rules:

- typed metadata can be added only where stable diagnostic codes already match the raw evidence
- raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings stay source truth
- fixture alignment must not imply new provider coverage, new source-selection behavior, or translated adapter output
- if a fixture represents a provider-owned payload, do not inject product diagnostic fields into the vendor payload itself

### Generated request and handoff packages

These are generated operational ledgers and pending handoff packages:

- `Doc/testing/operator_review_requests/`
- `Doc/testing/theme_recovery_review_requests/`
- `Doc/testing/store_screenshot_capture_requests/`

Rules:

- regenerate through the existing commands instead of hand-editing evidence fields
- preserve request ids, revision ids, archive ids, filenames, route ids, preset ids, and raw evidence text
- do not translate diagnostic evidence fields inside request packages
- do not add typed diagnostic payloads unless a later request-schema migration explicitly approves it

### Frozen historical archives

These are historical evidence records:

- `Doc/testing/operator_reviews/`
- `Doc/testing/theme_recovery_reviews/`
- `Doc/testing/store_screenshot_archives/`

Rules:

- do not rewrite archived raw diagnostic evidence
- do not add translated diagnostic bodies to historical archives
- do not backfill typed diagnostics into historical archives
- do not change archived screenshots, capture notes, request bindings, or archive indexes except through a dedicated archive migration plan

## No Archive Rewrite Rule

Historical archives are evidence, not maintained UI copy. Future i18n work should add presentation layers to runtime surfaces or maintained fixtures, not mutate archived proof.

If a future migration truly needs archive schema changes, it must:

- create a dedicated migration plan
- preserve original raw evidence
- write a compatibility report
- update archive indexes through generator-owned commands
- state whether old archives are left frozen or migrated with explicit provenance

## Phase 199 Review Gate

`npm run phase199:review` verifies:

- maintained fixture paths and runtime seed paths still exist
- generated request and handoff directories still expose index files
- frozen archive directories still expose archive index files
- generated request/handoff packages do not accidentally gain typed diagnostic payload fields
- frozen archives do not accidentally gain typed diagnostic payload fields
- this maintained reference and the closeout docs preserve the boundary

The review writes:

- `tmp/phase199-diagnostic-fixture-historical-evidence-review/diagnostic-fixture-historical-evidence-review.json`

## Current Decision

No fixture or archive mutation is required before continuing diagnostic i18n work.

The next safe slice is adapter diagnostic raw fallback regression review. That work should prove absent, unknown, or intentionally raw-only diagnostics still fall back to raw evidence across the maintained presentation and classification paths.
