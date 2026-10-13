# Provider Insights Source Contract

Date: 2026-10-13

Document class:

- maintained technical reference

Freshness model:

- update when usage/reset sources, their verified fields or normalized summaries change

Status note:

- this is the source contract for the in-progress usage insights update
- a documented or rendered field is not a claim that the current Store package implements it
- source support remains conditional on the selected account and returned data

## Source Evidence

The source review distinguishes authenticated response shape, official interface
documentation, rendered aggregate context and unverified candidates. Only
verified structured fields or narrowly scoped rendered aggregates may be enabled.
Dates, identifiers and amounts in test fixtures are synthetic.

| Source | Verified entry | Data and units | Evidence and boundary |
| --- | --- | --- | --- |
| Codex browser | New `/settings/usage` overview/analytics; retained `/codex/settings/usage` and `/codex/cloud/settings/usage` | Source-visible quota percentages; aggregate function composition for the selected period | New rendered layout and aggregate label/value pairing reviewed October 13. Conversation rankings are excluded. Work/Codex/agents identifies the analytics usage scope, not proof of a shared quota pool. |
| Codex session API | Existing `GET /backend-api/wham/usage` | Window percent, reset epoch seconds, separate flexible credits | Existing reviewed contract retained; newly observed endpoint names are candidates until their payload is independently verified. |
| Codex CLI Companion | Read-only `account/rateLimits/read` | `usedPercent`, minutes per window, reset epoch seconds, available reset count and optional detail expiry | Official app-server contract. `availableCount` is authoritative even with absent or capped detail rows. |
| Claude Personal | `/new#settings/usage`, retained legacy entry | Subscription window percent; reset-offer presence/expiry; separately scoped cloud-session and usage credits | New reset/credit sections reviewed October 13. Numeric count and exact expiry must remain unknown when only presence or a calendar date is rendered. New JSON shapes were not verified in that review. |
| Claude usage API | Existing organization-scoped usage/prepaid-credit/spend-limit endpoints | Existing five-hour/weekly percentages and separate credit state | Retain existing verified fields. Product composition must never enter quota windows. New offer/cloud-credit JSON fields remain unsupported until verified. |
| Cursor summary | Existing `GET /api/usage-summary` and plan/hard-limit reads | Legacy Auto/API percentages, billing cycle and separate included/on-demand cent values | Authenticated summary shape reviewed October 13; it still used legacy names. This does not establish identity with newly labeled model pools. |
| Cursor rendered Spending | Cursor Models, Other Models and separate weekly allowance | Independent used percentages and source-visible reset context | Explicit named rows reviewed October 13. Safe scoped DOM may provide these rows; a date-only reset does not become an exact notification deadline. |
| Cursor history | Existing bounded usage-event capture | Daily token aggregates, included API value and actual paid charges | Preserve existing independent history range/completeness. Do not retain individual requests or infer current usage from a historical empty range. |

Official references: [Codex app-server](https://learn.chatgpt.com/docs/app-server),
[Claude limit resets](https://support.claude.com/en/articles/17007452-what-is-a-limit-reset),
[Cursor usage and limits](https://prod.cursor.com/help/models-and-usage/usage-limits).

## Optional Normalized Additions

Extend existing provider snapshots with bounded optional summaries. Old snapshots
and backups remain valid; absent fields do not default to zero.

- Stable quota-pool identifiers distinguish independent pools with the same
  label or window kind. Retain old identity as fallback only for old data.
- Reset-credit summaries carry a successful capture time, source, authoritative
  count when known and bounded offer/type/expiry details. Detail length is not
  a count. Missing details, an empty list and zero available credits differ.
- Scoped balances preserve amount, unit, purpose, known expiry and source time.
  Cloud-session allowance, flexible credits and purchased credit are separate.
- Usage distributions preserve period, unit, bounded category IDs/labels and
  shares actually exposed by the source. They describe consumption composition,
  not quota remaining or an absolute token count.
- Each independent data block retains its own source and successful capture
  time. Failure in a new block must not erase verified older quota/history.

Unknown types/categories are bounded context, not new exact capabilities.
Only stable internal identifiers and safe summaries belong in stored snapshots;
raw account/grant identifiers and provider payloads do not.

## Capture And Account Boundaries

Use existing optional origins, account isolation, bounded page/session reads and
request coalescing. New page capture must scope to usage sections and exclude
conversation rankings, navigation history and unrelated page content. Do not
extract values from chart pixels, progress geometry or screenshots.

For Codex, browser and Companion data keep separate freshness. Local-only mode
never invokes browser capture, including on timeout or unsupported CLI data.
Hybrid may merge browser history only when both account identities are verified
to match. Late responses after an account or source-mode change are ignored.

Preserve current provider IDs, stored display choices, credential segregation,
sync strategy and source fidelity. A generic page title is insufficient to
classify a signed-in usage screen as logged out.

## Reset And Grant Evidence

An account notification needs fresh same-account source evidence. A percentage
decrease alone does not prove an early reset. A scheduled reset can retain the
existing independently sampled window-transition checks. New grant evidence
requires a verified grant or an increase from a previously known available
count; unknown-to-known and first observations establish a silent baseline.

Claude can reset usage while retaining the usual weekly deadline. A missing
offer, changed deadline or changed usage percentage alone cannot establish that
the owner redeemed a reset. No source reader consumes credits or changes billing.

Community announcements/forecasts remain separate public context. They never
change personal allowance, reset time, available reset-credit count or balance.
Community operators reporting the same announcement are not independent account
confirmation. Unverified payload schemas remain unsupported until reviewed.

The optional [community reset contract](Community_Reset_Insights.md) specifies
the separately cached, default-off readers, attribution, lifecycle/conflict
classification and network limits for both public sites.

## Presentation And Saved Display Choices

Reset counts/known expiry and purpose-scoped Claude balances use the existing
quota area. With one visible Codex circle and enough container width, the local
estimate/reset summary sits alongside it; multiple circles or bars keep a
wrapping summary below. Layout depends on visible windows, not a plan name.
When no quota item is visible, an independently enabled reset/credit summary
still works. Unknown expiry is explicit and capped offers never establish count.

Settings extends existing per-surface module preferences with quota insights,
usage composition and a Codex community summary. Existing chart order and
visibility survive. Composition/community default off. Cursor's new pool block
also defaults off so it cannot undo a user's hidden billing summary. New pool
rows use their own successful capture time and monthly/weekly identity; legacy
Auto/API billing amounts retain their original meaning. Fixed-position insight
blocks are visibility controls, not misleading draggable chart series.

Full details retain source/capture/account-verification context and scoped
composition periods. Composition is labeled as share of usage, not remaining
quota. No conversation title or request content is displayed or stored.

## Verification

Use minimized fixtures following the [Provider Authoring Guide](Provider_Authoring_Guide.md).
Cover old/new route handling, unknown versus zero, capped credit detail, date
precision, shared scope, independent pools, partial capture, account switches,
legacy backups and local-only browser-request counts. UI and notification tests
must verify that composition percentages never trigger quota alerts.

Public artifacts use synthetic data and omit conversation titles, prompts,
cookies, tokens, raw requests/responses and direct account identifiers.
