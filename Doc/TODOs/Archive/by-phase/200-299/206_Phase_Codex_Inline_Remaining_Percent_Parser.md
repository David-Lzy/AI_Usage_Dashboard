# Phase 206 - Codex Inline Remaining Percent Parser

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Harden the Codex personal usage parser so merged DOM text snippets keep visible remaining windows parseable.

## Completed Work

- Added parser support for inline remaining percentages such as `32% remaining`.
- Added parser support for merged Chinese remaining snippets such as `100% 剩余`.
- Added parser support for full-width percent text such as `100％ 剩余`.
- Kept standalone percentage snippets parseable for the existing live fixture shape.
- Added regression coverage proving inline remaining percentages still produce usage windows, reset timing, and flex-balance context.
- Added `phase206:review` for repeatable marker verification.

## Preserved Boundaries

- No provider coverage, source-selection, archive, release-package, popup, dashboard, or Settings behavior changed.
- Codex personal remains a visible-window usage path rather than one full plan-wide absolute remaining-balance path.
- Flex credit balance remains supplemental context.
- Real authenticated operator evidence is still preferred when the live page is available.

## Verification

- `npm run test -- --run src/providers/codex/personal-page-parser.test.ts`
- `npm run phase206:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Prioritize a real authenticated Codex or Cursor operator pass if available. If not, continue with narrow provider-context parser or release-readiness slices that reduce runtime risk.
