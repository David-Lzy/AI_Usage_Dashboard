# Interaction Audit Review Requests

Date: 2026-04-22

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current request manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- track repo-backed interaction-audit review requests before and after fulfillment
- distinguish pending request packages from fulfilled requests that now point at a durable archived review

Managed note:

- this file is regenerated from `review-request.json` manifests inside `Doc/testing/operator_review_requests`
- rerun `npm run interaction-audit:refresh-review-request-index` after adding, removing, or editing a request manifest outside the main request commands

## Request Commands

Create a new pending operator review request:

```bash
npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request
```

Fulfill an existing pending request with an exported signoff JSON:

```bash
npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

By default, completion uses the pending request package's evidence snapshot. Pass `--evidence ...` only when you intentionally need the archive to preserve a different evidence report path.

Preflight one pending request without writing archive output:

```bash
npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

Regenerate one drifted pending request into one aligned replacement request:

```bash
npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request
```

Refresh only the generated request index and machine-readable catalog:

```bash
npm run interaction-audit:refresh-review-request-index
```

## Truth Rules

- a pending request package is not a completed human review
- a stale pending request whose current source template has drifted should be regenerated before completion instead of being treated as current review scope
- a pending request whose evidence snapshot is unreadable or structurally invalid should be fixed before completion instead of being archived with an unrelated fallback report
- a pending request whose evidence snapshot no longer matches the digest recorded in its manifest should be refreshed before completion instead of being archived as if the package were unchanged
- an exported workspace bound to an older request revision should be re-exported from the current request package instead of being fulfilled against one refreshed request with the same request id
- a superseded request preserves stale request history and should point at its aligned replacement request instead of being reused
- fulfilling a request links it to one archived exported review state; it does not rewrite unresolved follow-up or not-reviewed work into a pass claim
- fulfilled requests should preserve their completion receipt metadata, including request revision, evidence provenance, and exported-file digest, instead of requiring raw archive inspection for every receipt detail
- fulfilled requests should keep pointing at the durable archive record instead of duplicating that archive as a second source of truth

## Pending Requests

- [2026-04-23-first-real-operator-review-request](./operator_review_requests/2026-04-23-first-real-operator-review-request/README.md)
  - status: `pending_operator_review`
  - created on 2026-04-22
  - source evidence seed: `tmp/phase69-interaction-audit-evidence-pack/phase69-results.json`
  - request evidence snapshot: `Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/interaction-audit-evidence-pack.json`
  - request evidence snapshot integrity: `sha256:987d16594942591d332858b689ce751fc2b189607d365843ac08547022e0fd5a (5837 bytes)`
  - request revision: `sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1`
  - template drift: `aligned with current source template`

## Fulfilled Requests

- no fulfilled request records are recorded yet
