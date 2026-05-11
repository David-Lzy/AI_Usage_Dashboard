# Project Quickstart

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the tracked project orientation entry point for contributors and coding agents
- refresh it when the repo changes how work is selected, verified, documented, or handed off

## Purpose

- keep the project start sequence short
- point contributors at tracked canonical docs before they touch code or release flow
- make the repo understandable without any local-only `.agent/` workspace

## Repo Split

- `Doc/`
  - product contract
  - roadmap and phase queue
  - provider notes
  - milestones
  - release and QA runbooks
  - generated ledgers
  - historical evidence
- `.agent/`
  - optional local-only helper workspace
  - not canonical
  - should stay out of version control

## Read Order

1. [../AGENTS.md](../AGENTS.md)
2. [Development_Guardrails.md](./Development_Guardrails.md)
3. [Documentation_Taxonomy.md](./Documentation_Taxonomy.md)
4. The task-specific runbook:
   - [Release_Packaging_Guide.md](./Release_Packaging_Guide.md)
   - [testing/Manual_Test_Checklist.md](./testing/Manual_Test_Checklist.md)
   - [testing/Store_Screenshot_Capture_Runbook.md](./testing/Store_Screenshot_Capture_Runbook.md)
   - [testing/Interaction_Audit_Operator_Handoff_Runbook.md](./testing/Interaction_Audit_Operator_Handoff_Runbook.md)
   - [testing/Theme_Recovery_Operator_Runbook.md](./testing/Theme_Recovery_Operator_Runbook.md)
   - [testing/Page_Session_Fixture_Conventions.md](./testing/Page_Session_Fixture_Conventions.md)
5. [TODOs/00_Phase_Index.md](./TODOs/00_Phase_Index.md)
6. [AI_Usage_Dashboard_TODOs.md](./AI_Usage_Dashboard_TODOs.md)
7. [Roadmap/00_Strategic_Directions_Index.md](./Roadmap/00_Strategic_Directions_Index.md)
8. the active phase file named in the phase index, if one exists
