# Phase 390 - Release Check Baseline

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

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

## Completion Summary

- Ran the full release gate after the documentation cleanup and link-check guard.
- Confirmed `i18n:check`, `typecheck`, full unit test suite, and production build all pass on the current source tree.
- Confirmed `npm run docs:check` also passes with taxonomy plus Markdown link checking.
- No package version, manifest version, release zip, submitted `rc.13` boundary, or packaged `rc.15` follow-up artifact changed.

## Verification

- `npm run release:check`
  - `i18n:check` passed for `14` Chrome locale catalogs, `14` runtime locales, and the store listing localization draft
  - `typecheck` passed
  - `vitest` passed with `124` files and `562` tests
  - `vite build` completed successfully
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start `Phase 391` for the deeper runtime i18n copy inventory.
