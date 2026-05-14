# Phase 432 - UI QA And Doc Closeout

Status: queued

## Goal

Close out the provider ordering, quota visibility, progress style, and Settings carousel work with documentation alignment and representative visual QA.

## Scope

- Update README, top-level TODOs, Roadmap, Product/I18n docs as needed.
- Run representative visual checks for popup, sidebar dashboard, full-page dashboard, and Settings carousel.
- Include `en`, `zh-CN`, `de`, and `ar` spot checks where practical.
- Fix visible overflow or overlap discovered during this QA phase.

## Preserved Boundaries

- Do not expand provider support claims.
- Do not mutate RC13 store-submission history.
- Do not package a new release unless explicitly promoted after QA.

## Acceptance

- Current docs describe the completed UI preference and carousel behavior.
- Phase index has no queued work from this slice.
- Visual notes record any checks that could not run and why.
- Build and documentation checks pass.

## Planned Verification

- `npm run docs:check`
- `npm run i18n:check`
- focused tests changed by Phases 422-431
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Follow-Up

- If this work is promoted to a new release candidate, create a separate release/package phase instead of mutating this UI closeout.
