# Phase 504 - Legacy Source Entry Error Fix

Date: 2026-05-16

Status: completed

## Goal

Fix the Chrome Extensions runtime error that appeared after `Phase 503` when old brand-level provider entries remained in long-lived Chrome storage.

## Scope

- Hardened app-state normalization so legacy provider ids such as `codex`, `cursor`, and `claude-code` are only migration inputs.
- Prevented legacy or unknown provider ids from being appended back as extra runtime providers after source-level normalization.
- Added storage regression coverage for old brand-level provider snapshots, provider settings, and popup order preferences.
- Rebuilt and reloaded the local unpacked Chrome extension, cleared historical error entries, and verified the Chrome Extensions card no longer shows `Errors`.

## Preserved Boundaries

- No provider support scope changed.
- No storage key, manifest permission, release package, or Chrome Web Store submission boundary changed.
- Existing source-level provider ids and migration mapping from `Phase 503` remain unchanged.

## Acceptance

- Old brand-level provider state normalizes to the source-level provider list without retaining stale extra entries.
- Settings Quick Setup no longer receives a legacy provider id and therefore no longer crashes while reading source blueprints.
- The local RDP Chrome unpacked extension loads Settings after rebuild/reload without new extension error entries.

## Planned Verification

- `npm run test -- src/shared/storage.test.ts src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run build`
- RDP Chrome reload plus `chrome://extensions/?errors=gkjioiklbdjcknhdglaehbeofkjmmdpc`
- `git diff --check`

## Follow-Up

- Package a post-Phase-504 candidate before any Chrome Web Store resubmission that should include the source-level provider-entry migration and this long-lived-profile migration fix.
