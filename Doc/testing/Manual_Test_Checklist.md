# Manual Test Checklist

Date: 2026-05-11

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical maintained manual-QA reference
- refresh it whenever shipped surfaces, debug routes, request flows, or repeated review commands change

## Scope

- side panel dashboard
- provider detail pages
- settings and host-access UX
- popup and action-badge behavior
- shared refresh and persistence behavior

## Test Environment

- preview URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- extension mode: load the unpacked build from `dist/` after `npm run build`
- before trusting extension-mode results, reload the unpacked extension from `chrome://extensions`

## Core Checks

1. Open dashboard, settings, at least one provider detail page, and the popup.
2. Confirm visible providers render without broken layout or missing critical content.
3. Confirm refresh actions, warning summaries, and source labels stay coherent across dashboard, detail, and popup.
4. Confirm Settings can save sync interval, warning threshold, appearance, and provider visibility changes.
5. Confirm host-access and credential guidance stays honest when access is missing.
6. Confirm popup actions can open dashboard and settings.
7. Confirm action badge meaning still matches the selected badge preference.

## Provider Truth Checks

- Cursor personal path must not claim an exact remaining included-request counter
- Codex personal path must stay usage-window scoped, not one plan-wide absolute remaining balance
- Claude Code may use Admin Analytics API or the Claude Team usage page, but should not claim one absolute remaining balance across all windows
- Gemini remains policy-only unless the product contract changes
- JetBrains stays deferred from the active support promise unless explicitly reverified

## Completion

Record:

- command set used
- whether validation was preview mode, extension mode, or both
- any provider/account limitations that prevented live verification
