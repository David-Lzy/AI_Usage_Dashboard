# Phase 115 - Theme Recovery Review Request Completion Workflow

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Turn the theme-recovery request flow from `create + index` into a real completion lifecycle without falsely claiming that the first human operator pass already exists.

## What Shipped

- one repo-backed completion command:
  - `npm run theme-recovery:complete-review-request -- --request-id <id> --input tmp/theme-recovery-review-export.json`
- fulfilled request manifests now preserve:
  - archive id and archive paths
  - completed stage summary
  - completed export digest
- completed theme-recovery archives now preserve `sourceRequest` metadata
- generated request and archive indexes now surface that request-archive traceability
- the existing real repo request stayed pending; this phase only proved the lifecycle in isolated review artifacts

## Files

- `scripts/complete-theme-recovery-review-request.mjs`
- `scripts/lib/theme-recovery-review-request.mjs`
- `scripts/lib/theme-recovery-review-request-index.mjs`
- `scripts/lib/theme-recovery-review-archive.mjs`
- `scripts/lib/theme-recovery-review-archive-index.mjs`
- `scripts/phase115-theme-recovery-review-request-completion-review.mjs`

## Verification

Executed:

```bash
npm run phase114:review
npm run phase115:review
```

Key truthful results:

- temporary completion moved one request from `pending_operator_review` to `fulfilled_review_archived`
- temporary archive preserved `sourceRequest.requestId`
- temporary request index became `pending=0 fulfilled=1`
- temporary archive index became `seeded=0 operator=1`
- the preserved completed stage remained `Needs access`; the review did not rewrite a degraded export into a pass claim

Artifacts:

- `tmp/phase115-theme-recovery-review-request-completion-review/phase115-results.json`

## Not Claimed

- that the real repo-backed pending request has already been fulfilled
- that the first non-seeded human operator theme-recovery archive already exists
- that native-prompt or real-session operator evidence has already been collected
