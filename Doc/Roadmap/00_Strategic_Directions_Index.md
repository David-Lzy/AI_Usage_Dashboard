# Strategic Directions Index

Date: 2026-05-18

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- living strategy

Freshness model:

- maintained current reference

Status note:

- this file is the current strategic priority index
- detailed historical phase evidence lives under `Doc/TODOs/Archive/by-phase/`
- active implementation work should be expressed as numbered phase files before execution

## Current Truth Snapshot

As of 2026-05-18, the numbered phase queue is completed through `Phase 524`.
No numbered phase is currently queued after `Phase 524`.

The current release candidate is `0.1.0-rc.24` / manifest `0.1.0.24`.
It is prepared as the next Chrome Web Store resubmission candidate after the
public store listing's older `0.1.0-rc.12` page.

## Current Strategic Priorities

1. **Store resubmission readiness**
   - Keep RC24 package, screenshot assets, and four-locale listing copy aligned.
   - Keep the manual upload handoff clear and conservative.

2. **Provider truthfulness**
   - Preserve exact/partial/window-scoped/policy-only labels.
   - Do not claim JetBrains live support until verified account evidence exists.
   - Do not invent exact remaining quota where providers expose only partial data.

3. **Public repository clarity**
   - Keep `README.md`, privacy, security, contributing, and product docs useful to public readers.
   - Keep internal operator workflow and local execution notes out of public-facing docs.

4. **Localization stability**
   - Keep the 14 runtime locale registry, Chrome `_locales`, RTL handling, and store localization draft covered by `npm run i18n:check`.
   - Keep raw provider evidence and export/archive payloads outside translation scope.

5. **Low-risk maintenance**
   - Prefer small, behavior-preserving refactors.
   - Queue larger provider or UI changes as separate numbered phases after RC24.

## Roadmap Detail Files

The older direction files remain as historical and strategic references. Before
starting new work, prefer creating a narrow phase file in `Doc/TODOs/` that
names the exact behavior, tests, and boundaries for that slice.
