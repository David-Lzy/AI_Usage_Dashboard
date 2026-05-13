# Phase 387 - Extension Notranslate And Locale RDP QA

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

Stop browser translation UI from polluting localized extension screenshots, then verify the representative locale popup surfaces through the existing RDP Chrome helper.

## Scope

- Add `translate="no"` to the popup and sidepanel HTML roots.
- Add `<meta name="google" content="notranslate" />` to the popup and sidepanel HTML heads.
- Rebuild `dist/` and rerun RDP popup captures for representative non-English locales.
- Keep the screenshot outputs as ignored local QA artifacts under `tmp/`.

## Preserved Boundaries

- No runtime copy changes.
- No provider support-claim changes.
- No manifest locale, Chrome Web Store listing, release package, or submitted review boundary changes.
- No committed screenshot asset replacement.

## Acceptance

- RDP Chrome can open the current unpacked extension from `dist/`.
- Representative localized popup captures do not show Chrome/Google Translate overlay UI.
- Extension runtime `lang` and `dir` sync remain owned by the existing runtime i18n layer.
- Standard tests, typecheck, docs, build, and diff checks pass.

## Planned Verification

- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase387-notranslate-rdp/popup-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale hi --output tmp/phase387-notranslate-rdp/popup-hi.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale id --output tmp/phase387-notranslate-rdp/popup-id.png`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added notranslate markers to both extension HTML shells.
- Confirmed RDP Chrome generated 21 initial locale smoke captures for dashboard, Settings, and popup across `en`, `zh-CN`, `ja`, `de`, `ar`, `hi`, and `id`.
- Found Chrome/Google Translate overlay pollution in localized popup captures before the fix.
- Rebuilt `dist/` and recaptured popup surfaces for `ar`, `hi`, `id`, `ja`, `de`, and `zh-CN`; the recaptured contact sheet no longer shows the browser translation overlay.

## Verification

- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase387-notranslate-rdp/popup-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale hi --output tmp/phase387-notranslate-rdp/popup-hi.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale id --output tmp/phase387-notranslate-rdp/popup-id.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ja --output tmp/phase387-notranslate-rdp/popup-ja.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale de --output tmp/phase387-notranslate-rdp/popup-de.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale zh-CN --output tmp/phase387-notranslate-rdp/popup-zh-CN.png`
- `identify -format '%f %wx%h mean=%[fx:mean] std=%[fx:standard_deviation]\n' tmp/phase387-notranslate-rdp/*.png`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Future store screenshot refresh work should use these notranslate shells and still perform human visual review before replacing submitted store assets.
