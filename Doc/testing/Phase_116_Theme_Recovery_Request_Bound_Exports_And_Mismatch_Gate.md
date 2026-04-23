# Phase 116 - Theme Recovery Request-Bound Exports And Mismatch Gate

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Prevent one theme-recovery export from fulfilling the wrong pending request when multiple requests share the same high-level custom-seed contract.

## What Shipped

- the theme-recovery workspace now reads one bound request context from the URL query:
  - `themeRecoveryRequestId`
  - `themeRecoveryRequestCreatedAt`
- the bound workspace now shows one `Request scope` section instead of silently acting like an ad-hoc route
- summary draft and JSON export now preserve that same request context
- downloaded summary and JSON filenames now include a sanitized request-id suffix when the workspace is bound
- the completion flow now rejects one export whose bound request id or created-at timestamp does not match the target pending request

## Files

- `src/sidepanel/routes/ThemeRecoveryReviewPage.tsx`
- `src/sidepanel/theme-recovery-review.ts`
- `src/sidepanel/theme-recovery-export-files.ts`
- `src/sidepanel/theme-recovery-export-files.test.ts`
- `src/sidepanel/theme-recovery-review.test.ts`
- `scripts/lib/theme-recovery-review-request.mjs`
- `scripts/lib/theme-recovery-review-request.test.mjs`
- `scripts/lib/theme-recovery-review-archive.mjs`
- `scripts/complete-theme-recovery-review-request.mjs`
- `scripts/phase116-theme-recovery-request-bound-export-review.mjs`

## Verification

Executed:

```bash
npm run phase114:review
npm run phase115:review
npm run phase116:review
```

Key truthful results:

- the real repo-backed request stayed pending
- the real repo archive index stayed at `seeded=1 operator=0`
- temporary review artifacts proved one mismatched `requestId` is now rejected
- that rejection left the temporary request in `pending_operator_review`
- bound summary and JSON artifacts now preserve `requestId + requestCreatedAt` instead of remaining fungible exports

Artifacts:

- `tmp/phase116-theme-recovery-request-bound-export-review/phase116-results.json`

## Not Claimed

- that the real repo-backed pending request has already been fulfilled
- that a real operator theme-recovery archive already exists
- that native-prompt or real-session operator evidence has already been captured
