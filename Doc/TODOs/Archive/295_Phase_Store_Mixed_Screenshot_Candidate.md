# Phase 295 - Store Mixed Screenshot Candidate

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Record the user's store screenshot decision after the `0.1.0-rc.11` RDP Chrome
smoke pass and align maintained store docs around the accepted mixed candidate
pack.

## Completed Work

- Replaced the old product requirement that the first three final screenshots
  must all be native toolbar popup captures.
- Kept the first screenshot as a native toolbar popup quick-glance capture.
- Accepted full-page dashboard, Codex provider detail, Cursor source-boundary,
  and optional Settings-depth images as the rest of the store candidate pack.
- Updated maintained store docs:
  - `Doc/Store/Store_Screenshot_Storyboard.md`
  - `Doc/Store/Store_Screenshot_Selection_Pack.md`
  - `Doc/Store/Store_Listing_Copy_Pack.md`
  - `Doc/Store/Store_Listing_Localization_Source_Pack.md`
  - `Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md`
- Updated top-level README, TODOs, roadmap index, and phase index.

## Candidate Order

1. native toolbar popup quick glance showing Codex usage-window rings
2. full-page dashboard overview showing the product promise and summary cards
3. Codex provider usage detail showing remaining percentages and reset timing
4. Cursor source/settings detail showing the personal partial boundary
5. optional side-panel Settings/responsive setup view if a fifth listing image is
   useful

## Preserved Boundaries

- The chat screenshots are review context, not committed store assets.
- The candidate pack is not a formal store screenshot archive until the image
  files are saved and imported.
- The product still does not claim exact Cursor personal remaining included
  requests.
- Codex personal support remains window-scoped usage and reset timing, not one
  absolute plan-wide remaining balance.
- Provider closure remains account/product-decision gated for JetBrains, Claude
  personal, and Gemini project metrics.

## Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

Save the accepted screenshots as local files, then run the store screenshot
import/archive flow. After the archive lands, finish final screenshot ordering,
caption contract, listing-copy tightening, and the submission checklist.
