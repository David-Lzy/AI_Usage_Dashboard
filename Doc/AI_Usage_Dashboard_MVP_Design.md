# AI Usage Dashboard MVP Design

Date: 2026-04-20

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical design baseline

Status note:

- this file records the original MVP framing from `2026-04-20`
- current shipped product truth should be taken from [README.md](../README.md), current roadmap directions, and the latest numbered phase closeouts rather than from this baseline alone

## 1. Goal

Build a Chrome extension that gives one unified view of AI coding tool usage and quota status.

The MVP focuses on:

- current plan
- used / remaining quota
- next reset time
- last sync result
- warning state

Initial providers:

- Codex
- Claude Code
- Cursor
- Gemini Code Assist / Gemini CLI
- JetBrains AI

## 2. Non-Goals

The first version does not try to:

- buy, upgrade, or cancel subscriptions
- automate provider-side account management
- support every AI tool on day one
- guarantee 100% background sync without provider cooperation
- bypass provider authentication or security controls

## 3. Product Positioning

This product is not another coding assistant. It is a quota and usage dashboard for people who use multiple AI coding tools and want one place to check limits, refresh windows, and recent sync health.

The core product value is:

- fewer context switches across vendor dashboards
- clearer understanding of mixed quota models
- earlier warning before hitting a limit

## 4. Data Ingestion Strategy

The product should be designed around two data paths.

### 4.1 Path A: Official Source First

Use official APIs, official billing endpoints, official account pages, or first-party JSON data when the provider exposes stable usage information.

Advantages:

- more stable
- easier to normalize
- less DOM breakage risk
- better for long-term maintenance

### 4.2 Path B: Logged-In Web Parsing as Fallback

If a provider does not expose a stable official usage API, allow the extension to read the already logged-in provider page and parse usage information through site-specific adapters.

Constraints:

- host access must be requested explicitly
- parsing logic must be isolated per provider
- failures must degrade cleanly to "sync failed" instead of corrupting data

### 4.3 Adapter Rule

Every provider adapter must expose the same normalized output, regardless of whether its source is API-based or page-based.

### 4.4 Post-RC Hybrid Source Rule

The post-release-candidate expansion track should treat provider sources as one of three product-level kinds:

- `official_api`
- `session_page`
- `policy_only`

Meaning:

- `official_api`: the extension talks to a documented API or analytics endpoint with explicit credentials
- `session_page`: the extension reads a logged-in official usage page inside the browser context
- `policy_only`: the extension only shows documented quota policy, not live usage

Security rule:

- do not persist raw cookies in extension storage
- do not ask the user to manually copy cookies or auth headers
- when a page-backed source is needed, use host permission plus page-context extraction inside the already logged-in tab

Design consequence:

- the runtime sync label may still render as `official` or `page_parse`
- the product contract should use the higher-level source kind above when planning provider support and fallback order

## 5. MVP Scope

### 5.1 Must Have

- side panel dashboard
- provider cards
- manual refresh per provider
- global refresh
- local cache
- scheduled refresh
- status and error display
- reset time display
- warning thresholds

### 5.2 Should Have

- provider connect / disconnect
- optional host permission flow
- sync logs for the last few runs
- stale data badge

### 5.3 Can Wait

- charts
- multi-profile account switching
- import / export
- Chrome Web Store packaging workflow
- Firefox / Edge adaptation

## 6. UI Structure

The UI should use a persistent Chrome side panel as the main entry point.

### 6.1 Design System Direction

The UI direction should follow Google Material Design 3.

Recommended implementation principles:

- use Material Design 3 for layout, component roles, motion, and states
- use Material theming through design tokens instead of ad-hoc color values
- use Material color, typography, and shape roles as the base visual system
- keep the UI compact enough for a Chrome side panel, rather than copying mobile spacing literally
- avoid mixing another unrelated design system into the same UI

Recommended Material component mapping for the MVP:

- top app bar for the side panel header
- cards for provider summaries
- badges or assist chips for status labels
- linear progress for usage ratio
- list rows for settings and provider facts
- dialogs for permission requests and disconnect confirmation
- snackbars for transient sync feedback

### 6.2 Main Layout

1. Top bar
   - app name
   - global refresh button
   - settings button

2. Summary strip
   - connected provider count
   - providers in warning state
   - providers with failed sync

3. Provider list
   - one card per provider
   - sorted by warning severity, then next reset time

4. Provider detail view
   - opens inside the side panel route or inline expanded card
   - shows raw sync metadata and adapter source

5. Settings view
   - sync interval
   - warning thresholds
   - provider enable / disable
   - host permission status

### 6.3 Provider Card Fields

Each provider card should display:

- provider name
- current plan
- quota model
- used value
- remaining value
- reset time
- last sync time
- sync source: `official` or `page_parse`
- status: `ok`, `warning`, `error`, `stale`, `disconnected`

### 6.4 Visual Priority

The UI should prioritize clarity over density.

Recommended signal order:

1. status color
2. remaining quota
3. reset time
4. sync freshness

### 6.5 Material Theming Rules

The side panel should use Material theming tokens as the base styling contract.

Theme rules:

- define color roles through Material system color tokens
- define typography through Material type scale roles
- define corner radius through Material shape tokens
- keep provider cards and controls visually consistent through shared tokens
- support both light and dark theme later, but build light mode first unless the extension environment already requires dark mode support

Implementation note:

- on the web, Material theming can be expressed through CSS custom properties mapped to Material tokens

## 7. Normalized Data Model

Use one normalized model so the rest of the extension does not care how each provider was read.

```ts
export type ProviderId =
  | "codex"
  | "claude_code"
  | "cursor"
  | "gemini"
  | "jetbrains";

export type QuotaUnit =
  | "requests"
  | "credits"
  | "usd"
  | "tokens"
  | "unknown";

export type QuotaWindow =
  | "daily"
  | "weekly"
  | "monthly"
  | "rolling"
  | "custom"
  | "unknown";

export type SyncSource =
  | "official"
  | "page_parse"
  | "manual"
  | "unknown";

export type ProviderSourceKind =
  | "official_api"
  | "session_page"
  | "policy_only";

export type SyncStatus =
  | "ok"
  | "warning"
  | "error"
  | "stale"
  | "disconnected";

export interface UsageSnapshot {
  providerId: ProviderId;
  providerLabel: string;
  planName: string | null;
  quotaUnit: QuotaUnit;
  quotaWindow: QuotaWindow;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  syncedAt: string;
  syncSource: SyncSource;
  syncStatus: SyncStatus;
  warningThreshold: number | null;
  warningReason: string | null;
  staleAfterSeconds: number;
  rawSummary: string | null;
}

export interface SyncResult {
  providerId: ProviderId;
  ok: boolean;
  snapshot: UsageSnapshot | null;
  errorCode: string | null;
  errorMessage: string | null;
  fetchedAt: string;
}

export interface ProviderConfig {
  providerId: ProviderId;
  enabled: boolean;
  preferredSyncSource: "official_first" | "page_first";
  warningThresholdPercent: number;
  syncIntervalMinutes: number;
  hostsGranted: string[];
}
```

### 7.1 Field Fidelity Rule

Not every source can expose the same confidence level for every field.

For post-RC provider work, track each important field as one of:

- `exact`
- `window_only`
- `analytics_only`
- `documented_policy`
- `unavailable`

Interpretation:

- `exact`: the page or API exposes a real numeric value for this account scope
- `window_only`: the source exposes a reset window or status, but not an exact remaining count
- `analytics_only`: the source exposes measured activity, but not quota remaining
- `documented_policy`: the source is product documentation, not live account usage
- `unavailable`: the field must remain `null` or otherwise clearly unsupported

Rule:

- never synthesize `remaining` from unrelated analytics values
- never present project metrics as personal quota without an explicit product note
- when fidelity is below `exact`, the UI must say so clearly

### 7.2 Hybrid Source Contract

For each provider, define:

- preferred source kind
- fallback order
- whether credentials are stored locally
- whether page-session access is required
- which fields are expected to be exact vs partial

Recommended post-RC provider direction:

- Codex:
  - shipped `official_api` for Enterprise analytics
  - planned `session_page` for personal users
- Cursor:
  - shipped `official_api` for team admins
  - planned `session_page` for personal users
- Claude Code:
  - shipped `official_api` for organization analytics
  - planned `session_page` for personal usage states if the page proves stable enough
- Gemini:
  - shipped `policy_only`
  - possible later `session_page` only if it can be labeled honestly as project metrics or true user quota

## 8. Provider Adapter Interface

```ts
export interface ProviderAdapter {
  id: ProviderId;
  label: string;
  supportsOfficial: boolean;
  supportsPageParse: boolean;
  requiredHosts: string[];
  sync(): Promise<SyncResult>;
}
```

Implementation rule:

- adapter code parses provider-specific data
- adapter code never writes UI state directly
- adapter output must always be normalized before storage

## 9. Storage Model

Use `chrome.storage.local` for MVP.

Suggested keys:

```ts
type StorageShape = {
  providerConfigs: Record<ProviderId, ProviderConfig>;
  usageSnapshots: Record<ProviderId, UsageSnapshot>;
  syncResults: Record<ProviderId, SyncResult>;
  appSettings: {
    defaultSyncIntervalMinutes: number;
    staleAfterMinutes: number;
    showDisconnectedProviders: boolean;
  };
};
```

Why `local` first:

- simpler than `sync`
- more room for cached payloads and debug metadata
- avoids cross-device synchronization complexity in MVP

## 10. Sync Design

### 10.1 Manual Sync

- user clicks global refresh
- background service worker runs enabled adapters
- writes normalized result into storage

### 10.2 Scheduled Sync

Use `chrome.alarms` for periodic sync.

Recommended MVP interval:

- default: every 30 minutes
- allow per-provider override later

### 10.3 Staleness Rule

If `now - syncedAt > staleAfterSeconds`, mark the snapshot as `stale`.

### 10.4 Error Handling

Do not remove the last good snapshot on sync failure.

Instead:

- keep last successful snapshot
- store the newest failed sync result
- show the UI badge as `error` or `stale`

## 11. Manifest Strategy

Design the manifest around minimum required permissions.

### 11.1 Required Permissions

These should be present in the base manifest:

- `storage`
- `alarms`
- `sidePanel`

Reason:

- `storage` for local state
- `alarms` for scheduled refresh
- `sidePanel` for the main UI

### 11.2 Optional Permissions

Only request when the user enables a provider feature that needs them:

- `scripting`

Reason:

- only needed if the extension injects scripts dynamically or registers dynamic content scripts

### 11.3 Optional Host Permissions

Request per provider, not globally.

Example groups:

- Codex related domains
- Claude related domains
- Cursor related domains
- Gemini related domains
- JetBrains related domains

Do not request `https://*/*` in MVP unless a provider truly requires unknown runtime hosts.

### 11.4 Base Manifest Draft

```json
{
  "manifest_version": 3,
  "name": "AI Usage Dashboard",
  "version": "0.1.0",
  "description": "Unified quota dashboard for AI coding tools.",
  "permissions": ["storage", "alarms", "sidePanel"],
  "optional_permissions": ["scripting"],
  "optional_host_permissions": [
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://cursor.com/*",
    "https://www.cursor.com/*",
    "https://developers.google.com/*",
    "https://gemini.google.com/*",
    "https://www.jetbrains.com/*",
    "https://account.jetbrains.com/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"
  },
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "action": {
    "default_title": "AI Usage Dashboard"
  }
}
```

Note:

- the exact host list should be narrowed further during real implementation
- if a provider later exposes an official API on a different host, add only that host

## 12. Technical Stack

Recommended first version:

- Node.js 22+
- TypeScript
- React
- Vite
- `@crxjs/vite-plugin` for Chrome extension packaging
- Material Design 3 as the design system
- Material theming with CSS custom properties
- selective use of Material Web patterns and component behaviors where practical
- background service worker in plain TS
- `zod` for runtime validation of adapter outputs

Why this stack:

- fast setup
- good typing across adapters and UI
- easy split between side panel and background worker
- low lock-in
- aligns the extension UI with Google Material Design
- keeps theming token-based instead of hardcoding visual values
- keeps the extension build pipeline compatible with MV3 packaging

## 13. First Version File Tree

```text
AI_Usage_Dashboard/
  .nvmrc
  .gitignore
  Doc/
    AI_Usage_Dashboard_MVP_Design.md
    AI_Usage_Dashboard_TODOs.md
    Development_Guardrails.md
    TODOs/
      00_Phase_Index.md
  public/
    icons/
      icon-16.png
      icon-32.png
      icon-48.png
      icon-128.png
  src/
    manifest.json
    background/
      service-worker.ts
      alarms.ts
      sync-engine.ts
      message-bus.ts
    sidepanel/
      index.html
      main.tsx
      App.tsx
      theme/
        material-theme.css
        tokens.css
      routes/
        DashboardPage.tsx
        ProviderDetailPage.tsx
        SettingsPage.tsx
      components/
        TopBar.tsx
        SummaryStrip.tsx
        ProviderCard.tsx
        StatusBadge.tsx
        UsageProgress.tsx
    providers/
      types.ts
      registry.ts
      normalize.ts
      codex/
        adapter.ts
        official.ts
        page-parse.ts
      claude-code/
        adapter.ts
        official.ts
        page-parse.ts
      cursor/
        adapter.ts
        official.ts
        page-parse.ts
      gemini/
        adapter.ts
        official.ts
        page-parse.ts
      jetbrains/
        adapter.ts
        official.ts
        page-parse.ts
    content/
      bridge.ts
      parsers/
        codex.ts
        claude-code.ts
        cursor.ts
        gemini.ts
        jetbrains.ts
    shared/
      chrome.ts
      storage.ts
      time.ts
      logger.ts
      validation.ts
      constants.ts
  package.json
  tsconfig.json
  vite.config.ts
```

## 14. Provider Rollout Recommendation

Do not start with all five providers at once.

Recommended build order:

1. Cursor
2. JetBrains AI
3. Gemini
4. Claude Code
5. Codex

Reason:

- this reduces parallel uncertainty
- adapter design can stabilize on earlier providers
- later providers can reuse the normalized model

The exact order can change once actual provider pages and endpoints are inspected.

## 15. Engineering Rules

- keep provider-specific logic out of UI files
- one adapter per provider
- never mix normalized data with raw parsed DOM data
- store timestamps as ISO 8601 strings
- do not block UI on a failing provider
- request permissions lazily and per feature
- prefer official sources before DOM parsing

## 16. Risks

### 16.1 Provider Instability

Provider billing pages and usage layouts may change without notice.

Mitigation:

- isolate page parsing code
- keep parsers small
- version error messages by provider

### 16.2 Permission Friction

Too many requested hosts will hurt user trust.

Mitigation:

- use `optional_host_permissions`
- explain why access is needed before requesting it

### 16.3 Incomplete Data

Some providers may expose plan information but not exact remaining quota.

Mitigation:

- allow partial snapshots
- explicitly show unknown fields as unknown, not zero

## 17. MVP Milestones

### Milestone 1

- project scaffold
- side panel shell
- storage wiring
- fake provider data

### Milestone 2

- adapter registry
- sync engine
- alarms-based refresh
- one real provider

### Milestone 3

- optional permission flow
- provider detail page
- error and stale states
- two to three real providers

## 18. Reference Notes

This design assumes current Chrome extension capabilities as of 2026-04-20:

- MV3 manifest format:
  https://developer.chrome.com/docs/extensions/mv3/manifest
- Side Panel API:
  https://developer.chrome.com/docs/extensions/reference/sidePanel/
- Storage API:
  https://developer.chrome.com/docs/extensions/reference/api/storage
- Alarms API:
  https://developer.chrome.com/docs/extensions/reference/api/alarms
- Permissions API:
  https://developer.chrome.com/docs/extensions/reference/api/permissions
- Content scripts:
  https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Cross-origin network requests:
  https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
- Scripting API:
  https://developer.chrome.com/docs/extensions/reference/scripting/
- Material Design 3:
  https://m3.material.io/
- Material Web theming:
  https://material-web.dev/theming/material-theming/

## 19. Recommended Next Step

The next implementation step should be:

1. scaffold the project with `TypeScript + React + Vite`
2. add a minimal `manifest.json`
3. establish the Material Design 3 token and theme foundation
4. implement the provider adapter contract before integrating any real provider
