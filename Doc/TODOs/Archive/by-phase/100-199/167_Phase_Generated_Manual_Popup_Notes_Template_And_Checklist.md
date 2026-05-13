# Phase 167 - Generated Manual Popup Notes Template And Checklist

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed and archived on `2026-04-24`

## Summary

This slice expanded the refreshed screenshot request's manual popup workflow from import-only into a fuller generated intake bundle.

The pending request package now includes one request-bound popup-notes overlay template plus one popup-capture checklist, and the notes-import command now points at that generated template path instead of a generic placeholder.

## Completed Work

- generated `manual-popup-notes-overlay.template.json` for the remaining manual popup slots
- generated `manual-popup-capture-checklist.md` with request-bound paths and operator steps
- updated the manual handoff bundle so it now exposes template/checklist paths and a concrete notes-import command
- updated the runbook, roadmap, and phase/index docs to treat those generated files as the last pre-archive aids before the real popup pass

## Verification

- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run phase167:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Outcome

- current screenshot truth still remains `1 pending request / 1 archived set`
- the refreshed request now carries the remaining popup-note scaffolding as generated request-bound files
- the next executable slice remains the real popup capture plus import/archive completion path
