# Phase 294 - RC11 RDP Chrome Smoke

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Record the user-run RDP Chrome visual smoke pass for `0.1.0-rc.11` after the
Phase 293 release package was cut.

## Completed Work

- Confirmed the repository version state remained aligned for `0.1.0-rc.11`.
- Recorded the user's RDP Chrome smoke result.
- Updated the current queue so store native-toolbar popup capture/import/archive
  is the next local-safe product line.
- Kept provider closure and operator-evidence work de-prioritized unless new
  account access or explicit product direction appears.

## User-Reported Smoke Coverage

The user shared RDP Chrome screenshots and reported that the current build had
no obvious issue by visual inspection.

Observed surfaces:

- full-page dashboard
- toolbar popup
- action-badge tooltip
- full-page dashboard with side-panel Settings open
- provider card progress rows and source/status chips visible in the dashboard
- Settings sticky top bar and back-to-top floating action button visible in the
  side panel

The screenshots were provided in the chat thread as review context. They were
not imported as formal store assets in this phase.

## Preserved Boundaries

- Do not change runtime code in this smoke-record phase.
- Do not treat chat screenshots as final Chrome Web Store native-toolbar popup
  assets.
- Do not upgrade any provider claim from partial or policy-only to exact live
  quota support.
- Do not move provider closure ahead of store asset capture while Claude,
  JetBrains, and Gemini remain account/product-decision gated.

## Verification

- `git status --short --branch`
- package, lockfile, source manifest, and built manifest version check
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Continue `Direction 10.3` with the remaining store native-toolbar popup
capture/import/archive work. After that, close screenshot ordering, captions,
listing-copy tightening, and the submission checklist.
