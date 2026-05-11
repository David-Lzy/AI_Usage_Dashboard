# Documentation Taxonomy

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file defines the canonical documentation taxonomy and tracked-doc boundary
- refresh it whenever canonical paths, document classes, or generated-ledger policy change

## Purpose

- separate product truth from process docs
- define what each markdown class means
- keep local-only agent helpers from becoming a hidden source of truth

## Canonical Directory Boundary

- `Doc/`
  - product and system truth
  - roadmap and phase queue
  - provider research notes
  - milestones
  - release and QA runbooks
  - generated ledgers
  - archived evidence
- `.agent/`
  - optional local-only helper workspace
  - not canonical
  - should not be referenced as a required repo dependency

Root entry docs:

- [../AGENTS.md](../AGENTS.md)
- [../START_PROMPT.md](../START_PROMPT.md)
- [../CLAUDE.md](../CLAUDE.md)

## Document Classes

### 1. Closed Evidence

- fixed evidence of completed work
- remains readable after closeout
- should not stay in the active execution path

Examples:

- `Doc/TODOs/Archive/*.md`
- `Doc/testing/Phase_*.md`
- dated review archive package `README.md` files

### 2. Living Strategy

- strategy, prioritization, or future-direction docs that are expected to evolve

Examples:

- `Doc/Roadmap/*.md`
- `Doc/Next_Steps_Post_Operator_Closures.md`

### 3. Generated Operational Ledger

- generated indexes or request/archive package docs that reflect current manifest truth
- truthful when regenerated, not when hand-frozen

Examples:

- `Doc/testing/Interaction_Audit_Review_Requests.md`
- `Doc/testing/Interaction_Audit_Review_Archive.md`
- `Doc/testing/Theme_Recovery_Review_Requests.md`
- `Doc/testing/Theme_Recovery_Review_Archive.md`

### 4. Maintained Reference

- durable reference docs that should track current repo truth
- can become stale and should be refreshed when the underlying process changes

Examples:

- provider notes
- release and QA runbooks
- `Doc/Development_Guardrails.md`
- `Doc/Project_Quickstart.md`
- `Doc/Documentation_Taxonomy.md`
- `START_PROMPT.md`

## Freshness Models

Use these when class alone is not enough:

- `maintained current reference`
- `dated snapshot`
- `historical design baseline`

## Labeling Rule

Canonical maintained docs should include:

- `Document class:`
- `Freshness model:`
- `Status note:`

## Generated Versus Historical

- generated ledgers should be refreshed by script, not manually maintained line by line
- historical archives and evidence packs should remain stable once written
- if a generator needs new links or taxonomy text, update the generator and refresh the generated output
