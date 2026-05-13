# Phase 368 - RTL Fallback Text Direction Hardening

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Fix the most visible Arabic/RTL QA issue left after the 14-locale expansion: English fallback sentences rendered inside an RTL root could place sentence punctuation at the visual line start.

## Scope

- Add shared typography-level bidirectional isolation for common text-bearing elements when `data-app-direction="rtl"`.
- Preserve Arabic root `dir=rtl` behavior from the locale registry.
- Keep non-reviewed runtime copy on English fallback until a translation-review phase replaces it.
- Recheck Arabic dashboard, Settings, and popup extension-mode surfaces through RDP Chrome.

## Preserved Boundaries

- No translation content changes.
- No provider support-claim changes.
- No release package, manifest version, or Chrome Web Store submitted boundary changes.
- No runtime permission changes.
- No changes to raw provider evidence, diagnostic raw bodies, archive/export payloads, or vendor-owned strings.

## Acceptance

- English fallback sentences inside Arabic/RTL preview surfaces keep natural LTR punctuation order.
- Arabic `dir=rtl` still applies at the document/root level.
- Dashboard, Settings, and popup Arabic RDP captures remain nonblank and show no obvious overlap caused by the hardening.
- Build and documentation checks pass.

## Planned Verification

- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ar --output tmp/phase368-rtl-fallback-rdp/dashboard-ar.png`
- `npm run store:capture-rdp-extension-window -- --route settings --locale ar --output tmp/phase368-rtl-fallback-rdp/settings-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase368-rtl-fallback-rdp/popup-ar.png`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added `unicode-bidi: plaintext` protection for common text-bearing app classes and form controls under `html[data-app-direction="rtl"]`.
- Rebuilt `dist/` and verified Arabic extension-window screenshots for dashboard, Settings, and popup.
- Confirmed the visible English fallback punctuation now stays at sentence end in Arabic/RTL preview surfaces while the page remains RTL.

## Verification

- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ar --output tmp/phase368-rtl-fallback-rdp/dashboard-ar.png`
- `npm run store:capture-rdp-extension-window -- --route settings --locale ar --output tmp/phase368-rtl-fallback-rdp/settings-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase368-rtl-fallback-rdp/popup-ar.png`

## Follow-Up

- Reviewed Arabic runtime translations should still replace English fallback copy in a future translation-review phase; this slice only prevents fallback text from rendering with misleading punctuation order.
