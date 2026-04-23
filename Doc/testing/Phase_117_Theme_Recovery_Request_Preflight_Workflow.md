# Phase 117 - Theme Recovery Request Preflight Workflow

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Add one no-mutation preflight gate to the theme-recovery request lifecycle so a future real operator export can be checked for eligibility before any request or archive records are changed.

## What Shipped

- one repo-backed preflight command:
  - `npm run theme-recovery:preflight-review-request -- --request-id <id> --input tmp/theme-recovery-review-export.json`
- one machine-readable preflight report path through `--output`
- pass/fail preflight checks for:
  - pending request status
  - request binding
  - bound workspace route presence
  - target-provider plus preset plus seed contract
- the existing real repo request remained pending; this phase only proved the preflight path in isolated review artifacts

## Files

- `scripts/lib/theme-recovery-review-request-preflight.mjs`
- `scripts/preflight-theme-recovery-review-request.mjs`
- `scripts/phase117-theme-recovery-request-preflight-review.mjs`
- `scripts/lib/theme-recovery-review-request-preflight.test.mjs`

## Verification

Executed:

```bash
npm run phase117:review
```

Key truthful results:

- one matching bound export reported `eligible=yes`
- one mismatched bound export reported `eligible=no`
- the temporary request stayed `pending_operator_review` after both preflight runs
- no archive was written by the preflight workflow

Artifacts:

- `tmp/phase117-theme-recovery-request-preflight-review/phase117-results.json`
- `tmp/phase117-theme-recovery-request-preflight-review/preflight-ok-report.json`
- `tmp/phase117-theme-recovery-request-preflight-review/preflight-fail-report.json`

## Not Claimed

- that the real repo-backed pending request has already passed preflight with real operator evidence
- that the first non-seeded real operator theme-recovery archive already exists
- that preflight replaces the later archive-linked completion step
