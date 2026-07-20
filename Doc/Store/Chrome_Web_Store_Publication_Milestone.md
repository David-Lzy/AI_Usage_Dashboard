# Chrome Web Store Publication Milestone

Date: 2026-07-21

Document class:

- public milestone

Freshness model:

- update when the public store listing, release candidate, or known blocking
  issue status changes

Status note:

- AI Usage Dashboard has a live Chrome Web Store listing
- Chrome Web Store API status shows manifest version `0.2.0.6` published at 100%
- source `0.2.0-rc.7` / manifest `0.2.0.7` is prepared for the next review submission
- no known critical user-facing bug is blocking normal use at this milestone
- private upload receipts, package hashes, screenshots-in-progress, and
  submission handoff notes stay in ignored `.local/` material

## Public Listing

- Chrome Web Store:
  https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- Public page status checked on 2026-07-21: reachable and listed.
- Chrome Web Store API status observed on 2026-07-21 showed manifest version
  `0.2.0.6` published at 100%.
- Source `0.2.0-rc.7` / manifest `0.2.0.7` is prepared for the next GitHub
  Release and Chrome Web Store review submission.

This means the project has crossed the public-store baseline milestone. Future
store uploads are resubmissions from an already-published extension, not first
submissions. Public listing metadata can lag the Chrome Web Store API state;
release candidates must not be described as submitted or published until the
API reports the candidate's real state.

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
