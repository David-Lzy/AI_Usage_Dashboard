# Phase 394 - Code Maintenance Hotspot Audit

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 393`
- audit and refactor-prep phase only

## Goal

Review current source and test hotspots after the localization expansion, then define safe maintenance boundaries before refactoring.

## Scope

- Identify the largest and most frequently touched source/test files.
- Map each candidate hotspot to its behavior tests and build checks.
- Prioritize maintenance candidates by concrete risk: translation merge conflicts, oversized aggregators, duplicated provider metadata, brittle adapter tests, and page-session test density.
- Confirm the first planned maintenance implementation remains the runtime message catalog module split in `Phase 395`.

## Preserved Boundaries

- Do not refactor runtime code in this audit phase.
- Do not change provider behavior, UI copy, locale catalogs, release artifacts, or generated evidence.
- Do not split files unless the split has a named behavior-preservation test path.

## Acceptance

- A ranked maintenance hotspot note exists in the phase closeout or a maintained docs location.
- The note identifies which files are safe to touch after localization work and which should not be edited in parallel.
- `Phase 395` has enough test mapping to proceed without rediscovering basic ownership.

## Planned Verification

- `find src -type f \\( -name '*.ts' -o -name '*.tsx' \\) -print0 | xargs -0 wc -l | sort -nr | head -40`
- `rg 'runtime-message-catalogs|provider-sources|page-session|adapter.test' src scripts Doc`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start the runtime message catalog module split in `Phase 395` only after this audit confirms the file boundary and tests.
