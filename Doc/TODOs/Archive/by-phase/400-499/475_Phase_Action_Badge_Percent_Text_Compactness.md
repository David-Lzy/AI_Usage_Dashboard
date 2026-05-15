# Phase 475 - Action Badge Percent Text Compactness

Date: 2026-05-15

Status: completed

## Goal

Prevent Chrome toolbar action badge percentage text from clipping the percent sign when the selected quota badge reaches `100%`.

## Scope

- Keep quota badge tooltip/title text semantically complete.
- Render `100%` percent quota badge text as compact `100` on the toolbar action badge.
- Preserve shorter percent values such as `32%`.
- Add a focused regression test for the `100%` badge case.

## Preserved Boundaries

- Action badge selection, warning color thresholds, provider source truth, toolbar icon preferences, Settings controls, and release packaging are unchanged.
- The tooltip/title still says `100% remaining`; only the tight icon badge text is shortened.
- No package version bump or release zip refresh in this phase.

## Acceptance

- A selected `100%` quota source produces action badge text `100`.
- The action badge title still includes the full `100% remaining` wording.
- Existing non-100 percent badge text remains unchanged.

## Planned Verification

- `npm run test -- src/background/action-badge.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/background/action-badge.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- If Chrome badge rendering clips other four-character values in a real profile, consider a more general compact badge formatter for all action-badge text.
