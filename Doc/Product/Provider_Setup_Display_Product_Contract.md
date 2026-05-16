# Provider Setup And Display Product Contract

Date: 2026-05-16

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the current product contract for separating provider setup, source mode selection, dashboard visibility, provider ordering, and quota item controls
- use this document before changing Quick Setup, Provider Display, popup ordering, side panel ordering, full-page ordering, or per-provider quota item settings

## Purpose

Recent UI work made provider setup and provider display more configurable, but several concepts are now too easy to confuse:

- enabling or configuring a provider
- choosing where its data comes from
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

### Source Mode

Source mode describes where the provider's status or usage data comes from.

Expected source-mode families:

- personal web page or signed-in browser session
- Team/Enterprise API or admin account surface
- policy-only reference text
- auto selection when multiple truthful sources are available

Source modes are options under one provider identity. They must not become duplicate provider rows.

### Setup State

Setup state describes whether the provider has enough user action, permission, credentials, or source binding to attempt a truthful sync.

Setup state is not the same as dashboard visibility.

Examples:

- a provider can be configured but hidden from dashboards
- a provider can need browser host access before it can sync
- a provider can be policy-only and have no live sync source
- a provider can be deferred and remain unavailable for display ordering

### Dashboard Display Visibility

Dashboard display visibility is the user's intent to show or hide a provider on product surfaces.

The card-level `show in dashboard` control means:

- include this provider in display surfaces when it is display-eligible
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

- Quick Setup is the provider connection and source-mode entry point.
- Quick Setup must not be hidden behind Advanced, Developer, or Debug display levels.
- Quick Setup should show all configurable providers, including hidden or not-yet-displayable providers.
- Each provider card should keep the personal-user path easy to find.
- Team/Enterprise API setup belongs inside the same provider card as an optional source-mode path, not as a separate provider.
- Hidden providers must remain recoverable through Quick Setup.

### Provider Display

Provider Display is the dashboard visibility, ordering, and quota-item configuration area.

- Provider order controls should list providers that are display-eligible and dashboard-visible for the relevant surface.
- Quota item controls should be scoped to display-eligible and dashboard-visible providers.
- Providers without renderable quota progress items should show a compact summary rather than expanded empty controls.
- Deferred providers should not appear in Provider Display ordering.
- Policy-only providers may appear only with policy-only wording and must not imply live remaining quota.

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

Cursor can be displayed only from truthful personal-dashboard or provider-source states. Do not imply an exact plan-wide remaining balance if the source only exposes billing-period context.

### Codex

Codex can expose usage-window values and reset timing when available. Do not collapse separate usage windows into one fake plan-wide balance.

### Claude Code

Claude Team usage-page support can be represented when the logged-in usage surface is available. Claude Pro/Max support remains account-gated until directly verified.

### Gemini Code Assist

Gemini remains policy-only unless the product explicitly accepts project-scoped metrics or another truthful source. Policy-only display must not promise live remaining usage.

### JetBrains AI

JetBrains remains retained in the repo but deferred from the active support promise until a real organization-visible `Users and licensing` session is reverified. Deferred JetBrains state must not enter Provider Display ordering or quota item controls.

## Non-Goals

- Do not rename or remove provider source-truth evidence fields.
- Do not migrate storage before the implementation phases define the exact model.
- Do not change Chrome permissions or manifest host claims.
- Do not translate raw provider evidence, diagnostic raw bodies, or export schemas.
- Do not package a release from this contract-only phase.

## Implementation Notes For Follow-Up Phases

- Treat legacy `provider.enabled` carefully because it has historically mixed setup and display meanings.
- New code should prefer explicit concepts from this contract over overloaded booleans.
- Quick Setup view-models should produce configurable provider cards.
- Provider Display view-models should produce eligible, dashboard-visible provider controls.
- Popup view-models should not bypass Provider Display by reading every shipped provider directly.

## Verification Expectations

Later implementation phases should add focused coverage for:

- Quick Setup lists all configurable providers.
- Provider Display lists only eligible dashboard-visible providers.
- Surface order matches the actual rendered provider list.
- Hidden or deferred providers do not affect visible order.
- Policy-only providers never render as live quota progress.
- Quota item controls only affect eligible displayed providers.
