# Phase 135 - Provider Notes And Fixture Reference Labeling

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- extend the new documentation taxonomy and freshness model into the remaining maintained-reference docs that are easiest to mistake for one-time research notes
- make provider notes and page-session fixture conventions visibly current references instead of unlabeled historical artifacts

## Scope

This slice continues `Direction 08`.

It does not change runtime code.

It updates:

- all provider notes under [Doc/provider_notes](../provider_notes)
- [Page_Session_Fixture_Conventions.md](./Page_Session_Fixture_Conventions.md)
- the taxonomy and active indexes that explain those docs

## What Changed

1. All provider notes now declare their class and freshness model.

Applied to:

- [Cursor.md](../provider_notes/Cursor.md)
- [Claude.md](../provider_notes/Claude.md)
- [Codex.md](../provider_notes/Codex.md)
- [Gemini.md](../provider_notes/Gemini.md)
- [JetBrains.md](../provider_notes/JetBrains.md)

Each note now says it is:

- `Document class: maintained reference`
- `Freshness model: maintained current reference`

2. Provider notes now also explain what should trigger a refresh.

The top-of-file `Status note` now makes it explicit that each provider note should be refreshed when:

- the selected source path changes
- the active release promise changes
- the official-source basis changes

3. The fixture-conventions doc is now explicitly treated as a maintained current reference.

Updated:

- [Page_Session_Fixture_Conventions.md](./Page_Session_Fixture_Conventions.md)

This prevents it from reading like a one-time capture note when it is actually a durable process reference.

4. The taxonomy now names fixture-convention docs as maintained references too.

Updated:

- [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

## Truth Boundary

This slice improves reference-doc legibility only.

It does not claim:

- that all provider-note contents were re-researched today
- that the provider support story itself changed
- that every maintained-reference doc in the repo has now been labeled

The narrower truthful outcome is:

- provider notes now read like maintained current references instead of unlabeled historical research notes
- fixture conventions now read like a maintained current reference instead of an isolated helper note

## Verification

- reviewed the updated top-of-file labels in all provider notes
- reviewed the updated top-of-file labels in [Page_Session_Fixture_Conventions.md](./Page_Session_Fixture_Conventions.md)
- `git diff --check`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`

## Follow-Up

Recommended next slice:

- continue `Direction 08` with a smaller pass over any remaining maintained-reference docs that still lack explicit freshness cues, then consider whether one lightweight doc-consistency check is worth automating
