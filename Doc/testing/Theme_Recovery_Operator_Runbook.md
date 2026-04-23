# Theme Recovery Operator Runbook

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this runbook should track the current repo-backed theme-recovery workflow
- refresh it whenever workspace export, request, preflight, completion, archive, or index-refresh steps change

Purpose:

- document the manual operator workflow for one real custom-seed recovery pass without claiming that native-prompt or real-session proof already exists
- keep that future real pass compatible with the repo-backed request and archive flows

## Workflow

1. Open the theme-recovery workspace:
   - `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review`
2. If this pass should be tracked in the repo before it happens, create or reuse one pending request package:
   - `npm run theme-recovery:create-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request`
3. Prefer opening the request-bound workspace route from that request package README so exported summary and JSON artifacts preserve the same `requestId + requestCreatedAt` binding.
4. Keep this route open as the control surface while the review is running.
5. Use `Open settings` and keep only:
   - `Cursor`
   - `Codex`
   visible before trusting popup alignment or action-badge recovery.
6. In Settings, confirm the intended saved theme state:
   - `Theme mode`
   - `Accent preset`
   - `Custom seed`
7. Open the target vendor pages from the workspace:
   - `https://cursor.com/dashboard/usage`
   - `https://chatgpt.com/codex/cloud/settings/analytics#usage`
8. Capture the degraded state first:
   - if host access is missing, the workspace should remain `Needs access`
   - if extra providers are visible, the workspace should remain `Needs scope cleanup`
   - if popup snapshot is not aligned, do not rewrite that state into a pass claim
9. Grant host access through the native prompt or restore the real vendor session.
10. Refresh the workspace and verify the recovery truth:
   - review stage returns to `Recovered`
   - popup snapshot returns to `Aligned`
   - action badge clears
   - target providers return to `Healthy`
11. Use `Copy summary`, `Copy JSON`, `Download summary`, or `Download JSON` after the real pass.
12. Keep the exported output under a local file when needed, for example:
    - `tmp/theme-recovery-review-summary.md`
    - `tmp/theme-recovery-review-export.json`
13. If this pass is fulfilling the repo-backed pending request, preflight it first:
    - `npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json`
14. If that preflight passes, complete it through the request lifecycle instead of calling the archive command directly:
    - `npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json`
15. If this pass is intentionally ad-hoc and not bound to the pending request, archive it directly instead:
    - `npm run theme-recovery:archive -- --input tmp/theme-recovery-review-export.json`
16. If you need to rebuild the generated archive or request indexes after manual edits, run:
    - `npm run theme-recovery:refresh-archive-index`
    - `npm run theme-recovery:refresh-review-request-index`
17. If the real pass needs screenshots, keep the workspace visible in one tab and the shipped routes in separate tabs so the current theme and recovery summary stay easy to compare.

## Honesty Rules

- this workspace does not replace a human review; it only makes the current review state easy to inspect and export
- the workspace may show `Computed from current app state` for the action badge in preview mode; only extension mode can surface the live badge value
- `Needs access`, `Needs scope cleanup`, and `Mixed state` are valid review outcomes and must not be rewritten into a pass claim
- this runbook does not claim that native host-prompt proof already exists
- this runbook does not claim that a live vendor-session recovery pass already exists
- one copied summary or JSON export reflects only the current visible state at the moment it was copied
- one request-bound export should only fulfill the matching pending request id and timestamp, not a different request with a similar theme contract
- one failed preflight is a valid outcome; it should block completion until the request binding and theme contract are corrected
- the current repo archive at [Theme_Recovery_Review_Archive.md](./Theme_Recovery_Review_Archive.md) only contains a seeded internal baseline until one real operator recovery session is archived
- the current repo request index at [Theme_Recovery_Review_Requests.md](./Theme_Recovery_Review_Requests.md) still contains only a pending request package until one real operator recovery session is completed and archived
