# Theme Recovery Review Requests

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current request manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- track repo-backed theme-recovery review requests before the first real operator archive exists
- distinguish pending request packages from future fulfilled requests that point at durable theme-recovery archives

Managed note:

- this file is regenerated from `review-request.json` manifests inside `Doc/testing/theme_recovery_review_requests`
- rerun `npm run theme-recovery:refresh-review-request-index` after manual request edits

## Request Commands

Create a new pending theme-recovery review request:

```bash
npm run theme-recovery:create-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request
```

Complete one pending theme-recovery request and archive the exported review:

```bash
npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
```

Preflight one pending theme-recovery request without mutating request or archive records:

```bash
npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
```

Refresh only the generated request index and machine-readable catalog:

```bash
npm run theme-recovery:refresh-review-request-index
```

## Truth Rules

- a pending theme-recovery request package is not a completed human review
- the seeded reference export copied into a request package is only a baseline reference, not a recovered operator pass
- fulfilled theme-recovery requests should link to one durable archive instead of free-floating notes or screenshots

## Pending Requests

- [2026-04-23-first-real-theme-recovery-review-request](./theme_recovery_review_requests/2026-04-23-first-real-theme-recovery-review-request/README.md)
  - status: `pending_operator_review`
  - created on 2026-04-23
  - workspace route: `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review`
  - seeded reference: stage `Needs access` · popup `Mixed state` · scope `Cursor + Codex isolated`
  - theme: `light` / `custom` · seed `#4F46E5`
  - source seeded archive: `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md`

## Fulfilled Requests

- no fulfilled theme-recovery review requests are recorded yet
