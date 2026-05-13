# Phase 392 - Popup Guidance 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- split and archived on 2026-05-13

## Goal

Expand high-exposure popup and first-run guidance copy from shell-level localization into reviewed 14-locale runtime copy.

## Scope

- Translate popup guidance, setup coverage, snapshot status, featured-provider summaries, surface-route notes, and first-run empty-state copy identified by `Phase 391`.
- Keep glossary terms stable across all 14 locales: product name, provider names, Chrome, Codex, Cursor, Claude Code, Gemini, quota, sync, source, provider, and policy-only.
- Add focused catalog completeness coverage for the newly translated popup buckets.
- Update i18n docs with the new translated popup scope and any remaining fallback buckets.

## Preserved Boundaries

- Do not translate raw provider evidence, raw diagnostic body text, archive/export schemas, request ids, filenames, route ids, or vendor page text.
- Do not strengthen support claims for policy-only or partial providers.
- Do not change popup behavior, routing, action execution, sync behavior, badge behavior, or provider data models.
- Do not change Chrome Web Store listing copy in this runtime phase.

## Acceptance

- Popup/new-user guidance copy has explicit 14-locale coverage for the buckets selected in `Phase 391`.
- English fallback remains only for documented raw evidence or intentionally deferred buckets.
- Arabic copy respects the existing `rtl` direction boundary and does not require new layout rules beyond bug fixes.
- Existing popup view-model behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Split this broad popup-copy implementation into two smaller child phases before changing runtime code.
- `Phase 392.1` owns first-run guidance, setup coverage, snapshot status, and popup header copy.
- `Phase 392.2` owns featured provider cards, action-section copy, surface-role notes, and aria labels.
- Kept `Phase 393` focused on Settings and provider-detail copy instead of mixing it with popup work.

## Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start `Phase 392.1`, then finish `Phase 392.2` before moving to `Phase 393`.
