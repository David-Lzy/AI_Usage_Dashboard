# Theme Recovery Operator Runbook

Date: 2026-05-11

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical runbook for the repo-backed theme-recovery workflow
- refresh it whenever workspace export, request, preflight, completion, archive, or index-refresh steps change

## Workflow

1. Open the theme-recovery workspace:
   - `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review`
2. If the pass should be tracked in-repo first, create a pending request package:

```bash
npm run theme-recovery:create-review-request -- --request-id <request-id>
```

3. Keep the workspace route open while validating degraded and recovered states.
4. Export the current state to a local JSON file.
5. For request-bound work, preflight then complete:

```bash
npm run theme-recovery:preflight-review-request -- --request-id <request-id> --input tmp/theme-recovery-review-export.json
npm run theme-recovery:complete-review-request -- --request-id <request-id> --input tmp/theme-recovery-review-export.json
```

6. For ad-hoc work, archive directly:

```bash
npm run theme-recovery:archive -- --input tmp/theme-recovery-review-export.json
```

## Honesty Rules

- `Needs access`, `Needs scope cleanup`, and `Mixed state` are valid review outcomes
- preview mode may show computed badge state; extension mode is the truthful badge source
- do not fulfill one request with an export bound to another request
