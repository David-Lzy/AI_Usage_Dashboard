# Provider Setup And Display Product Contract

Date: 2026-05-16

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the current product contract for separating provider setup entries, source permissions/credentials, dashboard visibility, provider ordering, and quota item controls
- use this document before changing Quick Setup, Provider Display, popup ordering, side panel ordering, full-page ordering, or per-provider quota item settings

## Purpose

Recent UI work made provider setup and provider display more configurable, but several concepts are now too easy to confuse:

- enabling or configuring a provider
- distinguishing personal-page, Team/API, and policy-only sources
- deciding whether it appears on dashboards
- deciding each surface's order
- deciding which quota progress items appear inside a visible provider card

This contract keeps those concerns separate so the product remains predictable.

## Definitions

### Configurable Provider

A configurable provider is a provider the extension knows how to guide or configure.

- Quick Setup may show configurable providers even when they are not currently dashboard-displayable.
- A configurable provider may be personal-web, Team/Enterprise API, policy-only, or deferred.
- Provider availability in Quick Setup is not proof that live quota data is shipped.

### Provider Brand And Source Entry

A provider brand is the vendor/product family, such as Cursor, Codex, Claude Code, Gemini Code Assist, or JetBrains AI.

A provider source entry is the concrete source-backed unit the UI can show or hide. Source entries are intentionally separate provider ids.

Current source-level provider entries:

- `cursor-personal-page`
- `cursor-team-api`
- `claude-code-team-page`
- `claude-code-admin-api`
- `codex-personal-page`
- `codex-enterprise-api`
- `gemini-policy`
- `jetbrains-org-page`

Each source entry has one fixed source family: personal page/session, Team/API credential, policy-only reference, or deferred organization page. New code should not use one brand-level provider row plus `sourcePreference` to switch between personal and API behavior.

### Static Provider Descriptor

Each source entry has one static descriptor in
`src/providers/provider-definitions.ts`. The descriptor keeps stable identity,
bootstrap display defaults, connection mode, runtime adapter ownership, and
implemented capability flags together. Runtime registration may consume this
metadata, but the descriptor must not import adapter implementations or create
another source-attempt path.

The runtime registry groups implementation functions by adapter owner, then
builds exactly one registry entry from each descriptor. A registry entry pairs
the descriptor with its sync function and rejects snapshot or setting ids that
do not match that source entry. Provider-specific parsing and normalization
remain inside the owner adapter; the registry only performs typed dispatch.

Source-entry adapters may pass an explicit ordered list of browser-native
strategies to the shared source-strategy orchestrator. The orchestrator owns
only bounded timeout, cancellation, in-flight coalescing, cooldown, backoff,
attempt diagnostics, and preservation of the previous valid result. It does
not choose a provider protocol, parse a provider response, cross source-entry
boundaries, start polling, or invoke a local companion. Strategy order and
truthful partial-data merge rules remain explicit in the owning adapter.

Personal Codex, Cursor, and Claude entries use this shared source-entry layer
for refresh coalescing, cooldown, timeout, and previous-result preservation.
Their provider-specific session API, observed-response, and page-hydration
sequence remains inside the existing bounded personal-page client so that
credential handling and request budgets are not duplicated by the registry.
Codex Enterprise, Cursor Team, and Claude Admin entries use the same
source-entry lifecycle around their existing official API clients. Gemini is
an explicit no-network policy adapter. JetBrains is an explicit no-network
deferred adapter until its retained page contract is revalidated.

Capability flags describe code the extension has implemented for that source
entry. They do not claim that the current account, response, or stored snapshot
contains matching data:

- `quotaWindows` means the adapter can normalize reset-bounded quota progress.
- `balances` means it can normalize a remaining balance or usage pool.
- `aggregateHistory` means it can normalize bounded multi-day aggregate data.
- `spending` means it can normalize currency-denominated spend or cost signals.
- `serviceStatus` means an independently verified official status contract is
  implemented.
- `multiAccount` means the source entry can keep more than one local account
  identity isolated. It never means that account quotas are combined.

Current capability ownership:

| Source entry | Adapter owner | Quota windows | Balances | Aggregate history | Spending | Service status | Multi-account |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cursor-personal-page` | Cursor | Yes | Yes | Yes | Yes | Yes | No |
| `cursor-team-api` | Cursor | No | No | No | Yes | Yes | No |
| `claude-code-team-page` | Claude Code | Yes | No | No | Yes | Yes | No |
| `claude-code-admin-api` | Claude Code | No | No | No | Yes | Yes | No |
| `codex-personal-page` | Codex | Yes | Yes | Yes | No | Yes | No |
| `codex-enterprise-api` | Codex | No | No | No | No | Yes | No |
| `gemini-policy` | Gemini | No | No | No | No | No | No |
| `jetbrains-org-page` | JetBrains | No | No | No | No | No | No |

Service status is a brand-level official status contract and remains separate
from Provider sync health. It is implemented for Cursor, Claude, and Codex
source entries. `multiAccount` is currently false for every source entry.
JetBrains remains deferred. Its parser and capture client are retained for
future contract revalidation, but the registered deferred adapter performs no
network or page capture and does not expose a live quota capability.

The storage and routing foundation for a future verified multi-account source
is account-separated even though no current descriptor enables it. Existing
users are assigned one deterministic local `default` account. Additional
accounts, when a future source contract opts in, use opaque locally generated
ids; the active account remains the only snapshot projected to popup, sidebar,
dashboard, and detail surfaces. Inactive snapshots, settings, credentials, and
last-success metadata remain isolated and are never summed. Automatic sync
targets only the active account, while inactive account refreshes must be
explicit and serialized per source entry. Configuration backup and Chrome Sync
exclude account runtime containers and credentials.

### Setup State

Setup state describes whether a source entry has enough user action, permission, credentials, or source binding to attempt a truthful sync.

Setup state is not the same as dashboard visibility.

Examples:

- a provider can be configured but hidden from dashboards
- a provider can need browser host access before it can sync
- a provider can be policy-only and have no live sync source
- a provider can be deferred and remain unavailable for display ordering

### Dashboard Display Visibility

Dashboard display visibility is the user's intent to show or hide a source entry on product surfaces.

The card-level `show in dashboard` control means:

- include this source entry in display surfaces when it is display-eligible
- allow surface order and quota item controls to manage it after eligibility is true

It does not mean:

- enable background sync
- grant browser access
- attach a page session
- create API credentials
- claim the provider has live quota data

### Display Eligibility

Display eligibility determines whether a provider may appear in dashboards, Provider Display settings, and quota item controls.

A provider may be display-eligible when it is one of:

- connected with truthful displayable status or quota data
- shipped as policy-only with useful display text and no stronger live-usage claim
- explicitly supported by a truthful fallback state such as a clear setup blocker or connection health state

A provider is not display-eligible when it is only a future/deferred source with no truthful product surface.

Display eligibility plus dashboard display visibility determines whether a provider enters surface ordering.

## Product Rules

### Quick Setup

- Quick Setup is the source-entry display and setup entry point.
- Quick Setup must not be hidden behind Advanced, Developer, or Debug display levels.
- Quick Setup should show personal/page/policy source entries by default.
- Team/Enterprise/API source entries should be available through an explicit "show Team/API providers" control so personal users are not overloaded.
- Each Quick Setup card's main display switch controls only `displayEnabled`.
- Hidden source entries must remain recoverable through Quick Setup.
- Missing personal-page permissions should prompt host access or opening the usage page.
- Popup and Settings first-run surfaces should show a focused host-access action
  when browser host permission is the blocker, and should not render stale
  quota progress as if the source were readable.
- Missing API credentials should point users to the matching API credential card instead of pretending the source is connected.

### Provider Display

Provider Display is the dashboard visibility, ordering, and quota-item configuration area.

- Provider order controls should list source entries that are display-enabled and display-eligible for the relevant surface.
- Quota item controls should be scoped to display-enabled and display-eligible source entries.
- Providers without renderable quota progress items should show a compact summary rather than expanded empty controls.
- Deferred providers should not appear in Provider Display ordering.
- Policy-only providers may appear only with policy-only wording and must not imply live remaining quota.
- Supported provider history modules are configured independently from quota
  progress items. Personal-usage history and turn trends can each be shown,
  hidden, and ordered per popup, sidebar, and full-page surface without changing
  provider enablement, provider order, or the stored source snapshot.
- Each history module has an independent 7-day or 1-month display range.
  Switching a module filters the normalized daily buckets locally and must
  update its visible dates, chart values, and range total together.

### Surface Order

Provider order is independent for:

- `popup`
- `sidebar`
- `fullPage`

Rules:

- saved order applies only after display eligibility and dashboard visibility are resolved
- hidden or ineligible providers do not occupy visible ordering slots
- newly eligible providers append after existing saved visible order
- surfaces with no custom order keep the default health/status order
- popup, sidebar, and full-page surfaces must consume the same provider list that Settings exposes for that surface

### Quota Item Visibility

Per-provider quota item visibility and order are independent for:

- `popup`
- `sidebar`
- `fullPage`

Rules:

- quota item ids are stable within a provider but are not a cross-provider contract
- unknown item ids are ignored at render time
- newly discovered item ids append after saved preferences
- normalized Codex Flex credit balances are default-hidden because they are a
  secondary value-only balance; users can enable and order them independently
  for popup, sidebar, and full-page surfaces
- usage facts, raw diagnostic bodies, provider evidence, and archive/export payloads stay source-truth data, not configurable progress bars
- hidden-provider quota item settings must not affect visible popup, sidebar, or full-page rendering

### Quota Pace Estimate

Quota pace is optional derived presentation data, not provider source truth.
The global advanced appearance preference is default-off, and the first
rollout is limited to Provider detail.

- Estimate only fresh percentage windows with a verified fixed duration, a
  valid future reset timestamp, and enough elapsed time for a meaningful
  comparison.
- Current eligible durations are five-hour and weekly windows, including their
  model-specific variants. Unknown or provider-policy windows are ineligible.
- A stale, expired, future, malformed, or newly started window must produce no
  estimate rather than a guessed value.
- Label every result as an estimate and keep the localized status separate from
  the provider's own quota name and reset timestamp.
- Compute pace only while rendering Provider detail. Do not persist it in a
  provider snapshot, raw evidence, diagnostics, configuration export, or Chrome
  Sync payload.
- Enabling pace must not add a request, timer, polling path, background task, or
  change to provider tone, warning thresholds, toolbar badges, or refresh
  behavior.

## Provider-Specific Boundaries

### Cursor

Cursor personal-page and Cursor Team/API entries are separate display units.
Cursor can be displayed only from truthful personal-dashboard or provider-source
states. Personal billing summaries must keep plan-included API value separate
from actual On-Demand charges, and the UI must not imply an exact plan-wide
remaining request balance when the source does not expose one. Billing and
aggregate-history modules may retain their last successful values independently;
a partial refresh must not replace a valid module with a fabricated zero.

### Codex

Codex personal-session and Codex Enterprise/API entries are separate display
units. The personal entry first uses the current local ChatGPT session's
internal structured usage responses, then falls back to the signed-in Codex
page and finally to the last successful snapshot. The internal endpoints are
not a supported public API. Codex can expose usage-window values and reset
timing when available; do not collapse separate usage windows into one fake
plan-wide balance. Session credentials are browser-session-only and must never
enter AppState, Chrome Sync, configuration backup, logs, fixtures, or provider
snapshots.

### Claude

Claude Personal and Claude Code Analytics Admin API entries are separate display
units. The personal entry uses the signed-in Claude Settings > Usage surface and
reports only verified source-visible plan windows, reset timing, and usage-credit
facts. The organization entry uses the Admin API and remains analytics-only; it
does not supply an individual subscription balance. The persisted personal
provider id remains `claude-code-team-page` for migration compatibility, but no
new UI or documentation should describe that source as Team-only. Max plan
labels are normalized when exposed, while the currently verified live personal
contract is a Pro account.

### Gemini Code Assist

Gemini remains policy-only unless the product explicitly accepts project-scoped metrics or another truthful source. Policy-only display must not promise live remaining usage.

### JetBrains AI

JetBrains remains retained in the repo but deferred from the active support promise until a real organization-visible `Users and licensing` session is reverified. Its current runtime adapter is explicitly no-network and clears obsolete live quota fields. Deferred JetBrains state must not enter Provider Display ordering or quota item controls.

## Non-Goals

- Do not rename or remove provider source-truth evidence fields.
- Do not reintroduce brand-level provider rows that switch personal/API behavior with `sourcePreference`.
- Do not change Chrome permissions or manifest host claims.
- Do not translate raw provider evidence, diagnostic raw bodies, or export schemas.
- Do not package a release from source-model cleanup unless a separate release phase is opened.

## Implementation Status

- `Phase 497` keeps configurable provider source-mode paths visible inside Quick Setup.
- `Phase 498` introduced shared display eligibility so deferred/planned providers stay out of display surfaces while shipped live and policy-only providers remain displayable.
- `Phase 499` aligned popup and Provider order rendering to the same visible + display-eligible provider list.
- `Phase 500` aligned quota item controls to visible + display-eligible providers while preserving stored preferences.
- `Phase 501` closed the queue without packaging a new release candidate.
- `Phase 503` changed provider ids to source-level entries, migrated legacy brand-level settings and credentials, fixed runtime adapters to use fixed source families per entry, and made Quick Setup default to personal/page/policy entries with an explicit Team/API reveal control.

## Implementation Notes For Future Work

- Treat legacy `provider.enabled` only as storage migration input. New runtime code should use `displayEnabled`.
- New code should prefer explicit concepts from this contract over overloaded booleans.
- Quick Setup view-models should continue producing configurable provider cards.
- Provider Display view-models should continue producing eligible, dashboard-visible provider controls.
- Popup view-models should not bypass Provider Display by reading every shipped provider directly.

## Verification Expectations

Current and future implementation phases should keep focused coverage for:

- Quick Setup lists all configurable providers.
- Provider Display lists only eligible dashboard-visible providers.
- Surface order matches the actual rendered provider list.
- Hidden or deferred providers do not affect visible order.
- Policy-only providers never render as live quota progress.
- Quota item controls only affect eligible displayed providers.
