# Phase 292 - Post-RC10 Status Doc Refresh

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Reconcile the maintained project docs after the post-`0.1.0-rc.10` source
changes, without claiming that the existing `rc.10` zip already includes them.

## Completed Work

- Reviewed the current phase index, top-level TODOs, roadmap index, Material
  hardening direction, release guide, README, and Cursor provider note.
- Recorded that `0.1.0-rc.10` remains the latest packaged artifact, while the
  current source has moved forward after that package.
- Recorded the post-rc10 source deltas:
  - Cursor usage-page logged-out detection no longer mistakes a live usage
    dashboard shell for a logged-out page because auth copy exists in the DOM.
  - Cursor personal dashboard visible billing-period and spend context is now
    preserved as structured usage facts instead of being buried in summary text.
  - Line-style usage-window reset copy now renders inline with the window title
    to reduce vertical density while circular progress keeps reset copy below
    the ring.
- Created `Phase 293` as the next active release-packaging slice so the next
  install/review artifact can include those source changes.

## Preserved Boundaries

- No runtime code, provider parser, source-selection behavior, sync behavior,
  package version, manifest version, or release zip changed in this phase.
- Cursor personal usage still does not claim exact remaining included requests.
- Codex personal usage still reports visible usage-window values, not one
  plan-wide absolute remaining balance.
- Provider closure for JetBrains, Claude personal, and Gemini remains gated on
  real accounts or explicit product decisions.
- Store assets still need native-toolbar popup capture/import/archive closeout.

## Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

Run `Phase 293` next. It should bump to `0.1.0-rc.11`, rebuild `dist`, package
the release zip, verify the package contents, and update release-facing docs with
the new artifact SHA.
