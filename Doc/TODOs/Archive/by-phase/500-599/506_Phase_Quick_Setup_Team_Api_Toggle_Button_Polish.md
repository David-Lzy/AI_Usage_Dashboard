# Phase 506 - Quick Setup Team API Toggle Button Polish

Date: 2026-05-16

Status: completed and archived

## Goal

Make the Quick Setup team/API provider toggle read as an intentional Material-style button and place it beside the Quick Setup title on normal-width Settings layouts.

## Scope

- move the "Show/Hide team/API providers" toggle into the Quick Setup header action column
- render that toggle with an outlined button treatment instead of a borderless text-button treatment
- keep narrow Settings layouts stacked so long localized titles and button labels do not collide
- add a focused Settings render assertion for the Quick Setup header and outlined toggle

## Preserved Boundaries

- no provider setup, source-mode, permission, storage, or display-eligibility behavior changed
- no localized text changed
- no Quick Setup carousel behavior changed
- no release package or manifest version changed

## Acceptance

- the team/API provider toggle is visually discoverable as a button
- wide Settings layouts place the toggle to the right of the Quick Setup title block
- compact Settings layouts can still place the toggle below the title without horizontal overflow
- existing Quick Setup provider filtering semantics remain unchanged

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run docs:check`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
- RDP Chrome smoke check: full-page Settings shows the team/API provider toggle to the right of the Quick Setup title with an outlined button treatment.

## Follow-Up

- package a post-`Phase 506` candidate only if the next Chrome Web Store resubmission should include this UI polish.
