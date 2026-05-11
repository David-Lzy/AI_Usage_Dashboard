# Interaction Audit Operator Handoff Runbook

Date: 2026-05-11

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical runbook for the repo-backed interaction-audit workflow
- refresh it whenever request, preflight, completion, bundle, or archive commands change

## Workflow

1. Open the audit hub:
   - `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`
2. If the pass should be tracked before review, create a pending request package:

```bash
npm run interaction-audit:create-review-request -- --request-id <request-id>
```

3. Review surfaces, import a request template if needed, and update signoff state.
4. Export the current review state to a local JSON file.
5. Build a handoff bundle when you need a portable summary:

```bash
npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
```

6. For request-bound work, preflight then complete:

```bash
npm run interaction-audit:preflight-review-request -- --request-id <request-id> --input tmp/operator-signoff-export.json
npm run interaction-audit:complete-review-request -- --request-id <request-id> --input tmp/operator-signoff-export.json
```

7. For ad-hoc exports, archive directly:

```bash
npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json
```

## Honesty Rules

- the generated bundle reflects only the exported workspace state
- `Ready for signoff: no` is a valid outcome
- do not fulfill one request with an export bound to another request
- seeded archives are workflow baselines, not human signoff
