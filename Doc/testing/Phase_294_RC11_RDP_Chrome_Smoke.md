# Phase 294 - RC11 RDP Chrome Smoke

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the user-run RDP Chrome visual smoke result for `0.1.0-rc.11`

## Scope

Phase 294 records the manual RDP Chrome smoke pass after the `0.1.0-rc.11`
release package.

Reviewed by user:

- full-page dashboard route
- toolbar popup
- action-badge tooltip
- full-page dashboard with side-panel Settings open
- Codex and Cursor health/usage presentation
- Settings sticky top bar, section chips, save/back controls, and back-to-top
  floating action button

Reported outcome:

- the user reported no obvious issue by visual inspection

## Evidence Boundary

The screenshots were supplied in the chat thread for operator review context.
This phase records the smoke result, but it does not import those images as the
final Chrome Web Store screenshot assets.

The final store asset workflow still needs the existing Direction 10.3 native
toolbar popup capture/import/archive path.

## Commands

- `git status --short --branch`
- package, lockfile, source manifest, and built manifest version check
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Use `release/ai-usage-dashboard-0.1.0-rc.11.zip` as the current install/review
package. Continue with the store native-toolbar popup capture/import/archive
line before final screenshot ordering, captions, listing copy, and submission
checklist work.
