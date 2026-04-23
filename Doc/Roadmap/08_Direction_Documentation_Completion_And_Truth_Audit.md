# Direction 08 - Documentation Completion And Truth Audit

Date: 2026-04-24

Execution note:

- no executable slice has shipped yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P4`

## Why This Direction Exists

The project now has a large and healthy documentation surface.

That creates a new problem:

- numbered phases can be complete
- but the broader `Doc/` tree can still look "unfinished"
- and the difference is not yet formalized enough

The user's question is now reasonable:

- are the docs already done
- or are they still open

Today the truthful answer is "some are complete, some are intentionally living," but the repo does not yet make that distinction simple enough.

## Current Truth

As of 2026-04-24:

- numbered phase docs are archived through `Phase 131`
- there is no active numbered phase file in [00_Phase_Index.md](../TODOs/00_Phase_Index.md)
- roadmap directions remain open by design
- interaction-audit request docs still show `1 pending / 0 fulfilled`
- theme-recovery request docs still show `1 pending / 0 fulfilled`
- provider notes, runbooks, benchmark docs, and guardrails are maintained reference docs, not one-time closeout docs

This means:

- "phase history complete" is true
- "all docs finished forever" is false

## Direction Goal

Make documentation status legible enough that the repo can answer three different questions cleanly:

1. which implementation phases are complete
2. which strategic directions remain open
3. which operational and reference docs are living docs by design

## Strategic Decisions

1. Separate phase completion from documentation completion.
   Archived numbered phases should remain the primary implementation completion signal.

2. Treat generated request and archive indexes as operational ledgers.
   They should never be judged by the same "done" rule as archived phase files.

3. Treat roadmap files as living strategy docs.
   They should carry explicit state like `active`, `deferred`, `superseded`, or `closed`.

4. Treat reference docs as maintained truth, not frozen truth.
   Provider notes, benchmark matrices, and runbooks should be allowed to evolve without being labeled incomplete.

5. Add one project-level doc taxonomy.
   The repo should have one explicit vocabulary for `closed evidence`, `living strategy`, `generated operational`, and `maintained reference` docs.

## Success Criteria

- a contributor can answer "what is complete?" without reading half the repo
- archived phases, roadmap directions, request ledgers, and reference docs no longer look interchangeable
- stale dates, stale latest-phase pointers, and stale priority notes are corrected quickly
- the repo has one explicit documentation taxonomy and one repeatable doc-audit workflow

## Main Risks

- spending too much time polishing docs without improving decision clarity
- duplicating status across too many indexes
- introducing a second ambiguous status language instead of simplifying the first one

## Recommendation

This direction is feasible and should be executed before broad new roadmap expansion.

Recommended rollout:

1. define doc classes and completion rules
2. ship one documentation audit report
3. patch stale indexes and stale priority notes
4. optionally add one repeatable doc-consistency checklist or script

## References

- [Documentation_Completion_Audit_2026-04-24.md](../Documentation_Completion_Audit_2026-04-24.md)
- [00_Phase_Index.md](../TODOs/00_Phase_Index.md)
- [00_Strategic_Directions_Index.md](./00_Strategic_Directions_Index.md)
- [Interaction_Audit_Review_Requests.md](../testing/Interaction_Audit_Review_Requests.md)
- [Theme_Recovery_Review_Requests.md](../testing/Theme_Recovery_Review_Requests.md)

## Child TODO

- [08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md](./08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md)
