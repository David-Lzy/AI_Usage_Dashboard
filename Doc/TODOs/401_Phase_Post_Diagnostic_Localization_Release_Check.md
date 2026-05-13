# Phase 401 - Post-Diagnostic Localization Release Check

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 400`
- release-gate baseline after typed diagnostic presentation reached 14-locale coverage

## Goal

Run the full release gate after `Phase 400` so the repo has one current baseline after warning, source, and adapter-error diagnostic presentation all moved to explicit 14-locale copy.

## Scope

- Run `npm run release:check`.
- Record whether the gate passes after the post-`Phase 400` localization changes.
- If the gate fails for a small documentation or localization drift, fix it inside this phase.
- If the gate fails for unrelated runtime behavior, record the blocker and create a focused follow-up TODO instead of expanding this phase.

## Preserved Boundaries

- Do not bump package or manifest versions.
- Do not create or overwrite release zips.
- Do not mutate the `rc.13` submitted review boundary or the `rc.15` packaged follow-up artifact.
- Do not start operator-workspace or store-helper localization implementation in this phase.

## Acceptance

- `npm run release:check` has a recorded pass, or a blocker is documented with a follow-up TODO.
- README, top-level TODOs, and roadmap current-truth sections still point at the active queue accurately.
- No release artifacts are changed.

## Planned Verification

- `npm run release:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with `Phase 402` operator-workspace runtime copy inventory.
