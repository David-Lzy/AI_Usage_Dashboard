# Phase 111 - Custom Seed Extension-Mode Recovered-State Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed QA into one more honest runtime layer:

- prove the saved custom seed survives a real MV3 extension runtime instead of only preview-mode storage
- prove the shipped Cursor and Codex session-page paths recover from `host_access_missing` warning treatments back to neutral healthy treatments inside extension mode
- prove action badge, settings permission prompts, dashboard, popup, and provider detail all agree on that recovered state
- keep the claim narrow by using synthetic vendor tabs plus pre-granted optional host origins instead of pretending native permission prompts or live vendor sessions were exercised

## What Shipped

- new repeatable review script:
  - `scripts/phase111-custom-seed-extension-mode-recovered-state-review.mjs`
- new npm entry:
  - `npm run phase111:review`
- machine-readable artifacts:
  - `tmp/phase111-custom-seed-extension-mode-recovered-state-review/phase111-results.json`
- ordered screenshots per mode and scenario:
  - `settings.png`
  - `dashboard.png`
  - `popup.png`
  - `cursor-detail.png`
  - `codex-detail.png`

## Assertions Covered

The extension-mode recovered-state review currently covers two explicit theme modes:

- `light`
- `dark`

For both modes, the review keeps the same saved custom seed:

- `#4F46E5`

The review uses one temporary persistent Chromium profile per scenario:

- `degraded`
  - no pre-granted optional host permissions
- `recovered`
  - optional host permissions pre-seeded into the Chromium profile preferences for:
    - `https://api.cursor.com/*`
    - `https://cursor.com/*`
    - `https://api.chatgpt.com/*`
    - `https://chatgpt.com/*`
  - synthetic logged-in vendor tabs fulfilled at:
    - `https://cursor.com/dashboard/usage`
    - `https://chatgpt.com/codex/cloud/settings/analytics#usage`

This is intentionally narrower than a native operator GUI pass:

- it uses the real unpacked extension from `dist/`
- it uses the real MV3 runtime, service worker, `chrome.permissions`, `chrome.tabs`, `chrome.scripting`, `chrome.action`, and `chrome.storage.local`
- it does not claim a native host-permission prompt was completed in headless Chromium
- it does not claim a real live vendor session was used

The review proves:

- degraded and recovered scenarios keep the same:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
  - `primary`
  - `tertiary`
- degraded extension-mode permission state is truthful:
  - `chrome.permissions.contains(...)` is `false` for both shipped session-page providers
  - Settings permission prompts show `Host access missing`
  - action buttons show `Request access`
- recovered extension-mode permission state is truthful:
  - `chrome.permissions.contains(...)` is `true` for both shipped session-page providers
  - Settings permission prompts show `Host access granted`
  - action buttons show `Remove access`
- degraded action badge is truthful:
  - badge text is `2`
  - badge title says `2 visible providers need attention`
- recovered action badge is truthful:
  - badge text is cleared
  - badge title says all visible providers are healthy
- degraded dashboard surfaces use warning treatments for both shipped session-page providers
- recovered dashboard surfaces return to neutral healthy treatments for both shipped session-page providers
- recovered dashboard values prove the extension actually parsed the synthetic session-page DOM:
  - `Cursor` reset label becomes `Usage per day across this billing period`
  - `Cursor` detail reset time becomes `Apr 1 - Apr 30`
  - `Codex` plan becomes `Codex Personal Usage Page (5-hour usage window)`
  - `Codex` usage becomes `3% used · 97% remaining`
  - `Codex` reset label becomes `5-hour usage window resets at 2026-04-23 19:45`
- degraded popup snapshot status is warning `Mixed state`
- recovered popup snapshot status is neutral `Aligned`
- popup featured-provider ordering stays deterministic:
  - `Codex` remains the first featured provider in both degraded and recovered scenarios
- degraded provider-detail pages show:
  - warning sync-status chip
  - `Access status` note
  - `Source state` note
- recovered provider-detail pages remove those blocker notes and return to neutral healthy sync-status chips

## Verification

The following commands passed after `Phase 111` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase110-custom-seed-preview-interaction-recovery-review.mjs
npx -y node@22 ./scripts/phase111-custom-seed-extension-mode-recovered-state-review.mjs
curl -I http://127.0.0.1:4173/src/sidepanel/index.html
curl -I http://127.0.0.1:4173/src/popup/index.html
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- preview-interaction recovered-state custom-seed review passed
- extension-mode recovered-state custom-seed review passed
- preview `sidepanel` and `popup` both returned `200 OK`

Observed extension-mode recovered-state results for `#4F46E5`:

- `light`
  - degraded badge: `2`
  - recovered badge: cleared
  - degraded popup snapshot: `Mixed state`
  - recovered popup snapshot: `Aligned`
  - recovered `Cursor` detail reset time: `Apr 1 - Apr 30`
  - recovered `Codex` detail used value: `3% used · 97% remaining`
  - recovered `primary`: `#4F46E5`
  - recovered `tertiary`: `#C47AC5`
- `dark`
  - degraded badge: `2`
  - recovered badge: cleared
  - degraded popup snapshot: `Mixed state`
  - recovered popup snapshot: `Aligned`
  - recovered `Cursor` detail reset time: `Apr 1 - Apr 30`
  - recovered `Codex` detail used value: `3% used · 97% remaining`
  - recovered `primary`: `#9994F0`
  - recovered `tertiary`: `#DFB6DF`

## Follow-up

Recommended next theming slices:

1. decide whether one future review slice should cover native-prompt or real-operator extension-mode recovery beyond the now-shipped synthetic extension runtime proof
2. decide whether any remaining live provider-state transitions still need their own custom-seed QA slice before richer personalization work starts
3. continue rejecting arbitrary per-token editing until the native or operator extension-mode recovery story is stronger
