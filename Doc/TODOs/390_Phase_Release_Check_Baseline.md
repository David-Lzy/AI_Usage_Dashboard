# Phase 390 - Release Check Baseline

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 389`
- verification phase only unless the release gate exposes a local drift bug

## Goal

Run the current release gate after the documentation cleanup and record whether the repo still has a clean release-check baseline.

## Scope

- Run the full release verification command on the current source tree.
- Fix only failures that are directly caused by the recent documentation or script drift work.
- Record any unrelated runtime, test, environment, or release-package blocker as a follow-up TODO instead of broadening this phase.

## Preserved Boundaries

- Do not bump `package.json` version, manifest version, or release package names.
- Do not create a new release zip.
- Do not mutate the submitted `rc.13` Chrome Web Store review boundary or the packaged `rc.15` follow-up milestone.
- Do not change provider support claims or store listing text unless the release gate proves a current-source mismatch.

## Acceptance

- `npm run release:check` passes, or one exact blocker is documented with the failing command and the next narrow phase needed to fix it.
- Current docs describe the release-check result truthfully without implying a new release artifact was created.
- No generated package or release artifact changes are committed unless an explicit release phase is opened later.

## Planned Verification

- `npm run release:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If `release:check` fails outside this phase boundary, create the next smallest phase TODO before fixing it.
