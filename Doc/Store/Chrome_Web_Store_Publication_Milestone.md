# Chrome Web Store Publication Milestone

Date: 2026-10-04

Document class:

- public milestone

Freshness model:

- update when the public store listing, release candidate, or known blocking
  issue status changes

Status note:

- AI Usage Dashboard has a live Chrome Web Store listing
- a direct public-page fetch displayed `0.2.1` on 2026-10-04 UTC;
  authenticated Store API status reports manifest `0.2.1.0` as `PUBLISHED`
  at 100%, with no submitted revision at that checkpoint
- GitHub Release `v0.2.2` is stable and provides verified browser-specific
  packages and checksums; its Chrome manifest is `0.2.2.0`
- the Store API accepted the 0.2.1 package upload on 2026-09-24 UTC; the
  updated listing and images were saved in the Developer Dashboard and the
  revision was submitted for review once with automatic publication after
  approval selected
- the 2026-09-24 `PENDING_REVIEW` observation for 0.2.1 is historical and
  superseded by the publication confirmation above
- GitHub 0.2.2 was released on 2026-10-04 UTC. The Store API accepted its exact
  tag-scoped package as an uploaded draft; listing metadata and review submission
  remain pending. It is not a public Store release.
- the RC14 tag workflow skipped Store handoff because repository credentials
  are not configured; a later authenticated local upload and Dashboard review
  submission succeeded, and RC14 has since been published
- private upload receipts, package hashes, screenshots-in-progress, and
  submission handoff notes stay in ignored `.local/` material

## Public Listing

- Chrome Web Store:
  https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- On 2026-10-04 UTC, the public listing displayed `0.2.1` and an update date
  of September 25, 2026. The authenticated API confirmed manifest `0.2.1.0`
  as `PUBLISHED` at 100%, with no submitted revision.
- [GitHub Release v0.2.2](https://github.com/David-Lzy/AI_Usage_Dashboard/releases/tag/v0.2.2)
  was published on 2026-10-04 UTC. Main and tag Actions passed; both downloaded
  browser ZIPs matched the published SHA256SUMS and passed ZIP integrity checks.
  The tag workflow did not perform Store upload because repository credentials
  are absent. A separate authenticated local upload returned `SUCCEEDED` for
  `0.2.2.0`; the subsequent status still reported `0.2.1.0` as `PUBLISHED`
  at 100% with no submitted revision. Metadata and review are not yet complete.
- A direct public-page fetch on 2026-09-23 at 15:20 UTC displayed
  `0.2.0-rc.14`. Authenticated Store API status at the same checkpoint reported
  manifest `0.2.0.14` as `PUBLISHED` at 100%; a fresh API check on
  2026-09-24 UTC reported the same published revision.
- [GitHub Release v0.2.1](https://github.com/David-Lzy/AI_Usage_Dashboard/releases/tag/v0.2.1)
  passed its tag workflow on 2026-09-24 UTC. The Chrome and Firefox assets were
  downloaded and verified against the release's `SHA256SUMS.txt`. The Store
  handoff job skipped because repository Store variables are not configured.
- The 0.2.1 Store package upload returned `SUCCEEDED` and manifest `0.2.1.0`.
  The Developer Dashboard saved the five updated localized screenshot sets,
  five global English screenshots, two promotional images, and current listing
  descriptions. It accepted one review submission on 2026-09-24 UTC with
  automatic publication after approval selected. A subsequent authenticated
  API check reported `0.2.1.0` as `PENDING_REVIEW` at 100%, while RC14 manifest
  `0.2.0.14` remained `PUBLISHED` at 100%. Submission does not prove public
  availability. That review observation has since been superseded by the
  2026-10-04 publication confirmation.
- [GitHub Release v0.2.0-rc.14](https://github.com/David-Lzy/AI_Usage_Dashboard/releases/tag/v0.2.0-rc.14)
  was checked on 2026-09-23 UTC. It is marked prerelease; both browser zips
  were downloaded and verified against its published `SHA256SUMS.txt`.
- The RC14 tag workflow passed build/test/package and created the GitHub
  Release. Its Store upload steps were skipped after the credential check;
  an authenticated local API upload then accepted manifest `0.2.0.14`.
- The initial RC14 review request returned `INVALID_ITEM_METADATA`. The
  Developer Dashboard exposed a missing required explanation for the new
  optional `notifications` permission. After that field was completed and the
  draft saved, the Dashboard accepted the review submission with automatic
  publication after approval selected.
- Before approval, authenticated Store API status reported manifest
  `0.2.0.14` as `PENDING_REVIEW` while `0.2.0.13` remained published. That
  review checkpoint is historical; RC14 was subsequently published and is
  now superseded by 0.2.1.

## Historical Submission Observations

These dated observations explain the handoff history, not the current listing:

- An earlier public-page check on 2026-09-23 UTC displayed `0.2.0-rc.13`,
  updated July 28, 2026. Later direct-page and authenticated API checks above
  supersede that observation.
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
- Maintained listing-copy sources include bounded Sub2API-compatible aggregate
  metering and the 0.2.1 update. The 0.2.1 metadata was applied to the live
  Developer Dashboard before its review submission.
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
working. The published 0.2.1 build includes account-isolated sync, concurrent
state writes, capture freshness, shared controls and production initialization.
Ongoing risks include:

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

- Apply and verify the prepared 0.2.2 screenshots and copy, then submit the
  existing uploaded draft in one review request. Do not re-upload the accepted
  tag package merely to resume metadata work.
- After submission, verify both authenticated API publication state and
  public-page rollout before calling 0.2.2 available on the Store. Keep
  uploaded, submitted, and published states distinct.
- Keep the current public copy in `Doc/Store/` as the maintained text source.
- Keep personal upload operations and generated screenshot working files under
  `.local/`.
