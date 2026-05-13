# Phase 406 - Post-Helper Localization Release Gate

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 405`
- release-gate baseline after operator/store helper localization

## Goal

Run the full release gate after the operator-workspace and store-helper 14-locale slices, then record the post-helper localization baseline without changing release packaging.

## Scope

- Run `npm run release:check`.
- Record the release-gate result in current docs and this phase closeout.
- Fix only local drift caused by the helper localization work if the release gate exposes a narrow issue.

## Preserved Boundaries

- Do not bump package or manifest versions.
- Do not create a release zip.
- Do not change provider contracts, locale registry, shipped locale set, manifest locales, or store listing source text.
- If a failure is unrelated to the helper localization work, record it as a blocker and create a follow-up TODO instead of broadening this phase.

## Acceptance

- The repo has a clear pass/fail baseline for `npm run release:check` after `Phase 404` and `Phase 405`.
- Current docs say whether the post-helper localization release gate passed or what blocked it.
- No package artifact or release boundary changes are made.

## Planned Verification

- `npm run release:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with `Phase 407` localized operator/store RDP visual QA if the release gate passes.
