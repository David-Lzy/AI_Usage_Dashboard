# Phase 213 - Native Toolbar Popup Density Review

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Verify and tighten the native Chrome toolbar popup after popup progress, appearance preferences, and Settings preview work landed.

## Completed Work

- Captured the real native toolbar popup from the RDP Chrome action icon after a fresh build and extension reload.
- Confirmed the current Codex state shows four visible usage-window quota rings in the popup.
- Tightened popup circle density by reducing popup-only ring size.
- Hid popup-only reset details in circular quota mode so the toolbar bubble stays focused on progress and labels.
- Kept sidebar and full-page progress details unchanged.
- Added `phase213:review` for density CSS, closeout docs, and native popup evidence markers.

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, or storage behavior changed.
- No sidebar or full-page quota presentation was compressed.
- Provider coverage remains unchanged:
  - JetBrains stays deferred from the active promise
  - Claude personal remains deferred
  - Gemini remains policy-only
  - Codex and Cursor personal support remain partial, not absolute remaining-balance claims
- Native popup evidence remains a real Chrome visual pass, not a final store screenshot archive.

## Verification

- `npm run build`
- RDP Chrome extension reload from `chrome://extensions`
- native toolbar popup screenshot before and after density fix
- `npm run phase213:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Create a new release candidate package so the zip artifact includes the Phase 200-213 source and `dist` state instead of the older Phase 42 `rc.2` package.
