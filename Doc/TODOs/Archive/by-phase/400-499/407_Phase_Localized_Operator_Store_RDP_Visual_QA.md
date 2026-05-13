# Phase 407 - Localized Operator Store RDP Visual QA

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-14
- representative visual QA for newly localized operator and store helper routes landed under `Doc/testing/localized_operator_store_rdp_visual_qa/2026-05-14-phase407/`

## Goal

Capture or inspect representative extension-mode surfaces for the newly localized operator-workspace and store-helper copy, with emphasis on long labels and Arabic RTL behavior.

## Scope

- Build `dist/` before extension-mode checks.
- Use RDP Chrome extension-mode review for representative locales: `en`, `zh-CN`, `ja`, `de`, and `ar`.
- Focus on interaction audit, theme recovery review, store screenshot seed, and native popup probe helper routes.
- Record screenshots or a written visual QA report under `Doc/testing/` or an appropriate existing evidence directory.

## Preserved Boundaries

- Do not change final Chrome Web Store screenshot assets in this phase.
- Do not change route hashes, automation titles, preset ids, request/archive ids, or capture-plan filenames.
- Do not claim full professional translation review; this phase is layout and obvious-copy visual QA.

## Acceptance

- Representative localized helper/operator surfaces have a current extension-mode visual QA note.
- Arabic checks include `dir=rtl` and no obvious control/text overlap on the reviewed routes.
- Any visual issue that cannot be fixed narrowly is recorded as a follow-up TODO.

## Planned Verification

- `npm run build`
- RDP Chrome extension-mode captures or documented manual checks
- `npm run docs:check`
- `git diff --check`

## Closeout

Completed on 2026-05-14.

Summary:

- built `dist/` with `npm run build`
- detected the RDP Chrome unpacked extension id `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- captured representative extension-mode screenshots for `en`, `zh-CN`, `ja`, `de`, and `ar`
- covered interaction audit, theme recovery, store screenshot seed, and native popup probe helper routes
- unlocked the store screenshot seed after each locale so the runtime lock was not left enabled
- archived the visual QA package at [2026-05-14-phase407](../../../../testing/localized_operator_store_rdp_visual_qa/2026-05-14-phase407/README.md)

Verification:

- `npm run build`
- RDP Chrome capture matrix: `20` target screenshots plus `5` cleanup screenshots
- sampled visual inspection of Arabic RTL and German long-label screenshots
- `identify` sanity check confirmed target screenshots were non-blank after recapturing one initial black X11 frame
- `npm run test -- src/shared/i18n.test.ts`
- `npm run docs:check`
- `git diff --check`

Follow-up:

- continue with `Phase 408` localization copy chunk-size audit
- keep native toolbar popup capture as a separate manual boundary; the helper app-window probe still reports that the app window has no toolbar

## Follow-Up

- Continue with `Phase 408` bundle-size/localization chunk audit, or split any high-severity visual issue into a smaller active phase.
