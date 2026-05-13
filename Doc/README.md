# Documentation Index

Date: 2026-05-14

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the tracked entry point for project documentation
- update it whenever document categories, archive locations, or generated-ledger boundaries change

## Start Here

1. [Project README](../README.md)
2. [Agent rules](../AGENTS.md)
3. [Phase index](./TODOs/00_Phase_Index.md)
4. [Current project TODOs](./AI_Usage_Dashboard_TODOs.md)
5. [Strategic roadmap index](./Roadmap/00_Strategic_Directions_Index.md)

The repository must remain understandable from tracked files alone. Local `.agent/`
material may exist for an individual workspace, but it is ignored by git and is not
the shared source of truth.

## Current Project Truth

- [Current project TODOs](./AI_Usage_Dashboard_TODOs.md) - active status, release boundary, and next execution queue.
- [Roadmap](./Roadmap/00_Strategic_Directions_Index.md) - strategic directions and direction-specific TODOs.
- [Phase index](./TODOs/00_Phase_Index.md) - active numbered slice and latest completed slice.
- [Provider notes](./provider_notes/) - provider-specific implementation and truth-boundary references.
- [Milestones](./Milestones/) - release and submission handoff records.
- [Localized operator/store RDP visual QA](./testing/localized_operator_store_rdp_visual_qa/README.md) - representative helper-route locale screenshot evidence.

## Functional References

- `Doc/Product/` - current product, surface, and design-contract references.
- `Doc/I18n/` - localization architecture, message contracts, and source-truth policies.
- `Doc/Store/` - Chrome Web Store listing, screenshot, and submission-copy references.
- `Doc/testing/` - generated operational ledgers, active QA indexes, and test evidence.

## Historical Evidence

- `Doc/TODOs/Archive/by-phase/` - completed phase TODO files, grouped by phase range.
- `Doc/testing/Archive/phase-reports/` - completed phase review reports, grouped by phase range.
- `Doc/Archive/` - dated audits, benchmarks, old baselines, and historical notes.

Historical evidence is preserved for traceability. Do not rewrite old evidence just
to match current terminology unless a moved path or broken link makes the file
unreadable.

## Compatibility Stubs

The following old process-doc paths remain only as short compatibility stubs:

- [Project_Quickstart.md](./Project_Quickstart.md)
- [Development_Guardrails.md](./Development_Guardrails.md)
- [Documentation_Taxonomy.md](./Documentation_Taxonomy.md)
- [Release_Packaging_Guide.md](./Release_Packaging_Guide.md)
- [AUTONOMOUS_PROMPT.md](./AUTONOMOUS_PROMPT.md)
- testing runbooks under `Doc/testing/`

When these stubs need updates, update this index or the tracked target document
instead of recreating a second maintained body in the stub.
