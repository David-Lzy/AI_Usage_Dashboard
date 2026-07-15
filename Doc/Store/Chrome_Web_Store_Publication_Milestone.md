# Chrome Web Store Publication Milestone

Date: 2026-07-15

Document class:

- public milestone

Freshness model:

- update when the public store listing, release candidate, or known blocking
  issue status changes

Status note:

- AI Usage Dashboard has a live Chrome Web Store listing
- public Chrome Web Store metadata now shows `0.1.0-rc.34`
- Chrome Web Store API status shows manifest version `0.1.0.36` published
- local source `0.2.0-rc.1` / manifest `0.2.0.1` is submitted for review
- no known critical user-facing bug is blocking normal use at this milestone
- private upload receipts, package hashes, screenshots-in-progress, and
  submission handoff notes stay in ignored `.local/` material

## Public Listing

- Chrome Web Store:
  https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- Public page status checked on 2026-07-15: reachable and listed.
- Public page metadata observed on 2026-07-15 showed `0.1.0-rc.34`,
  updated 2026-07-12, 17 users, and 14 languages.
- Chrome Web Store API status observed on 2026-07-15 showed manifest version
  `0.1.0.36` published at 100% and manifest version `0.2.0.1` submitted with
  state `PENDING_REVIEW`.
- Local source for that submission is `0.2.0-rc.1`; it remains a review
  candidate until the submitted revision is approved and published.

This means the project has crossed the public-store baseline milestone. Future
store uploads should be treated as resubmissions from an already-published
extension, not as a first submission. Public listing metadata can lag the
Chrome Web Store API state; submitted candidates must not be described as
published until the API reports the submitted revision as published.

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
- bounded normalized Codex usage-history summaries when the signed-in Codex
  Analytics page exposes the verified structured responses
- bounded normalized Cursor billing-cycle summaries and aggregate usage history
  when the signed-in Cursor Usage and Spending pages expose the verified
  structured responses
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

- If a later release candidate is submitted, update this file after the public
  listing metadata propagates.
- Keep the current public copy in `Doc/Store/` as the maintained text source.
- Keep personal upload operations and generated screenshot working files under
  `.local/`.
