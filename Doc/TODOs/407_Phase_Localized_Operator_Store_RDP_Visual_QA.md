# Phase 407 - Localized Operator Store RDP Visual QA

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 406`
- representative visual QA for newly localized operator and store helper routes

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

## Follow-Up

- Continue with `Phase 408` bundle-size/localization chunk audit, or split any high-severity visual issue into a smaller active phase.
