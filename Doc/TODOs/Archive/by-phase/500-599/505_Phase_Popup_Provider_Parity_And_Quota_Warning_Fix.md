# Phase 505 - Popup Provider Parity And Quota Warning Fix

Date: 2026-05-16

Status: completed and archived

## Goal

Fix popup provider-card selection so a Codex low-quota warning does not hide other visible providers.

## Scope

- remove the popup featured-provider three-card cap and let the popup scroll when more visible providers exist
- stop treating `usage_threshold` diagnostics as product/setup attention
- keep quota warnings visible as user-facing status on the relevant provider card
- keep missing host access, missing credentials, missing source page, unreadable source page, and sync errors classified as product attention
- update localized popup section copy so it no longer promises "up to three" or "top provider" selection

## Preserved Boundaries

- no provider support expansion
- no storage schema change
- no manifest permission change
- no change to adapter raw evidence, diagnostic raw bodies, archive payloads, or export schemas
- provider quota warning text remains visible to users; it only stops driving product-problem filtering

## Acceptance

- popup cards follow the visible popup provider order instead of selecting only the first three or only attention providers
- a low remaining-quota warning can show `Warning` on the provider card without making the popup hide healthy providers
- quota-threshold warnings do not change product attention counts or "Review detail" actions
- real setup/sync problems still appear as product attention
- localized popup copy matches the new unbounded, scrollable provider-card behavior

## Verification

- `npm run test -- src/popup/view-models.test.ts src/popup/featured-section-view-models.test.ts src/sidepanel/view-models.test.ts`
- `npm run test`
- `npm run docs:check`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
- RDP Chrome smoke check: direct popup route shows Codex warning alongside other visible providers, and `chrome://extensions/?errors=gkjioiklbdjcknhdglaehbeofkjmmdpc` has no current extension error records.

## Follow-Up

- package a post-`Phase 505` candidate only if the next Chrome Web Store resubmission should include this source fix.
