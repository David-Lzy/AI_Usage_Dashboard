# Phase 396 - Post-Localization Maintenance Release Check

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 395`
- release-gate baseline only

## Goal

Run the full release gate after the 14-locale expansion and runtime message catalog split, then record the current baseline.

## Scope

- Run `npm run release:check`.
- If the gate passes, archive this phase with the command output summary.
- If the gate fails because of drift caused by the localization/catalog work, fix only that drift inside this phase.
- If the gate fails because of unrelated runtime or environment issues, record a blocker and create a follow-up TODO instead of widening this phase.

## Preserved Boundaries

- Do not bump package or manifest versions.
- Do not create a release zip.
- Do not change provider behavior, locale copy, manifest `_locales`, store listing drafts, release milestones, or generated evidence unless the release gate directly proves a drift fix is required.

## Acceptance

- `npm run release:check` has a recorded pass, or a bounded blocker note exists with a follow-up TODO.
- Current docs say whether the post-`Phase 395` source passes the full gate.
- No release artifact boundary changes.

## Planned Verification

- `npm run release:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 397` diagnostic presentation inventory after the release baseline is known.
