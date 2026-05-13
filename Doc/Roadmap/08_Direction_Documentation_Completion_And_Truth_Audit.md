# Direction 08 - Documentation Completion And Truth Audit

Date: 2026-04-24

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change
- this direction is now in maintenance mode after `Phase 140`; refresh it when new doc families, checker coverage, or taxonomy boundaries materially change

Execution note:

- first executable slice landed on `2026-04-24` through `Phase 133`
- second executable slice landed on `2026-04-24` through `Phase 134`
- third executable slice landed on `2026-04-24` through `Phase 135`
- fourth executable slice landed on `2026-04-24` through `Phase 136`
- fifth executable slice landed on `2026-04-24` through `Phase 137`
- sixth executable slice landed on `2026-04-24` through `Phase 138`
- seventh executable slice landed on `2026-04-24` through `Phase 139`
- eighth executable slice landed on `2026-04-24` through `Phase 140`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P7`

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

As of 2026-05-13:

- numbered phase docs are archived through `Phase 392`, with active `Phase 392.1` selected for popup first-run guidance 14-locale runtime copy
- roadmap directions remain open by design
- interaction-audit request docs now show `0` pending requests and `1` fulfilled real operator request
- theme-recovery request docs now show `0` pending requests and `1` fulfilled real operator request
- provider notes, runbooks, benchmark docs, and guardrails are maintained reference docs, not one-time closeout docs
- the project now also ships one explicit taxonomy reference plus guardrail rules for documentation classes
- the most ambiguity-prone maintained-reference docs now also carry explicit freshness labels so readers can distinguish current references from dated snapshots or historical design baselines
- provider notes and fixture-convention guidance now also carry explicit maintained-reference plus freshness labels instead of reading like unlabeled historical research notes
- the repo now also has one lightweight executable taxonomy check for the highest-value maintained-reference, generated-ledger, and index docs
- the generated repo-backed request and archive package READMEs now also carry explicit taxonomy labels and can be refreshed through one dedicated package-readme refresh command
- the remaining roadmap direction files now also carry explicit `living strategy` labels instead of relying only on folder-level semantics
- the repo now also records which remaining doc patterns are intentionally convention-only instead of leaving that boundary implicit
- the docs taxonomy has since been compressed into functional directories plus bucketed phase archives; old top-level process docs remain compatibility stubs
- `docs:check` now also runs a repo-local Markdown link check for maintained docs and generated ledgers while skipping convention-only closed-evidence archives
- this direction is now sufficiently complete for maintenance mode, so the default next work should shift to toolbar competitive fit and internationalization bootstrap instead of more taxonomy expansion

This means:

- "phase history complete" is true
- "all docs finished forever" is false
- "Direction 08 needs more default label expansion right now" is also false

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

2.1 Treat repo-backed request package READMEs as generated operational ledgers.
   They reflect current request-manifest truth and should be refreshed, not hand-authored.

2.2 Treat dated archive package READMEs as closed evidence.
   They are generated renderings of one archived record, not living dashboards.

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
5. then transition the direction into maintenance mode instead of widening labeling scope by default

`Phase 133` completed the first executable part of steps `1` and `2` by shipping one project-level taxonomy, updating the guardrails, and labeling the generated request plus archive ledgers explicitly.

`Phase 134` completed the next executable part of steps `3` and `4` by defining explicit freshness vocabulary, labeling the most ambiguity-prone maintained-reference plus snapshot docs, and correcting the latest completed slice across the active indexes.

`Phase 135` completed the next executable part of step `4` by extending that same maintained-reference and freshness labeling into the provider notes plus the page-session fixture conventions doc.

`Phase 136` completed the first executable part of optional step `4` by labeling the remaining ambiguity-prone backlog plus index docs and shipping one lightweight repeatable taxonomy consistency check.

`Phase 137` completed the next executable part of optional step `4` by labeling the generated request plus archive package READMEs, refreshing the current repo packages through their generators, and extending the taxonomy check to cover those package-level docs.

`Phase 138` completed the next executable part of optional step `4` by labeling the remaining roadmap direction files as explicit `living strategy` docs and extending the taxonomy check to cover the full `Doc/Roadmap/` set instead of only the strategic index.

`Phase 139` completed the next executable part of optional step `4` by defining the current convention-only boundary explicitly and carrying that boundary into the checker output, so remaining unlabeled evidence artifacts are now an explicit policy choice instead of an accidental gap.

`Phase 140` completed step `5` by moving this direction into maintenance mode, lowering its strategic priority, and handing default next-step emphasis back to `Direction 10` and `Direction 09`.

## References

- [Documentation_Completion_Audit_2026-04-24.md](../Archive/audits/Documentation_Completion_Audit_2026-04-24.md)
- [00_Phase_Index.md](../TODOs/00_Phase_Index.md)
- [00_Strategic_Directions_Index.md](./00_Strategic_Directions_Index.md)
- [Interaction_Audit_Review_Requests.md](../testing/Interaction_Audit_Review_Requests.md)
- [Theme_Recovery_Review_Requests.md](../testing/Theme_Recovery_Review_Requests.md)

## Child TODO

- [08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md](./08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md)
