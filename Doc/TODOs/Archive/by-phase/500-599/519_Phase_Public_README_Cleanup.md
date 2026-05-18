# Phase 519 - Public README Cleanup

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Make the root README useful for public GitHub readers.

## Scope

- Replace phase-heavy internal release notes with product summary, store link, privacy, install, development, release state, contribution, and license sections.
- Preserve public links to `Doc/`, privacy, security, contributing, and provider support references.

## Preserved Boundaries

- No product behavior changed.
- Internal phase evidence remains in archived docs.
- Local `.local` workflow remains private and is not referenced by public README.

## Result

- `README.md` now reads as a public project page rather than an operator ledger.
- Current release state points to RC24 and notes that no numbered phase is queued after Phase 524.

## Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Add public screenshots to README only if final store screenshots are stable and safe to display.
