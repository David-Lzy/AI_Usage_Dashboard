# Chrome Web Store Publication Milestone

Date: 2026-09-23

Document class:

- public milestone

Freshness model:

- update when the public store listing, release candidate, or known blocking
  issue status changes

Status note:

- AI Usage Dashboard has a live Chrome Web Store listing
- the public listing displays `0.2.0-rc.13`, checked on 2026-09-22 UTC
- GitHub Release `v0.2.0-rc.13` provides browser-specific packages and checksums
- source `0.2.0-rc.14` / manifest `0.2.0.14` is being prepared for a separately
  authorized release; it is not the Store package shown on the public listing
- private upload receipts, package hashes, screenshots-in-progress, and
  submission handoff notes stay in ignored `.local/` material

## Public Listing

- Chrome Web Store:
  https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- Public page checked on 2026-09-22 UTC: reachable, displaying `0.2.0-rc.13`,
  updated July 28, 2026, with 14 languages. This is a public-page observation,
  not a fresh authenticated API or rollout-percentage report.
- [GitHub Release v0.2.0-rc.13](https://github.com/David-Lzy/AI_Usage_Dashboard/releases/tag/v0.2.0-rc.13)
  was also rechecked on 2026-09-22 UTC. It is marked prerelease and contains
  the named Chrome/Firefox zips and `SHA256SUMS.txt`.

## Historical Submission Observations

These dated observations explain the handoff history, not the current listing:

- Chrome Web Store API status observed on 2026-07-29 showed manifest version
  `0.2.0.12` published at 100%.
- The `v0.2.0-rc.10` tag workflow published Chrome and Firefox GitHub Release
  assets plus checksums. Its optional Chrome Web Store upload step did not run,
  so manifest `0.2.0.10` is not recorded as submitted or published.
- The `v0.2.0-rc.11` tag workflow published Chrome and Firefox GitHub Release
  assets plus checksums. Its optional Store upload step was skipped because the
  repository credentials were unavailable, so the verified local official API
  fallback uploaded manifest `0.2.0.11` and submitted it for review. The Store
  API later reported that revision as published.
- The `v0.2.0-rc.12` release adds the maintained Material design contract,
  automated UI guards, stronger multilingual visual checks, and verified
  external-review fixes without changing Provider source claims. The verified
  local official API fallback uploaded manifest `0.2.0.12` and submitted it for
  review; the Store API later reported that revision as published.
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
- The same historical status check reported manifest `0.2.0.13` as
  `PENDING_REVIEW` at 100%. That pending observation has been superseded by
  the public listing check above; it must not be presented as current status.

This means the project has crossed the public-store baseline milestone. Future
store uploads are resubmissions from an already-published extension, not first
submissions. Public listing metadata can lag the Chrome Web Store API state.
A successful upload or submission alone does not prove publication. Cite the
observed public version or authenticated published state, and keep the date
and evidence type explicit.

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

Store availability is not a guarantee that every provider or environment is
working. The RC14 source candidate hardens account-isolated sync, concurrent
state writes, capture freshness, shared controls and production initialization.
Those changes are not claimed as shipped in the public rc.13 listing. Ongoing
risks include:

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

- Keep RC14 source behavior separate from the currently available Store
  version. This release is authorized, but a tag or Store submission still
  requires verified build and publisher results before its status changes.
- Apply the maintained Sub2API listing-copy updates in the Developer Dashboard
  when the publisher account can complete Google's interactive re-verification.
- Keep the current public copy in `Doc/Store/` as the maintained text source.
- Keep personal upload operations and generated screenshot working files under
  `.local/`.
