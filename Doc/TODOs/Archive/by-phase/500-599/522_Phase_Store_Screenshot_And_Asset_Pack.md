# Phase 522 - Store Screenshot And Asset Pack

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Prepare store screenshot and asset handoff for RC24.

## Scope

- Keep five Chrome Web Store screenshot slots at `1280x800`.
- Prefer current runtime captures when RDP/Playwright is stable.
- Reuse the current public-readiness archive as the safe upload baseline if refreshed light/dark capture is unstable.

## Preserved Boundaries

- Do not include account secrets, local browser paths, or raw RDP traces in public docs.
- Do not edit provider values or runtime text inside screenshots.

## Result

- Screenshot selection and store handoff docs identify the current upload assets.
- Light/dark split promotional imagery remains optional follow-up unless capture is reliable.

## Verification

- screenshot archive/readme inspection
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Run a dedicated visual capture phase if Chrome Web Store requires a new light/dark promotional image.
