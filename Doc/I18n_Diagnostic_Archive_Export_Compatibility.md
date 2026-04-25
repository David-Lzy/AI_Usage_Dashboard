# I18n Diagnostic Archive Export Compatibility

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the `Phase 197` compatibility boundary for diagnostic fields in archives, requests, screenshot seeds, and operator exports
- `Phase 198` confirmed maintained sample/store seed typed metadata can be additive without changing raw diagnostic evidence strings
- refresh it when diagnostic payload fields, archive schemas, request manifests, screenshot seed states, or operator export shapes change materially

## Goal

Keep localized diagnostic presentation separate from raw diagnostic evidence while confirming that current archive and export surfaces do not need a schema migration.

## Stable Evidence Fields

These fields remain the stable provider diagnostic evidence schema:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

Typed diagnostic fields remain optional additive metadata:

- `ProviderSnapshot.warningDiagnostic`
- `ProviderSnapshot.sourceSelectionDiagnostic`
- `ProviderSnapshot.sourceFallbackDiagnostic`

If a typed diagnostic is exported, `ProviderDiagnostic.rawMessage` must remain the raw body associated with the typed code.

## Presentation Boundary

Localized diagnostic labels and summaries are presentation output. They may be shown in Settings, Provider Detail, or future UI surfaces, but they do not replace raw evidence fields.

Do not translate, rename, or drop raw diagnostic fields in archive, request, seed, or export payloads. Historical archives must not be rewritten to add localized diagnostic prose.

## Compatibility Matrix

| Surface | Current diagnostic role | Compatibility decision |
| --- | --- | --- |
| `ProviderSnapshot` schema | structured runtime evidence | raw fields stay stable; typed fields stay optional |
| app-state storage | persisted runtime state | storage normalization merges stored snapshots and preserves optional diagnostic fields |
| store screenshot seed state | preview/runtime seed state | seeds patch `Partial<ProviderSnapshot>` and can preserve raw plus future typed diagnostic fields |
| store screenshot capture archives | screenshot evidence and operator notes | no structured diagnostic payload; visible diagnostic text is image evidence plus notes |
| theme recovery exports and archives | derived operator evidence | may carry raw-derived recovery detail strings; does not rename diagnostic payload keys |
| interaction audit exports and archives | manual signoff evidence | no structured provider diagnostic payload today |

## Phase 197 Review Gate

`npm run phase197:review` verifies:

- raw diagnostic fields and optional typed fields remain in `ProviderSnapshot`
- `ProviderDiagnostic.rawMessage` remains part of the typed diagnostic schema
- app-state storage preserves snapshot objects without enumerating diagnostic fields
- store screenshot seeds still patch `Partial<ProviderSnapshot>`
- store screenshot archives preserve screenshots and operator truth notes, not rewritten structured diagnostics
- theme-recovery exports preserve derived evidence strings without changing diagnostic payload keys
- interaction-audit exports still carry manual notes and checks rather than structured diagnostic fields

The review writes:

- `tmp/phase197-diagnostic-archive-export-compatibility-review/diagnostic-archive-export-compatibility-review.json`

## Current Decision

No archive or export schema migration is required before continuing localized diagnostic presentation work, as long as raw evidence fields remain present and typed diagnostic payloads stay additive.

`Phase 198` completed the sample and store seed diagnostic metadata alignment. Maintained sample or seed states can add typed diagnostics where stable codes already match raw strings, and raw diagnostic strings must remain unchanged.

The next safe runtime slice is diagnostic fixture and historical evidence alignment review. That work should separate mutable maintained fixtures from frozen archives before adding any further typed metadata.
