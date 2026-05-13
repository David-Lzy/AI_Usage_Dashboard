# Phase 174 - Popup Explanatory Copy And Provider Detail Shell Localization

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived from the active phase queue

## Summary

`Phase 174` extended the runtime i18n pilot into popup explanatory copy and provider-detail shell/static copy while keeping deeper settings helper copy, localized durations, operator workspaces, and raw provider source-truth detail strings outside the shipped localized slice.

## Completed Work

- added one shared structured localized-copy helper for popup explanatory and provider-detail shell/static surfaces
- localized popup explanatory sections without rebuilding the underlying popup state model
- localized provider-detail shell/static labels, note labels, helper values, and hero copy
- preserved the existing truth boundary around source-truth raw provider detail strings
- added repeatable review coverage plus refreshed i18n references and roadmap/index docs

## Verification

- `npm run phase174:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- continue the runtime i18n pilot into deeper settings helper copy
- then localize durations and relative freshness phrasing
- then harden compact-width translation QA and RTL review
