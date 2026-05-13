# Phase 369 - RDP Locale Capture Guard

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Prevent locale-specific RDP visual QA from drifting after the 14-locale expansion by validating `--locale` before the helper opens an extension window.

## Scope

- Move RDP extension-window locale URL handling into one script helper.
- Guard `--locale` against the 14 shipped runtime locale tags.
- Preserve route query strings and hashes when adding `app-locale`.
- Add one review script that checks helper behavior and drift against `src/shared/i18n.ts`.
- Update maintained docs with locale-specific capture guidance.

## Preserved Boundaries

- No runtime UI behavior changes.
- No translation content changes.
- No manifest, package, release artifact, or Chrome Web Store boundary changes.
- No changes to provider support, permissions, or source contracts.
- No change to final screenshot truth boundaries; native toolbar popup capture remains manual where the current RDP runtime cannot expose the real bubble as one top-level X11 window.

## Acceptance

- `store:capture-rdp-extension-window -- --locale <tag>` accepts only `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`.
- Invalid locale values fail before opening a Chrome extension window.
- Existing RDP route hash and query handling stays stable for popup, dashboard, Settings, and focused full-page routes.
- Docs clearly tell operators to use runtime locale tags, not Chrome `_locales` directory names.

## Planned Verification

- `./scripts/with-preferred-node.sh node ./scripts/phase369-rdp-locale-capture-guard-review.mjs`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added `scripts/lib/rdp-extension-locale-route.mjs` with the shared supported-locale guard and locale URL override helper.
- Updated `scripts/capture-rdp-extension-window.mjs` to use the shared helper instead of keeping duplicate URL mutation logic.
- Added `scripts/phase369-rdp-locale-capture-guard-review.mjs` to cover supported-locale drift, invalid locale rejection, and query/hash preservation.
- Updated maintained docs so locale-specific visual QA uses explicit runtime tags.

## Verification

- `./scripts/with-preferred-node.sh node ./scripts/phase369-rdp-locale-capture-guard-review.mjs`
- `npm run i18n:check`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale en-US --output tmp/phase369-invalid-locale.png` - expected fail-fast invalid-locale check, no capture file produced
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- A future translation-review slice should still replace English fallback runtime copy for non-reviewed locales; this phase only hardens the operator capture path.
