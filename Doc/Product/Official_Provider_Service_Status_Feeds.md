# Official Provider Service Status Feeds

Date: 2026-07-25

Document class:

- maintained technical reference

Freshness model:

- reverify official endpoints before changing runtime status support

Status note:

- this document records discovery evidence and a candidate contract
- the extension does not fetch or display these feeds yet

## Purpose

This reference records the official structured service-status sources evaluated
for OpenAI, Claude, and Cursor. Service status is a vendor-wide fact. It must
remain separate from account authorization, quota synchronization, page access,
and the health of an individual Provider source.

The endpoint observations below were repeated on 2026-07-25. They are suitable
as implementation inputs, but they are not a promise that a vendor will keep an
undocumented compatibility path forever.

## Feasibility Matrix

| Vendor | Official status page | Preferred structured source | Format | CORS and cache observed | Exact optional origin | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| OpenAI | [OpenAI Status](https://status.openai.com/) | `https://status.openai.com/api/v2/summary.json` for overall/component state; `https://status.openai.com/proxy/status.openai.com` is an Incident.io compatibility source for grouped affected components and ongoing incidents | JSON; Statuspage-compatible summary plus an Incident.io native compatibility response | `Access-Control-Allow-Origin: *`; `Cache-Control: public, max-age=0, must-revalidate` | `https://status.openai.com/*` | Feasible. Use the compatibility summary as the stable baseline and treat the Incident.io response as a bounded enhancement with independent validation. |
| Anthropic / Claude | [Claude Status](https://status.claude.com/) | `https://status.claude.com/api/v2/summary.json` | Atlassian Statuspage JSON | `Access-Control-Allow-Origin: *`; ten-second public cache plus `stale-while-revalidate` and `stale-if-error` | `https://status.claude.com/*` | Feasible. The former `status.anthropic.com` address redirects to the canonical Claude status domain. |
| Cursor | [Cursor Status](https://status.cursor.com/) | `https://status.cursor.com/api/v2/summary.json` | Atlassian Statuspage JSON | `Access-Control-Allow-Origin: *`; ten-second public cache plus `stale-while-revalidate` and `stale-if-error` | `https://status.cursor.com/*` | Feasible. |

OpenAI identifies `status.openai.com` as an official OpenAI domain in its
[communications verification guidance](https://help.openai.com/en/articles/11725090-verifying-communications-from-openai).
The Claude and Cursor sources are vendor-owned status subdomains; the Claude
legacy host also redirects to `status.claude.com`.

All three origins are covered by the manifest's existing optional HTTPS host
pattern. A runtime implementation must still request only the exact vendor
origin when a user explicitly enables that vendor's default-off status module.
No required host permission is justified by this investigation.

## Observed Contracts

### Statuspage-compatible summary

All three sites currently expose `api/v2/summary.json`. The useful public
fields are:

- `page.name`, `page.url`, and `page.updated_at`
- `status.indicator` and `status.description`
- component `id`, `name`, `status`, and `updated_at`
- for Claude and Cursor, active `incidents` and
  `scheduled_maintenances`

OpenAI's current compatibility summary does not expose `incidents` or
`scheduled_maintenances`. Its `api/v2/incidents/unresolved.json` path returned
HTML with HTTP 404 during discovery and must not be used or parsed.

### OpenAI Incident.io compatibility response

`proxy/status.openai.com` exposes public JSON under `summary`, including:

- `public_url`
- `affected_components`
- `ongoing_incidents`
- `scheduled_maintenances`
- grouped `structure.items`

The grouped structure currently includes a Codex group with Codex Web, Codex
API, CLI, and VS Code extension leaves. Only components named by the selected
Provider descriptor should be retained. Unrelated status-page content must not
be stored.

OpenAI also publishes an official [Atom incident feed](https://status.openai.com/feed.atom).
Claude and Cursor publish Statuspage incident history feeds, but history feeds
are not required for the first status module. The initial runtime should report
current service state and ongoing incidents rather than building an incident
archive.

## Candidate Normalized Model

The candidate model is deliberately independent from `ProviderSnapshot` and
its sync status:

```ts
type ProviderServiceStatusLevel =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

interface ProviderServiceStatusIncident {
  id: string;
  name: string;
  level: ProviderServiceStatusLevel;
  status: string;
  startedAt: string | null;
  updatedAt: string | null;
  url: string | null;
  affectedComponents: string[];
}

interface ProviderServiceStatus {
  vendor: "openai" | "anthropic" | "cursor";
  fetchedAt: string;
  sourceUrl: string;
  publicStatusUrl: string;
  level: ProviderServiceStatusLevel;
  summary: string | null;
  updatedAt: string | null;
  components: Array<{
    id: string;
    name: string;
    level: ProviderServiceStatusLevel;
    updatedAt: string | null;
  }>;
  incidents: ProviderServiceStatusIncident[];
}
```

Statuspage values map as follows:

- `none` and `operational` -> `operational`
- `minor` and `degraded_performance` -> `degraded`
- `partial_outage` -> `partial_outage`
- `major`, `critical`, and `major_outage` -> `major_outage`
- `maintenance` and `under_maintenance` -> `maintenance`
- missing or unknown values -> `unknown`

Raw descriptions and incident names are vendor-authored public text. They must
be length-bounded and rendered as plain text. They are not localized or treated
as application-controlled instructions.

## Fetch And Failure Policy

The recommended runtime policy for a later phase is:

- default off per vendor and per surface
- use the existing alarm path, never a new timer
- cache a successful result for at least five minutes even when the endpoint's
  public cache is shorter
- coalesce simultaneous surface requests
- use a bounded timeout and response-size limit
- on network, permission, HTTP, or parse failure, preserve the last successful
  normalized status and mark it stale
- when no previous result exists, report `unknown`
- never convert a vendor outage into an authorization, quota, or Provider sync
  error
- never parse an HTML error page as status data

The first implementation should fetch the Statuspage-compatible summary for
all three vendors. OpenAI's Incident.io compatibility response may add grouped
components and ongoing incidents only when its contract validates; failure of
that enhancement must not discard a valid compatibility summary.

## Sanitized Fixtures

Discovery fixtures live in `fixtures/provider-status/`. They contain only
public service state, a bounded component sample, and a bounded public incident
sample. They intentionally omit analytics identifiers, page markup, request
headers, cookies, account data, and unrelated components.

The fixtures are contract examples, not live health records. A test validates
their schema and candidate normalization without adding runtime fetching code.

## Upstream Discovery Note

[CodexBar](https://github.com/steipete/CodexBar) at commit
`cc8da27cec92029a6435bfee4a703a719290234e` was used only as a discovery lead
for endpoint candidates and transport differences. The endpoints were
independently queried from their official vendor domains. No CodexBar parser or
fixture code was copied into this phase.
