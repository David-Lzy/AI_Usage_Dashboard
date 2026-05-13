# Phase 232 - Codex Automatic Managed Page Sync

Date: 2026-05-02

Document class:

- closed evidence

## Goal

Remove the extra operator refresh/page-open step for Codex personal usage sync after host access is granted, while staying inside Chrome extension page-session boundaries.

## Why This Phase Exists

Phase 230 allowed Codex scheduled sync to reopen the analytics page only after a previous page-binding fingerprint existed. That still left a bad first-run path: the user could grant ChatGPT/Codex host access, but the next background alarm would still report that the Codex page needed to be opened manually. The periodic alarm also waited the full configured interval before its first scheduled sync.

## What Changed

- Created a v2 periodic sync alarm that first fires after `1` minute, then repeats at the configured interval with the existing 15-minute lower bound.
- Clears the legacy periodic alarm name so older unpacked-extension sessions do not keep waiting on the old full-interval first delay.
- Allows Codex `auto` and `session_page` sources to create an inactive managed analytics tab during manual or alarm sync even before a saved page binding exists.
- Preserves the existing `bootstrap` guard so extension startup does not open ChatGPT tabs without a refresh/alarm event.
- Preserves the logged-out guard so repeated alarms do not keep opening ChatGPT after a logged-out page-session diagnostic is recorded.

## Boundary

This is automatic Codex managed-page sync, not a fully hidden offscreen scrape. The personal Codex path still needs a real Chrome tab document because the extension reads an authenticated ChatGPT page through `chrome.scripting`. The managed tab is created inactive, and unmatched or logged-out first-run attempts are closed.

## Verification

- `npm run phase232:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the real RDP Chrome profile to confirm that a granted Codex source can refresh from an alarm-created inactive managed tab, and that an expired login produces the existing user-visible login prompt without repeated alarm-created tabs.
