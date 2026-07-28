# Chrome Web Store Publication Milestone

Date: 2026-07-29

Document class:

- public milestone

Freshness model:

- update when the public store listing, release candidate, or known blocking
  issue status changes

Status note:

- AI Usage Dashboard has a live Chrome Web Store listing
- Chrome Web Store API status shows manifest version `0.2.0.12` published at 100%
- source `0.2.0-rc.10` / manifest `0.2.0.10` is available from GitHub with
  browser-specific packages and checksums, but is not submitted to the Store
- source `0.2.0-rc.11` / manifest `0.2.0.11` is available from GitHub and
  published by the Chrome Web Store at 100%
- source `0.2.0-rc.12` / manifest `0.2.0.12` is available from GitHub and
  published by the Chrome Web Store at 100%
- source `0.2.0-rc.13` / manifest `0.2.0.13` is available from GitHub with
  browser-specific packages and checksums; the Store API reports it submitted
  at 100% and `PENDING_REVIEW`
- no known critical user-facing bug is blocking normal use at this milestone
- private upload receipts, package hashes, screenshots-in-progress, and
  submission handoff notes stay in ignored `.local/` material

## Public Listing

- Chrome Web Store:
  https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- Public page status checked on 2026-07-26: reachable and listed.
- Chrome Web Store API status observed on 2026-07-29 showed manifest version
  `0.2.0.12` published at 100%.
- The `v0.2.0-rc.10` tag workflow published Chrome and Firefox GitHub Release
  assets plus checksums. Its optional Chrome Web Store upload step did not run,
  so manifest `0.2.0.10` is not recorded as submitted or published.
- The `v0.2.0-rc.11` tag workflow published Chrome and Firefox GitHub Release
  assets plus checksums. Its optional Store upload step was skipped because the
  repository credentials were unavailable, so the verified local official API
  fallback uploaded manifest `0.2.0.11` and submitted it for review. The Store
  API now reports that revision as published.
- The `v0.2.0-rc.12` release adds the maintained Material design contract,
  automated UI guards, stronger multilingual visual checks, and verified
  external-review fixes without changing Provider source claims. The verified
  local official API fallback uploaded manifest `0.2.0.12` and submitted it for
  review; the Store API now reports that revision as published.
- The `v0.2.0-rc.13` release prevents sample quota values from entering new
  profiles, preserves provider visibility across account switches, and adds
  connection-test feedback plus configurable multi-deployment presentation for
  Sub2API. Its tag workflow produced the browser packages but skipped the
  optional Store upload because repository credentials were unavailable. The
  verified local official API fallback then uploaded manifest `0.2.0.13` and
  submitted it for review.
- The maintained listing-copy sources now include bounded Sub2API-compatible
  aggregate metering. Applying those text changes to the live Developer
  Dashboard remains a separate metadata operation.
- Chrome Web Store API status observed on 2026-07-29 reports manifest
  `0.2.0.12` as `PUBLISHED` at 100%.
- The same status check reports manifest `0.2.0.13` as `PENDING_REVIEW` at
  100%; the published listing remains manifest `0.2.0.12` until review
  completes.

This means the project has crossed the public-store baseline milestone. Future
store uploads are resubmissions from an already-published extension, not first
submissions. Public listing metadata can lag the Chrome Web Store API state;
submitted candidates must not be described as published until the API reports
the submitted revision as published.

## Stable Baseline

At this milestone, the project has the following public-facing baseline:

- toolbar popup for quick provider status and quota checks
- side panel and full-page dashboard for deeper provider details
- provider setup/display model that keeps setup, display visibility, ordering,
  and quota-item visibility separate
- conservative provider source labels for exact, partial, window-scoped,
  policy-only, or unavailable data
- configurable language, theme, popup layout, progress style, provider order,
  toolbar badge, toolbar icon behavior, and import/export settings
- background-first Codex current-quota refresh plus bounded normalized history
  summaries when the signed-in ChatGPT session exposes the verified structured
  responses
- background Cursor billing-cycle summaries plus bounded aggregate history when
  the signed-in Cursor session exposes the verified structured responses
- configured Sub2API-compatible gateway summaries for key-scoped aggregate
  balance, spend, requests, tokens, models, trends, and returned limits
- public store copy and localization drafts under `Doc/Store/`
- public privacy, security, contribution, i18n, provider-note, and product
  boundary docs

## Quality Gate State

No large blocking bug is known at this milestone. The remaining risk is normal
Chrome extension and provider-surface drift:

- provider dashboards, API fields, usage wording, and quota policy can change
- Chrome Web Store metadata can lag after upload or resubmission
- live provider values must remain labeled by source quality instead of being
  presented as universal billing truth
- optional host permissions and favicon use must remain narrowly explained

## Preserved Boundaries

- This is not an official product from OpenAI, Cursor, Anthropic, Google,
  JetBrains, or any other provider.
- It is not a billing authority or guarantee of provider limits.
- It must not ask users to paste cookies or raw browser auth headers.
- Public docs should not include private upload receipts, account screenshots,
  package hashes, or local browser/RDP evidence.

## Next Store Work

- Wait for the Chrome Web Store review of manifest `0.2.0.13`; do not describe
  it as published until the Store API reports that state.
- Apply the maintained Sub2API listing-copy updates in the Developer Dashboard
  when the publisher account can complete Google's interactive re-verification.
- Keep the current public copy in `Doc/Store/` as the maintained text source.
- Keep personal upload operations and generated screenshot working files under
  `.local/`.
