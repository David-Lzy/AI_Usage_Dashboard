# Phase 210 - Surface Progress Style Preferences

Date: 2026-04-26

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-26

## Goal

Let popup, sidebar, and full-page tab quota progress choose line or circle independently, and make the popup quota-first.

## Completed Work

- Added persisted surface-specific progress display settings.
- Added Settings controls for popup, sidebar, and tab quota style.
- Extended shared progress components with circular rendering.
- Wired dashboard and provider-detail progress rendering through the sidebar or tab setting.
- Reworked popup to put quota cards directly below the header.
- Hid nonessential popup summary and explanation sections whenever provider quota cards are present.
- Preserved the no-provider onboarding/status fallback.
- Added focused progress and storage tests plus `phase210:review`.

## Preserved Boundaries

- No parser, sync, source-selection, provider-coverage, permission, release-package, or archive behavior changed.
- popup quota-first mode only changes information hierarchy and progress presentation.
- Existing dashboard and provider-detail line progress remains the default for sidebar and tab.
- Provider coverage gaps still exist and remain truthful.

## Verification

- `npm run test -- --run src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx src/shared/storage.test.ts`
- `npm run phase210:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Review the real toolbar popup after extension reload. If quota cards still consume too much vertical space, make popup-specific ring overflow explicit instead of reintroducing hidden long text.
