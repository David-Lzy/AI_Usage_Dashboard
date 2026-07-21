# Claude Provider Note

Date: 2026-07-21

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this note describes the current Claude Personal and organization analytics
  source contracts
- update it when the Claude Settings > Usage contract, Claude plan behavior, or
  Claude Code Analytics Admin API changes

## Current Decision

Claude is represented by two independent source entries:

| Persisted provider id | Product label | Source | Scope |
| --- | --- | --- | --- |
| `claude-code-team-page` | Claude Personal | Signed-in Claude Settings > Usage page | Individual paid-plan usage windows and usage-credit state |
| `claude-code-admin-api` | Claude Admin API | Claude Code Analytics Admin API | Organization activity and cost analytics |

The historical `claude-code-team-page` id is retained so existing visibility,
page binding, and per-surface ordering settings migrate without data loss. It is
an implementation identifier, not the current user-facing account classification.

The two source entries must not be merged:

- Claude Personal does not require an Admin API key.
- The Admin API does not represent an individual's Pro or Max subscription
  balance.
- Organization analytics must not replace or supplement a personal usage window
  unless the source explicitly exposes that personal value.

## Claude Personal Contract

Current routes:

- canonical: `https://claude.ai/new#settings/usage`
- supported legacy entry: `https://claude.ai/settings/usage`

The live contract was verified on 2026-07-21 with an individual Claude Pro
account. The source exposed structured plan-window usage and reset timing plus
separate usage-credit state. Plan detection also accepts `Claude Max`, `Claude
Max 5x`, and `Claude Max 20x` labels, with parser tests covering those forms;
those Max variants were not independently live-captured during this review.

Anthropic documents that Pro and Max subscriptions cover Claude and Claude Code
under one subscription and that usage limits are shared across those surfaces.
Accordingly, the extension labels this source `Claude Personal`; it does not
present the values as a Claude Code-only allowance.

### Capture Order

During a bounded personal refresh, the extension:

1. reuses the stored page binding when it still matches a Claude usage route
2. installs a temporary network observer before controlled navigation or reload
3. accepts only same-origin structured responses matching the verified usage,
   prepaid-credit, and extra-usage-limit endpoint shapes
4. validates and normalizes bounded fields in memory
5. removes the observer after success or timeout
6. falls back to conservative visible-page parsing when the structured response
   is not available
7. retains the last successful normalized snapshot if the current source cannot
   be read

Granting Claude host access triggers an immediate provider-scoped refresh.
Concurrent popup, side-panel, full-page, and background refresh requests share
the same in-flight provider refresh instead of reloading the source repeatedly.

### Normalized Values

When the source exposes them, the personal snapshot may contain:

- plan identity: Pro, Max, Max 5x, or Max 20x
- up to 16 active usage windows
- used and remaining percentage for each verified window
- reset timestamp and source-visible scope
- usage-credit enabled or disabled state
- bounded extra-usage spend or credit-balance facts
- source freshness and recovery state

The source can keep a top-level `five_hour` or `seven_day` window visible while
the duplicate row in its structured `limits` array reports `is_active: false`.
The extension treats the valid top-level window as display evidence in that
case. This preserves a source-visible current-session or all-model weekly
window around reset boundaries without inventing a missing value; inactive
structured rows with no matching top-level window remain filtered.

The extension does not turn missing values into zero. It does not combine
separate windows into one synthetic plan-wide remaining balance.

### Recovery States

The personal source distinguishes:

- optional host access missing
- signed-out or upgrade-only account state
- source page still hydrating
- capture unavailable
- route or response contract drift
- partial result with a prior valid snapshot
- stale cached data

The primary card shows one recovery action. Detailed rollout, parser, and raw
diagnostic context stays in Provider detail rather than leading the popup or
dashboard card.

## Claude Code Analytics Admin API

The organization source uses:

- `GET https://api.anthropic.com/v1/organizations/usage_report/claude_code`
- an organization-scoped Anthropic Admin API key
- daily aggregated records with documented activity, token, model, and estimated
  cost fields

This path is intended for supported organization roles. Anthropic documents
Claude Code usage analytics for Console users and Team or Enterprise owners and
admins; individual Pro and Max accounts do not receive that organization
analytics product.

The normalized Admin API card is analytics-first:

- activity or daily sessions may be shown when returned
- remaining and total subscription quota stay unavailable
- reporting-window labels are not presented as personal quota reset timestamps

## Privacy And Security Boundary

Claude Personal requires user-granted optional `claude.ai` host access. Chrome
keeps eligible cookies attached to `claude.ai`; the extension does not read,
copy, log, persist, export, or synchronize them.

The temporary personal-page observer discards:

- raw response bodies
- page body text
- request headers
- cookies or bearer credentials
- organization and account identifiers
- unrelated response fields

Only bounded normalized plan identity, usage windows, reset timing, credit facts,
and source diagnostics may enter the cached provider snapshot. These values are
not added to configuration backup, Chrome Sync, or raw evidence export.

The organization Admin API key is stored separately in extension-managed local
storage and is never used by the personal source.

## Official Sources

Reviewed on 2026-07-21:

- [Use Claude Code with your Pro or Max plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)
- [Manage usage credits for paid Claude plans](https://support.claude.com/en/articles/12429409-manage-usage-credits-for-paid-claude-plans)
- [Claude Code usage analytics](https://support.claude.com/en/articles/12157520-claude-code-usage-analytics)
- [Track team usage with analytics](https://code.claude.com/docs/en/analytics)
- [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api)

Official-source conclusions:

- Pro and Max usage is shared across Claude and Claude Code.
- Paid individual plans can use separate usage credits after included limits.
- Organization Claude Code analytics is distinct from individual plan usage.
- The personal Settings > Usage responses used by the extension are an internal
  page contract, not a public supported API.

## Fixtures And Verification

Public sanitized fixtures:

- [personal-usage-contract.fixture.json](../../fixtures/claude/personal-usage-contract.fixture.json)
- [personal-upgrade-gate.fixture.json](../../fixtures/claude/personal-upgrade-gate.fixture.json)
- [analytics-api.fixture.json](../../fixtures/claude/analytics-api.fixture.json)
- [analytics-api-extracted.fixture.json](../../fixtures/claude/analytics-api-extracted.fixture.json)

The personal usage fixture contains synthetic normalized values and no real
account identifiers, cookies, headers, or raw private response. The upgrade-gate
fixture preserves the signed-out/free-account boundary. Admin API fixtures are
schema-derived scaffolding rather than a real organization export.

Current verification covers:

- live individual Pro route and structured response contract
- Max plan label normalization through bounded parser tests
- permission grant followed by immediate refresh
- refresh serialization and coalescing
- slow hydration, route drift, logged-out, partial, and stale-data behavior
- popup, side panel, full-page, Provider detail, and Settings presentation
- representative LTR, long-label, and RTL visual matrices

## Known Limitations

- Claude may change its internal Settings > Usage response contract without
  notice; personal sync can temporarily fall back or become unavailable.
- The extension reports only source-visible windows and credit facts.
- No exact all-plan remaining balance is inferred.
- Max plan behavior is supported by the normalized contract but still benefits
  from future live account verification.
- Organization analytics can be delayed and does not provide an individual
  subscription quota.
