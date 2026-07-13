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
  progress items. Personal-usage history and turn trends can each be shown or
  hidden per popup, sidebar, and full-page surface without changing provider
  enablement, provider order, or the stored source snapshot.

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
- usage facts, raw diagnostic bodies, provider evidence, and archive/export payloads stay source-truth data, not configurable progress bars
- hidden-provider quota item settings must not affect visible popup, sidebar, or full-page rendering

## Provider-Specific Boundaries

### Cursor

Cursor personal-page and Cursor Team/API entries are separate display units. Cursor can be displayed only from truthful personal-dashboard or provider-source states. Do not imply an exact plan-wide remaining balance if the source only exposes billing-period context.

### Codex

Codex personal-page and Codex Enterprise/API entries are separate display units. Codex can expose usage-window values and reset timing when available. Do not collapse separate usage windows into one fake plan-wide balance.

### Claude Code

Claude Team usage-page and Claude Admin/API entries are separate display units. Claude Team usage-page support can be represented when the logged-in usage surface is available. Claude Pro/Max support remains account-gated until directly verified.

### Gemini Code Assist

Gemini remains policy-only unless the product explicitly accepts project-scoped metrics or another truthful source. Policy-only display must not promise live remaining usage.

### JetBrains AI

JetBrains remains retained in the repo but deferred from the active support promise until a real organization-visible `Users and licensing` session is reverified. Deferred JetBrains state must not enter Provider Display ordering or quota item controls.

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
