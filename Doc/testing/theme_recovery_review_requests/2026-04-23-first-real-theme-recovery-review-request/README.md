# Theme Recovery Review Request

Request ID: `2026-04-23-first-real-theme-recovery-review-request`
Created at: 2026-04-23T11:13:03.801Z
Status: `pending_operator_review`

Workspace route:

- `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review`

Request-bound workspace route:

- `http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-23-first-real-theme-recovery-review-request&themeRecoveryRequestCreatedAt=2026-04-23T11%3A13%3A03.801Z#debug-theme-recovery-review`

Source template:

- `fixtures/theme-recovery/operator-review-request-template.fixture.json`

Seeded reference archive:

- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md`

Seeded reference export:

- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/theme-recovery-review-export.json`

Current seeded reference truth:

- review stage: `Needs access`
- popup snapshot: `Mixed state`
- scope isolation: `Cursor + Codex isolated`
- theme: `light` / `custom` · seed `#4F46E5`
- target providers: `Cursor, Codex`

Expected operator focus:

- preserve the current review scope for: `cursor, codex`
- expected preset: `custom`
- expected seed: `#4F46E5`
- recommended downloads: `summary, json`


Workflow:

1. Open the theme-recovery workspace and confirm the current theme mode, resolved mode, preset, and custom seed.
2. Keep only Cursor and Codex visible before trusting popup alignment or action-badge recovery.
3. Capture the degraded state first if host access or a real session is still missing.
4. Grant host access through the native prompt or restore the real vendor session, then refresh the workspace and verify the recovery stage.
5. Download the summary and JSON export after the operator pass, then archive the exported JSON through the repo command.

Lifecycle commands:

```bash
npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
npm run theme-recovery:refresh-review-request-index
npm run theme-recovery:refresh-archive-index
```

Truth rules:

- Needs access, Needs scope cleanup, and Mixed state are valid outcomes and must not be rewritten into a pass claim.
- The seeded archive is only a baseline reference and does not count as a real operator recovery session.
- A pending review request package is not a completed human review.
- this request package does not claim that a human review has already happened
- the first real operator theme-recovery pass should preserve its actual exported stage instead of rewriting degraded outcomes into a pass claim
- the current repo archive index lives in [Theme_Recovery_Review_Archive.md](../Theme_Recovery_Review_Archive.md)
