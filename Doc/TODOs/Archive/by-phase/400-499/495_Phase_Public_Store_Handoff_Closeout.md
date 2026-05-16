# Phase 495 - Public Store Handoff Closeout

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Close the public-repository and six-locale Chrome Web Store handoff slice, update project indexes, and leave the repository in a verifiable no-queued-phase state.

## Scope

- Update the phase index, top-level TODO, roadmap, README, and store docs.
- Record that current source is ahead of packaged RC22 through Phase 495.
- Keep `0.1.0-rc.22` / manifest `0.1.0.22` as the latest package unless a future packaging phase is opened.
- Preserve RC13 as the existing submitted-review boundary.

## Preserved Boundaries

- Do not bump version or package a new release zip.
- Do not change runtime behavior.
- Do not upload to Chrome Web Store automatically.
- Do not make the GitHub repository public from the CLI; that remains a manual owner action.

## Acceptance

- `Doc/TODOs/00_Phase_Index.md` lists Phase 495 as the latest completed slice and no queued phase.
- README and top-level TODO include the required no-queued-phase wording for Phase 495.
- Roadmap says the numbered phase queue is completed through Phase 495.
- Verification commands pass.

## Verification

- `npm run docs:check`
- `npm run i18n:check`
- `git diff --check`

## Follow-Up

- Manual Chrome Web Store tasks:
  - make GitHub repository public if desired
  - add privacy-policy/source URL in the dashboard
  - paste the selected localized listing fields
  - upload the selected screenshot set
  - decide whether to package a post-Phase-495 RC23 zip
