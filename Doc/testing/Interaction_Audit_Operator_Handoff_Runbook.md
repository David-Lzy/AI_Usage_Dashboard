# Interaction Audit Operator Handoff Runbook

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- document the real operator workflow for turning current audit-hub state into a current-state handoff bundle without claiming that signoff is already complete

## Workflow

1. Open the audit hub:
   - `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`
2. If you are starting a fresh real operator pass, create a pending request package first:

```bash
npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request
```

3. Review the current surfaces, or import an earlier workspace export through `Import signoff JSON`.
4. Use the `Review Queue` to identify the next unresolved surface:
   - `Follow-up required` surfaces stay first
   - then `Not reviewed`
   - then `Pending checks`
   - `Ready` surfaces fall to the end
   - use `Jump to ...` or `Jump to surface` to move directly to the intended review block
5. If you created a request package, import `interaction-audit-signoff-template.json` from that request directory before making review changes.
6. Update manual checks, signoff status, and operator notes inside the audit hub until the current review state is accurate.
7. Fill the review-session metadata inside the audit hub:
   - `Reviewer name`
   - `Session label`
   - `Reviewed at`
   - use `Stamp current time` when you want the workspace to capture the current review moment directly
8. Use `Download signoff JSON` for a direct local file.
9. If the current environment cannot save files directly, use `Copy signoff JSON` instead.
10. Keep that exported JSON under a local file such as:
   - `tmp/operator-signoff-export.json`
11. Optional but useful:
   - use `Download signoff draft` when you want the full current workspace note as markdown
   - use `Download handoff summary` when you want the unresolved-work summary as markdown
   - if the workspace is bound to a repo-backed request, confirm the visible `Request Scope` block shows that request, its current request revision, and the matching preflight plus completion commands before you leave the page
12. Build the current-state handoff bundle:

```bash
npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
```

13. If you started from a repo-backed request package, fulfill that request instead of archiving the export ad hoc:

```bash
npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

That preflight command checks seeded-state rejection, request binding, workspace shape, current-template drift, and the request package's evidence snapshot plus its recorded digest without writing archive or request state. If it passes, then fulfill the request:

```bash
npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
```

That completion command now also checks that the exported workspace request binding and workspace shape still match the request package before it writes a fulfilled request or archive record. It will also refuse a stale request package if the current source template has drifted and the request should be regenerated first, and it will reject a packaged evidence snapshot whose current file no longer matches the digest recorded in the request manifest. By default, it uses the request package's `Request evidence snapshot`; pass `--evidence ...` only when you intentionally want the archive to preserve a different evidence-report path.

If preflight fails because the export is bound to an older request revision, re-import the latest `interaction-audit-signoff-template.json` from that request package or re-export from the current audit workspace before trying completion again.

If a pending request has drifted, regenerate it instead of hand-editing the repo:

```bash
npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request
```

14. If you are archiving an exported review without a repo-backed request package, use the archive command directly instead:

```bash
npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json
```

15. Review the generated artifacts:
   - `tmp/operator-handoff-bundle/interaction-audit-handoff-bundle.md`
   - `tmp/operator-handoff-bundle/interaction-audit-handoff-bundle.json`
   - confirm the bundle still shows the expected `Reviewer`, `Session`, and `Reviewed at` values from the workspace export
   - confirm the bundle also preserves evidence source plus integrity summary instead of reducing provenance to the raw evidence path alone
   - if the workspace was bound to a repo-backed request, confirm both bundle artifacts also preserve the same `Request binding` and `Request revision` shown inside the audit hub
   - if the workspace was bound to a repo-backed request, confirm the downloaded signoff JSON filename also included that request id plus the short `rev-...` request-revision segment
   - confirm the downloaded signoff draft and handoff summary also preserve the same `Request revision: sha256:...` line shown inside the audit hub
   - if you fulfilled a repo-backed request, confirm `Doc/testing/Interaction_Audit_Review_Requests.md` and `Doc/testing/operator_review_requests/index.json` now show that request as fulfilled
   - if you fulfilled a repo-backed request, confirm the new dated archive under `Doc/testing/operator_reviews/` also preserves the source request id and request paths
   - if you fulfilled a repo-backed request, confirm that same archive manifest plus archive `README.md` also preserve the actual evidence source and integrity summary used during completion
   - if you fulfilled a repo-backed request, confirm that same archive manifest plus archive `README.md` also preserve the fulfilled export's `Request binding` and `Request revision`
   - if you fulfilled a repo-backed request, confirm the fulfilled request manifest plus request `README.md` also preserve the completion reviewer/session/reviewed-at values, completion request revision, completion evidence source, and completed export digest
   - if you fulfilled or archived the export into the repo, confirm the new dated directory under `Doc/testing/operator_reviews/` also preserves the same review-session metadata and current unresolved-work truth
   - confirm `Doc/testing/Interaction_Audit_Review_Archive.md` now includes that archived session automatically and shows `Request binding`, `Request revision`, and evidence source plus integrity state when the archive came from a request-bound export
   - confirm `Doc/testing/Interaction_Audit_Review_Requests.md` now shows the same fulfilled request with a concise completion receipt instead of only the archive link plus unresolved-work summary
16. If more review work happens later, export a new signoff JSON snapshot and rerun the same bundle command so the handoff artifacts stay truthful.

## Honesty Rules

- the generated bundle reflects the current exported workspace state only
- the repo archive reflects the same exported workspace state only; archiving it does not change its review truth
- one exported workspace must not fulfill a different pending request just because the visible checklist shape happens to match
- one repo-backed request should not silently archive against an unrelated fallback evidence pack when the request package already carries its own evidence snapshot
- one repo-backed request should not silently pass preflight or completion after its packaged evidence snapshot has been modified away from the digest recorded in the request manifest
- one repo-backed request should not silently accept an export that is still bound to an older revision of the same request package after that request has been refreshed in place
- `Ready for signoff: no` is a valid output and must not be rewritten into a pass claim
- follow-up surfaces and not-reviewed surfaces should stay visible in the generated bundle until the workspace state actually changes
- a seeded archive is useful as a workflow baseline, but it is not a real human operator signoff
- this runbook does not replace a real human review; it only makes that review state portable and auditable
