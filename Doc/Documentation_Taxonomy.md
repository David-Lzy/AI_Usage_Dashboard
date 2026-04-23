# Documentation Taxonomy

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current taxonomy reference for documentation classes and freshness models
- refresh it whenever the project changes how document classes or freshness semantics should be interpreted

Purpose:

- define the project's documentation classes
- define what "complete" means for each class
- reduce ambiguity when contributors ask whether the docs are already done

## Document Classes

### 1. Closed Evidence

Meaning:

- fixed evidence of completed work
- should remain readable after closeout
- should not remain in the active execution path

Typical examples:

- archived numbered phase files under [Doc/TODOs/Archive](./TODOs/Archive/README.md)
- fixed phase testing reports under `Doc/testing/Phase_*.md`
- generated archive-package `README.md` files inside dated review archive directories

Completion model:

- can be complete
- should be archived or left as fixed evidence
- should not be treated as open roadmap work

### 2. Living Strategy

Meaning:

- strategy, prioritization, or future-direction documents that are expected to evolve

Typical examples:

- roadmap direction files under `Doc/Roadmap/`
- roadmap child TODO files under `Doc/Roadmap/`

Completion model:

- not "done forever" unless explicitly closed, superseded, or folded into completed release work
- should carry clear status notes when possible

### 3. Generated Operational Ledger

Meaning:

- generated indexes or ledgers that summarize current operational truth from manifests or archive records

Typical examples:

- request indexes
- archive indexes
- machine-readable ledgers rendered as markdown summaries
- generated repo-backed review-request package `README.md` files that reflect current request-manifest truth

Current examples:

- [Interaction_Audit_Review_Requests.md](./testing/Interaction_Audit_Review_Requests.md)
- [Interaction_Audit_Review_Archive.md](./testing/Interaction_Audit_Review_Archive.md)
- [Theme_Recovery_Review_Requests.md](./testing/Theme_Recovery_Review_Requests.md)
- [Theme_Recovery_Review_Archive.md](./testing/Theme_Recovery_Review_Archive.md)

Completion model:

- never "complete" in the same sense as archived phase files
- truthful when they correctly reflect current manifests and archive records
- should be regenerated, not hand-closed

### 4. Maintained Reference

Meaning:

- durable reference documentation that should track current repo truth and process rules

Typical examples:

- guardrails
- provider notes
- release packaging guide
- benchmark matrices
- runbooks
- fixture-convention references

Completion model:

- maintained, not frozen
- can be current or stale
- should be refreshed when the underlying truth changes

## Freshness Models

Freshness models are not new document classes.

They are small labels used inside a file when the class alone is not enough to explain whether the doc is meant to stay current or stay historically fixed.

Recommended vocabulary:

- `maintained current reference`
  - use for docs that should track current repo truth and process rules
- `dated snapshot`
  - use for one-off benchmark or audit snapshots that are intentionally time-bound
- `historical design baseline`
  - use for older design intent docs that still explain original framing but no longer define shipped product truth

Examples:

- operator runbooks -> `maintained current reference`
- release packaging guide -> `maintained current reference`
- dated benchmark matrix -> `dated snapshot`
- one-off documentation audit -> `dated snapshot`
- early MVP design doc -> `historical design baseline`

## Default Folder Mapping

These defaults are conventions, not hard absolutes:

- `Doc/TODOs/Archive/` -> closed evidence
- `Doc/testing/Phase_*.md` -> closed evidence
- generated archive-package `README.md` files inside dated review archive directories -> closed evidence
- `Doc/Roadmap/` -> living strategy
- generated request and archive indexes under `Doc/testing/` -> generated operational ledger
- generated request-package `README.md` files inside repo-backed review-request directories -> generated operational ledger
- `Doc/provider_notes/` -> maintained reference
- `Doc/Development_Guardrails.md` -> maintained reference
- `Doc/Release_Packaging_Guide.md` -> maintained reference
- `Doc/testing/Page_Session_Fixture_Conventions.md` -> maintained reference

## How To Answer "Are The Docs Done?"

Use this sequence:

1. check whether the numbered phase queue is archived and current
2. identify whether the doc in question is evidence, strategy, ledger, or reference
3. answer completion according to that class

Examples:

- archived phase docs through `Phase 137` are complete evidence
- roadmap files are open by design unless explicitly closed
- request and archive indexes are truthful ledgers, not incomplete implementation work
- request-package READMEs are generated ledgers for one current request record, not proof that a human pass is complete
- archive-package READMEs are closed evidence for one archived record, not living status dashboards
- provider notes are maintained references, not one-time closeout docs

## Maintenance Rule

When a new document could easily be misread, state its class explicitly inside the file.

This is especially important for:

- generated request and archive indexes
- generated request and archive package READMEs
- one-off benchmark snapshots
- runbooks that may drift over time
- older design-baseline docs that still live outside the archive queue

Recommended inline pattern:

- `Document class:`
- `Freshness model:`
- `Status note:`
