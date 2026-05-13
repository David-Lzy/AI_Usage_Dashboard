# Phase 202 - Codex Usage Context Extension Mode Review

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Verify the Codex personal multi-window and flex-credit balance path inside a real unpacked-extension runtime, not just parser and adapter unit tests.

## Why This Phase Exists

`Phase 200` and `Phase 201` added Codex personal usage-window and balance-card surfacing. This phase proves that the extension can capture the current page shape through Chrome tab inspection, preserve positional repeated percentages, keep a `0` balance value, and render the normalized result across dashboard, provider detail, and a Codex-focused popup.

## What Changed

- Added `npm run phase202:review` as a repeatable Playwright Chromium unpacked-extension review.
- Added a synthetic `https://chatgpt.com/codex/cloud/settings/analytics#usage` route in the temporary browser profile.
- Verified `chrome.runtime.sendMessage({ type: "app:request-refresh", providerId: "codex" })` returns a `page_parse` Codex snapshot with four visible windows and one flex-credit balance.
- Verified dashboard, provider detail, and Codex-focused popup surfaces show the weekly usage window and balance summary.
- Fixed Codex DOM capture so repeated percentage snippets are preserved instead of de-duplicated.
- Fixed Codex DOM capture so single-character numeric snippets such as `0` are retained for balance cards.
- Added capture regression coverage for repeated `100%` windows and `余额额度 0`.

## Preserved Boundaries

- The review uses a synthetic logged-in Codex page in an unpacked-extension runtime, not the user's live authenticated ChatGPT session.
- The popup assertion intentionally focuses the temporary profile on Codex so the compact featured-provider contract can show the healthy Codex card.
- The primary dashboard quota still comes from the most constrained visible percentage window.
- The flex-credit balance remains supplemental context, not one absolute plan-wide Codex quota.
- Provider coverage gaps still exist for providers that do not expose stable personal remaining-quota pages.
- No store screenshot package, operator request, or archive schema changed.

## Artifacts

- `scripts/phase202-codex-usage-context-extension-review.mjs`
- `tmp/phase202-codex-usage-context-extension-review/dashboard-codex-usage-context.png`
- `tmp/phase202-codex-usage-context-extension-review/provider-detail-codex-usage-context.png`
- `tmp/phase202-codex-usage-context-extension-review/popup-codex-usage-context.png`
- `tmp/phase202-codex-usage-context-extension-review/phase202-results.json`

## Verification

- `npm run test -- --run src/providers/codex/personal-page-capture.test.ts src/providers/codex/personal-page-parser.test.ts src/providers/codex/adapter.test.ts`
- `npm run build`
- `npm run phase202:review`

## Follow-Up

Keep the next slice functionality-first. The best next work is either another live provider-source hardening slice, preferably Cursor personal display parity, or a small Codex live-session operator pass if the authenticated page is available again.
