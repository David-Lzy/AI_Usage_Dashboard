# Phase 41.1 Real Chrome Runtime Parity Report

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Scope

- audit the active real Chrome operator profile before the final mixed-source release gate
- capture one successful live session-page path and one blocked session-page path
- turn the current operator-profile findings into repeatable verification inputs instead of one-off shell notes

## Environment

- local desktop session: `DISPLAY=:10`
- browser: `Google Chrome 147.0.7727.101`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- unpacked extension path: `/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/dist`
- built manifest on disk: `0.1.0.1` / `0.1.0-rc.1`

## Automated Profile Audit

Command:

- `npx -y node@22 ./scripts/phase41-profile-audit.mjs`

Key findings from the generated audit:

- the active Chrome profile points at the expected unpacked `dist/` directory
- the installed extension runtime reports `open_side_panel_on_icon_click: true`
- current active host access in the operator profile is limited to:
  - `https://api.chatgpt.com/*`
  - `https://chatgpt.com/*`
- current granted host access in the operator profile is:
  - `https://api.chatgpt.com/*`
  - `https://api.cursor.com/*`
  - `https://chatgpt.com/*`
- current stored extension `app-state` still lacks persisted `sourcePreference` and `pageBinding` fields for every provider entry in this long-lived profile snapshot
- current stored provider visibility in the operator profile is:
  - `Cursor`: enabled
  - `JetBrains AI`: enabled
  - `Claude Code`: hidden
  - `Gemini Code Assist`: hidden
  - `Codex`: enabled

Interpretation:

- this profile is usable for real-Chrome evidence gathering, but it is not yet a clean or parity-confirmed final release gate baseline

## Live Chrome Evidence

### 1. Permission And Readiness Cards

The real side-panel Settings view showed the current readiness split clearly:

- `JetBrains AI`: `Host access missing`
- `Claude Code`: `Host access missing`
- `Gemini Code Assist`: `No host access required`
- `Codex`: `Host access granted`

Evidence:

- `/tmp/phase41-settings-scrolled-lower.png`

### 2. Cursor Personal Session-Page Blocker

The dedicated real-Chrome debug page rendered successfully:

- `chrome-extension://gkjioiklbdjcknhdglaehbeofkjmmdpc/src/sidepanel/index.html#debug-capture-cursor`

When the capture action was triggered in the live Chrome window, the page failed with:

- `Only permissions specified in the manifest may be requested.`

Evidence:

- `/tmp/phase41-debug-capture-cursor-page2.png`
- `/tmp/phase41-cursor-capture-after-enter.png`

Assessment:

- the final mixed-source gate is currently blocked on Cursor session-page verification in this operator profile
- this report does not claim that the repo manifest is missing `cursor.com`; it records that the active real-Chrome runtime could not request that host successfully during the audit pass

### 3. Codex Personal Session-Page Success Path

The dedicated real-Chrome debug page rendered successfully:

- `chrome-extension://gkjioiklbdjcknhdglaehbeofkjmmdpc/src/sidepanel/index.html#debug-capture-codex`

When the capture action was triggered in the live Chrome window, the page succeeded and copied a redacted JSON fixture to the system clipboard.

Captured fixture highlights:

- matched route: `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- matched title: `Codex`
- extraction mode: `dom`
- visible usage snippets included:
  - `93%`
  - `97%`
  - `重置时间：2026年4月23日 2:00`
  - `重置时间：2026年4月29日 4:00`

Evidence:

- `/tmp/phase41-debug-capture-codex-page.png`
- `/tmp/phase41-codex-capture-after-enter.png`

### 4. Session History Inventory

The active Chrome session files still contain live route evidence for:

- `https://cursor.com/cn/dashboard/usage`
- `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- `chrome-extension://gkjioiklbdjcknhdglaehbeofkjmmdpc/src/sidepanel/index.html#debug-capture-cursor`
- `chrome-extension://gkjioiklbdjcknhdglaehbeofkjmmdpc/src/sidepanel/index.html#debug-capture-codex`

This confirms that the operator profile does have the expected live vendor tabs available; the current blocker is not simply "no matching page was open."

## Gate Result

Current `Phase 41` release-gate result:

- `blocked`

Why blocked:

- `Codex` personal session-page capture succeeded in real Chrome
- the current operator profile still fails the `Cursor` session-page permission-and-capture path, so the mixed-source gate is not yet authoritative enough to clear release packaging
- the current profile also carries legacy stored app-state shape without persisted `sourcePreference` and `pageBinding`, which increases ambiguity during release verification

## Follow-Up

- use [41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md](../TODOs/Archive/41_2_Phase_Final_Mixed_Source_Real_Chrome_Pass.md) for the remaining parity-aligned final pass
- rerun the live Chrome gate only after the unpacked extension runtime has been explicitly refreshed on the operator profile
- repeat the Cursor debug-capture check and require that it no longer fails with the manifest-permission error before clearing `Phase 42`
