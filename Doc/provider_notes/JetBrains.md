# JetBrains Provider Note

Date: 2026-04-20

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this provider note should track the retained JetBrains source-path truth even while JetBrains stays outside the active narrowed RC promise
- refresh it whenever the chosen source path, active release promise, or relevant official docs change

## 1. Decision

Selected MVP source path:

- `A1`: JetBrains Central Console `Users and licensing` page

Selected MVP support scope:

- organization accounts with access to JetBrains Central Console
- read-only org roles that can see current AI Credits usage

Deferred from MVP:

- personal account usage tracking
- hidden or undocumented JSON endpoints, if any
- parser support for all analytics segments beyond current usage

Reason:

- the official Central Console docs explicitly say the `Users and licensing` page shows current monthly AI Credits usage, remaining balance context, quota usage by license, top-up usage, and top-up limits
- no public usage API was found in the official docs reviewed on 2026-04-20

## 2. Official Sources Reviewed

Reviewed on 2026-04-20 using official JetBrains documentation:

- Users and licensing:
  - https://www.jetbrains.com/help/jetbrains-console/ai-users-and-licensing.html
  - search snippet reference: `turn1search0`
- Monitoring current AI Credits usage:
  - https://www.jetbrains.com/help/jetbrains-console/monitor-current-ai-credits-usage.html
  - search snippet reference: `turn1search4`
- AI management:
  - https://www.jetbrains.com/help/jetbrains-console/ai-management.html
  - search snippet reference: `turn1search2`
- Top-up AI credits:
  - https://www.jetbrains.com/help/jetbrains-console/top-up-ai-credits.html
  - search snippet reference: `turn1search3`
- JetBrains AI plans and usage:
  - https://www.jetbrains.com/help/ai-assistant/licensing-and-subscriptions.html
  - search snippet reference: `turn0search1`
- AI Credits consumption analytics:
  - https://www.jetbrains.com/help/jetbrains-console/ai-credits-consumption.html
  - search snippet reference: `turn1search1`

## 3. Selected Source Path

Chosen page:

- JetBrains Central Console
- sidebar path: `AI management -> Users and licensing`

Why this page:

- the official docs describe it as the place to assign licenses with AI, allocate AI Credits, and view current AI usage in the organization
- the docs explicitly call out the table columns and the information cards relevant to the MVP dashboard

Chosen data type for MVP:

- logged-in page parse

Not selected for MVP:

- a public API path
- the `AI Credits consumption` analytics segment as the primary adapter source

Reason:

- the analytics segment is useful for later reporting, but the current-usage page is the clearest official source for `current plan/quota/top-up/remaining` signals

## 4. Account Scope And Roles

Roles with read access to current usage per the reviewed docs:

- org admin
- purchaser
- primary billing contact
- primary technical contact
- primary licensee contact
- org viewer

MVP recommendation:

- support org accounts with one of the roles above
- do not target personal JetBrains AI subscriptions in v1

Important role nuance:

- identifying users almost out of AI Credits is interactive only for org admins
- the same information is partially visible to read-only roles, but the link action is inactive for them

## 5. Fields The Official Docs Expose

The reviewed official docs describe the following visible fields on `Users and licensing`:

Information cards:

- `Users licensed for AI`
- `Users almost out of AI Credits`
- `Top-up AI Credits available`

Table columns:

- `Balance used`
- `Licenses and quotas`
- `Top-up usage`
- `Top-up limit`

Documented field meanings:

- `Balance used`
  - percentage of AI Credits used from the user's total monthly AI Credits
  - total includes monthly AI quota plus top-up limits from all licenses with AI assigned to the user
- `Licenses and quotas`
  - shows current monthly AI quota usage for each assigned license
  - represented as `spent / included`
  - becomes available after the user's first AI interaction under that license
- `Top-up usage`
  - current number of top-up AI Credits spent this month
- `Top-up limit`
  - maximum number of top-up AI Credits the user can spend each month

Quota lifecycle:

- `AI quota` renews every `30 days` according to the reviewed official docs
- top-up AI Credits are consumed only after the monthly quota is exhausted

Important edge case documented by JetBrains:

- `Balance used` may exceed `100%` if an org admin lowers the user's top-up limit after the user already reached the previous limit during the same month

## 6. Transport Decision

Current transport conclusion:

- unresolved without a live Central Console session

What is known from official docs:

- the page exists and exposes the required usage values

What is not yet verified:

- whether the values are server-rendered HTML
- whether the page fetches JSON/XHR after load
- whether both patterns exist

MVP implementation consequence:

- `Phase 11` should start by inspecting the logged-in page with browser devtools
- if a stable authenticated JSON request exists, prefer that over DOM parsing
- if not, parse the stable card labels and table columns documented here

## 7. Parser Target Notes

Because the live page transport is not yet verified, this phase records semantic extraction anchors rather than exact CSS selectors.

Primary anchors:

- page title or navigation label: `Users and licensing`
- information card labels:
  - `Users licensed for AI`
  - `Top-up AI Credits available`
- table headers:
  - `Balance used`
  - `Licenses and quotas`
  - `Top-up usage`
  - `Top-up limit`

Field extraction target per user row:

- user identity:
  - name
  - email
- plan data:
  - one or more license names
  - current quota usage for each license
  - included AI Credits for each license
- current balance:
  - total `Balance used` percent
- top-up data:
  - current month `Top-up usage`
  - `Top-up limit`

Organization-level extraction target:

- `Top-up AI Credits available`
- optionally `Users almost out of AI Credits`

## 8. Normalized Mapping Proposal

Selected normalized strategy for the first JetBrains adapter:

- `providerId`: `jetbrains`
- `providerLabel`: `JetBrains AI`
- `syncSource`: `page_parse`
- `quotaUnit`: `credits`
- `quotaWindow`: `monthly`

Proposed mapping:

- `used`
  - derive from total monthly AI Credits used for the selected user or org-visible aggregate
  - if only percent and per-license quota values are available, sum the per-license `spent`
- `total`
  - sum monthly included AI Credits across licenses in `Licenses and quotas`
  - if top-up limits are part of the chosen card summary, keep them as a detail field rather than mixing them into included quota
- `remaining`
  - `max(total - used, 0)` for included quota
  - top-up availability should be kept as a secondary detail until the adapter contract grows
- `warningReason`
  - show warning when `Balance used >= 80%`
  - show warning if the docs-visible `Users almost out of AI Credits` state is present
- `resetAt`
  - display as `Renews every 30 days`
  - exact calendar reset date still needs live-session confirmation

Inference note:

- the docs clearly describe the quota model and page fields, but they do not provide a public JSON schema for this page in the reviewed sources

## 9. Fixtures

Docs-derived fixtures created in this phase:

- [users-and-licensing.fixture.html](../../fixtures/jetbrains/users-and-licensing.fixture.html)
- [users-and-licensing-extracted.fixture.json](../../fixtures/jetbrains/users-and-licensing-extracted.fixture.json)

Fixture note:

- these are sanitized parser-target fixtures derived from the official documentation descriptions
- they are not captures from a live Central Console session
- they should be treated as adapter scaffolding only

## 10. Open Validation Items

Still requires a real org account with AI visibility before parser implementation:

- confirm the post-login URL path used by the current Console
- inspect whether usage values are hydrated from JSON or embedded in HTML
- confirm whether a single-user row can represent multiple licenses consistently
- confirm whether the reset date is visible as an exact date or only as a recurring 30-day policy
- confirm whether org-level totals are available without drilling into analytics

## 11. Research Result

This phase selects:

- JetBrains Central Console `Users and licensing` page as the MVP source path

This phase does not select:

- a public usage API, because none was found in the reviewed official docs

## 12. Implementation Status

Phase 21 implementation landed on 2026-04-20.

Current implementation details:

- the runtime adapter now captures HTML from an open JetBrains tab under `account.jetbrains.com` or `*.jetbrains.com`
- the supported v1 page flow is the logged-in JetBrains Console `Users and licensing` page identified by semantic DOM anchors, not by a single hardcoded URL
- the extension uses `chrome.tabs` plus `chrome.scripting` to read the live page DOM, then runs the existing parser over that captured HTML
- failure states are explicit for:
  - no matching JetBrains page open
  - logged-out JetBrains session
  - non-matching page shape / selector drift

Still not validated against a real organization session in this repository:

- the exact current production URL path after login and navigation
- the current live DOM shape for `Users and licensing`
- whether any authenticated JSON transport exists behind the page and is stable enough to replace DOM capture later

## 13. 2026-04-23 Verification Note

Official-doc recheck on `2026-04-23` still points at the logged-in Console on `account.jetbrains.com`.

Current operator-profile findings:

- the only observed JetBrains Console route in Chrome session data is `https://account.jetbrains.com/organization/ai/users-and-licensing`
- opening that route in the current operator profile yields `JetBrains Account :: Error 400: Bad Request`
- this is currently treated as an account-scope blocker, not proof that the selected Console route is wrong

Runtime truthfulness improvement landed on the same date:

- the live JetBrains client now distinguishes
  - logged-out session
  - page not open
  - organization access unavailable

Release consequence:

- `2026-04-23`: the current RC selected the scope-narrowing branch
- JetBrains remains implemented in the repository, but it is deferred from the active RC support promise until a real org-visible `Users and licensing` session is reverified
