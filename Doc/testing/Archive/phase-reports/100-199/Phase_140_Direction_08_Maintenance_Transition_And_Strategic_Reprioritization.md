# Phase 140 - Direction 08 Maintenance Transition And Strategic Reprioritization

Date: 2026-04-24

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the completed `Phase 140` closeout and should not be silently edited after archival except to correct factual mistakes

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Stop treating `Direction 08` as the default next expansion line now that the taxonomy, freshness model, checker coverage, and convention-only boundary are already in place.

## What Changed

- moved [Direction 08 - Documentation Completion And Truth Audit](../../../../Roadmap/08_Direction_Documentation_Completion_And_Truth_Audit.md) into explicit maintenance mode
- lowered `Direction 08` strategic priority from `P4` to `P7`
- updated [Direction 08.1 TODOs](../../../../Roadmap/08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md) so future work is maintenance-only instead of default scope expansion
- removed the stale `Phase 136` completion line from [00_Strategic_Directions_Index.md](../../../../Roadmap/00_Strategic_Directions_Index.md) and moved the `2026-04-24` requested-direction order to:
  - `Direction 10`
  - `Direction 09`
  - `Direction 08`
- updated the maintained backlog and phase index references to point at `Phase 140`
- added one repeatable review script:
  - `npm run phase140:review`

## Why This Matters

The repo no longer needs more default label expansion to answer "what is complete?" truthfully.

After `Phase 140`, the honest next local strategy is:

1. toolbar competitive fit and store readiness
2. internationalization bootstrap and pilot locales
3. documentation taxonomy only when drift or a new doc family justifies reopening it

## Verification

- `npm run docs:check`
- `npm run phase140:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

`Direction 08` is now a maintained guardrail and review line, not the default expansion track.
