# Phase 389 - Documentation Link Check Guard

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 388`
- documentation tooling phase only

## Goal

Add a lightweight repository-local Markdown link checker so future document moves fail fast instead of leaving broken relative links.

## Scope

- Add a `docs:links` npm script.
- Make `docs:check` run both the existing taxonomy check and the new link check.
- Check tracked Markdown files for repo-relative and file-relative Markdown links whose targets should exist in the working tree.
- Add focused tests for good relative links, broken relative links, ignored external links, ignored fragment-only links, and archive-bucket paths.

## Preserved Boundaries

- Do not perform external URL reachability checks.
- Do not validate heading anchors in v1; strip `#anchor` and query text before resolving the file or directory target.
- Do not parse raw backtick paths or prose-only path mentions in v1.
- Do not reorganize docs as part of the checker implementation except for minimal broken-link fixes required to make the new guard pass.

## Acceptance

- `npm run docs:links` reports all broken repo-local Markdown link targets and exits nonzero when any are found.
- `npm run docs:check` includes the link check.
- The checker accepts `http:`, `https:`, `mailto:`, `chrome:`, `data:`, and fragment-only links without local filesystem validation.
- The checker accepts existing bucketed archive links under `Doc/TODOs/Archive/by-phase/` and `Doc/testing/Archive/phase-reports/`.

## Planned Verification

- `npm run test -- scripts/lib/doc-link-check.test.mjs`
- `npm run docs:links`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If anchor validation becomes necessary, add it as a separate phase after the file-existence guard is stable.
