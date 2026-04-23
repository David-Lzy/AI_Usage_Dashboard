# Direction 08.1 - Documentation Completion And Truth Audit TODOs

Date: 2026-04-24

Status note:

- direction created on `2026-04-24`
- `Phase 133` completed the first executable slice on `2026-04-24` by shipping one project-level taxonomy, one guardrail update for doc classes, and one generated-ledger labeling pass across request plus archive indexes
- `Phase 134` completed the next executable slice on `2026-04-24` by shipping explicit freshness labels for benchmark, audit, design-baseline, runbook, checklist, and release-reference docs
- `Phase 135` completed the next executable slice on `2026-04-24` by shipping explicit maintained-reference and freshness labels for provider notes plus the page-session fixture conventions doc
- `Phase 136` completed the next executable slice on `2026-04-24` by shipping explicit backlog plus index labeling and one lightweight repeatable doc-taxonomy consistency check
- `Phase 137` completed the next executable slice on `2026-04-24` by shipping explicit class plus status labels for generated request/archive package READMEs, one package-readme refresh command, and one checker extension that now covers those generated package docs too

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
- keep maintained-reference docs from silently reading like frozen historical snapshots

### D. Operational Ledger Rules

- define explicit status rules for:
  - request docs
  - archive indexes
  - seeded baseline docs
  - fulfilled operator records
- ensure these docs are not misread as incomplete implementation work
- distinguish package-level request READMEs from package-level archive READMEs instead of treating both as one generic generated-doc bucket
- keep generated package README refresh flows generator-driven instead of hand-editing dated package docs in place

### E. Reference-Doc Maintenance Rules

- define refresh triggers for:
  - provider notes
  - benchmark matrices
  - release packaging guide
  - runbooks
- decide which reference docs should carry explicit "last audited" dates
- distinguish maintained current references from dated snapshots and historical design baselines when class alone is not clear
- keep fixture-convention guidance aligned with the same maintained-reference model used by provider notes

### F. Optional Automation

- evaluate one repeatable doc-consistency check for:
  - phase index latest slice
  - strategic index priority order
  - presence of child TODO links
  - stale roadmap dates
- the repo now ships one first lightweight check for label presence on high-value docs plus latest-slice alignment in the phase index
- that lightweight check now also covers generated request/archive package READMEs, not only top-level indexes and maintained references

## Out Of Scope

- rewriting old archived phase docs only to normalize prose style
- pretending living docs are complete just to simplify counts
- collapsing roadmap, request, archive, and reference docs into one status model
