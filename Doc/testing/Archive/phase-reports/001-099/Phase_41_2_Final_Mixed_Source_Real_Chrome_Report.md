# Phase 41.2 Final Mixed-Source Real Chrome Report

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Scope

- rerun the final mixed-source real-Chrome gate after the `Phase 41.1` runtime-parity audit
- verify that the long-lived operator Chrome profile can still run the current unpacked `dist/` build for the shipped personal session-page paths
- record the remaining concrete blocker, if any, before `Phase 42`

## Environment

- local desktop session: `DISPLAY=:10`
- browser: `Google Chrome 147.0.7727.101`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- unpacked extension path: `/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/dist`
- built manifest on disk: `0.1.0.1` / `0.1.0-rc.1`

## 1. Runtime-Parity Closure

The current `dist/` build was rebuilt on `2026-04-23` after two small operator-verification fixes:

- storage normalization now upgrades stale static provider metadata to the current sample schema
- the dedicated `Codex` and `Cursor` debug capture pages now write their live status into `document.title`

The operator Chrome profile was then cold-started again from the unpacked `dist/` path.

Observed restored window title:

- `Codex Capture | Idle - Google Chrome`

Interpretation:

- this title string did not exist in the earlier stale runtime from `Phase 41.1`
- the live operator profile was therefore serving the current rebuilt extension page, not the older capture page

Additional runtime-parity signal:

- the first post-cold-start `Cursor` capture attempt no longer failed with `Only permissions specified in the manifest may be requested.`
- instead, it reached the normal host-permission flow and returned `Cursor host access was not granted...`

Inference from the observed Chrome behavior:

- the active real-Chrome runtime was now accepting the shipped `https://cursor.com/*` optional host permission from the current unpacked build

## 2. Codex Personal Session-Page Pass

The restored `Codex` debug-capture tab was triggered again in real Chrome.

Observed window title after capture:

- `Codex Capture | OK | dom | https://chatgpt.com/codex/cloud/settings/analytics#usage - Google Chrome`

Assessment:

- the `Codex` personal session-page path passed again on the parity-aligned runtime
- the matched live route stayed `https://chatgpt.com/codex/cloud/settings/analytics#usage`

## 3. Cursor Personal Session-Page Pass

### 3.1 Permission Prompt

The first post-cold-start attempt produced:

- `Cursor Capture | Error | Cursor host access was not granted... - Google Chrome`

This showed that the path had moved past the old manifest/runtime blocker and into a normal Chrome permission decision.

After accepting the host-permission prompt in the live Chrome window, the `Cursor` capture route was retried.

### 3.2 Live Usage Tab

The live Cursor usage page was opened again and its active URL was verified by setting the page title to `location.href`.

Observed page title:

- `cursor.com/cn/dashboard/usage - Google Chrome`

### 3.3 Capture Result

The retried debug capture then produced:

- `Cursor Capture | OK | dom | https://cursor.com/cn/dashboard/usage - Google Chrome`

The redacted clipboard fixture confirmed:

- `matchedUrl`: `https://cursor.com/cn/dashboard/usage`
- `chosenRoute`: `https://cursor.com/cn/dashboard/usage`
- `chosenSurface`: `dom`

Assessment:

- the `Cursor` personal session-page path now passes in real Chrome on the parity-aligned runtime
- the concrete `Phase 41.1` blocker is resolved

## 4. JetBrains Session-Page Probe

The current operator profile still does not expose a usable JetBrains organization-session target for the shipped `Users and licensing` path.

Official-doc recheck on `2026-04-23`:

- JetBrains help still documents `Users and licensing` under the logged-in Console on `account.jetbrains.com`
- this rerun found no stronger official evidence that the shipped host or product surface has moved away from that Console domain
- the remaining blocker therefore still looks account-scope, not route-selection drift

A dedicated real-Chrome debug route is now available for future operator verification:

- `chrome-extension://gkjioiklbdjcknhdglaehbeofkjmmdpc/src/sidepanel/index.html#debug-capture-jetbrains`

Direct live probe:

- opened `https://account.jetbrains.com/organization/ai/users-and-licensing`
- observed title `JetBrains Account :: Error 400: Bad Request - Google Chrome`

Dedicated debug-route probe:

- granted JetBrains host access from the new debug page
- observed title `JetBrains Capture | Error | Open the JetBrains Console Users and licensing page in a browser tab, then refresh again... - Google Chrome`

Evidence:

- `/tmp/phase41-jetbrains-debug-open-page-required.png`

Assessment:

- this profile still lacks a usable live JetBrains org-session page for the final mixed-source gate
- the runtime JetBrains client now also classifies an explicit `Error 400: Bad Request` org page as `access_unavailable` in tests, so the remaining work is no longer "how to describe the blocker" but "obtain a usable org session or narrow scope"
- the remaining `Phase 41.2` blocker is now a concrete provider-session availability issue, not a runtime-parity ambiguity

## 5. Official Credential-Backed Providers

The current operator profile still does not carry the admin credentials required for the shipped official API paths:

- `Cursor` team Admin API
- `Claude Code` admin analytics API
- `Codex` Enterprise analytics API

`npx -y node@22 ./scripts/phase41-profile-audit.mjs` still reports readable missing-credential or missing-host states for those paths instead of a runtime crash.

Assessment:

- this rerun did not reveal a new regression on the official-provider slice
- this profile also did not convert those providers into configured success paths, so they remain non-clearing signals for release packaging

## Gate Result

Current `Phase 41.2` release-gate result:

- `clear for the narrowed RC scope selected on 2026-04-23`

Why clear for the narrowed RC:

- real-Chrome runtime parity ambiguity is now cleared
- `Codex` personal session-page capture passes on the rebuilt unpacked runtime
- `Cursor` personal session-page capture also passes on the rebuilt unpacked runtime, including the real `cursor.com` host-permission prompt
- the remaining concrete JetBrains blocker is now handled by scope: JetBrains is retained in the repo, but it is deferred from the active RC promise until a real org-visible Console session is reverified

## Next Step

- move into `Phase 42` packaging and release-doc closeout for the narrowed RC scope
- keep the retained JetBrains path behind a later verification pass before it re-enters the active release promise
