# Interaction Audit Review Request

Document class:

- generated operational ledger

Status note:

- this package README is generated from one repo-backed request manifest and should be refreshed through the request generator or refresh workflow, not hand-edited
- it preserves current request-package truth only and does not claim that a human review has already happened

Request ID: `2026-04-23-first-real-operator-review-request`
Created at: 2026-04-22T23:40:08.207Z
Status: pending_operator_review
Source template: `fixtures/interaction-audit/operator-review-request-template.fixture.json`
Source evidence seed: `tmp/phase69-interaction-audit-evidence-pack/phase69-results.json`
Request evidence snapshot: `interaction-audit-evidence-pack.json`
Request evidence snapshot integrity: `sha256:987d16594942591d332858b689ce751fc2b189607d365843ac08547022e0fd5a (5837 bytes)`
Request revision: `sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1`

Current review template truth:
- Reviewer: not set yet
- Session: not set yet
- Reviewed at: not set yet
- Reviewed surfaces: 0 / 5
- Expected audit shape: 5 surfaces, 11 manual checks
- Request binding: 2026-04-23-first-real-operator-review-request @ 2026-04-22T23:40:08.207Z

Workflow:
1. Open `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`.
2. Use `Import signoff JSON` and load `interaction-audit-signoff-template.json` from this request directory.
3. Fill `Reviewer name`, `Session label`, and `Reviewed at` in the audit hub.
4. Work through the audit surfaces and update manual checks, signoff states, and operator notes.
5. Export the completed workspace as signoff JSON from the audit hub.
6. Optionally preflight the export without writing repo state:

```bash
npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

7. Fulfill the finished export with:

```bash
npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

That completion command now uses this request package's `Request evidence snapshot` by default. Only pass `--evidence ...` when you intentionally want the archived review to preserve a different evidence report path.

If this request later drifts away from the current source template, regenerate it with:

```bash
npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request
```

Truth note:
- this request package does not claim that a human review has already happened
- the template JSON is intentionally blank and should be replaced by the real exported review state after the operator pass
- the completion command will reject exported workspace state whose request binding or workspace shape does not match this request package
- the completion command will also reject this request if the current source template has drifted away from the request package and the request needs regeneration first
- the preflight and completion commands will also reject one exported workspace whose bound request revision no longer matches the current request package
- if the pending request is refreshed in place, re-import the latest request template or re-export from the current audit workspace before completion; older exports stay bound to the previous request revision and are rejected
- the preflight command now also checks whether this request package's evidence snapshot is still readable and structurally valid before completion writes archive state
- the preflight and completion commands will also reject this request if the request evidence snapshot no longer matches the digest recorded in the request manifest
- regenerating a stale request supersedes this request and creates one aligned replacement request; it does not claim that a human review has already happened
