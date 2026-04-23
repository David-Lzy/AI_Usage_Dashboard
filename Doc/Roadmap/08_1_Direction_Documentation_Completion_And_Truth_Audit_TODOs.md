# Direction 08.1 - Documentation Completion And Truth Audit TODOs

Date: 2026-04-24

Status note:

- direction created on `2026-04-24`
- no executable phase has started yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)

## Detailed TODOs

### A. Documentation Taxonomy

- define explicit doc classes:
  - closed evidence
  - living strategy
  - generated operational
  - maintained reference
- define which folders default to which class
- define what "complete" means for each class

### B. Project-Level Audit

- ship one repo-wide documentation audit report
- mark which docs are:
  - closed
  - open by design
  - generated
  - stale
- identify index and date mismatches

### C. Index And Status Cleanup

- keep `latest completed slice` in sync across phase and strategic indexes
- keep roadmap priority order aligned with actual active follow-up
- identify any stale dated benchmark or runbook docs that should be labeled as snapshots

### D. Operational Ledger Rules

- define explicit status rules for:
  - request docs
  - archive indexes
  - seeded baseline docs
  - fulfilled operator records
- ensure these docs are not misread as incomplete implementation work

### E. Reference-Doc Maintenance Rules

- define refresh triggers for:
  - provider notes
  - benchmark matrices
  - release packaging guide
  - runbooks
- decide which reference docs should carry explicit "last audited" dates

### F. Optional Automation

- evaluate one repeatable doc-consistency check for:
  - phase index latest slice
  - strategic index priority order
  - presence of child TODO links
  - stale roadmap dates

## Out Of Scope

- rewriting old archived phase docs only to normalize prose style
- pretending living docs are complete just to simplify counts
- collapsing roadmap, request, archive, and reference docs into one status model
