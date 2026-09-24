# Experimental Local Companion Bridge

Date: 2026-09-24

Document class:

- maintained reference

Freshness model:

- experimental contract; review before every user-facing rollout

Status note:

- the public Store is `0.2.0-rc.14`; the Codex local quota and equivalent
  estimate below are work-branch code, not yet a Store release
- generic local rows remain Custom Sources; the opt-in Codex summary is a
  separate, built-in Codex Personal source

## Status

The repository includes an experimental Node reference bridge for development
and protocol testing. The extension does not install, start, download, or
update this process, and the generic reference CLI is not presented as a
built-in Provider connection. Developer/Debug Settings in the RC14 candidate
exposes generic pairing and selected-source refresh in addition to the bounded
CodexBar dashboard adapter described below.

The bridge proves a narrow local-source boundary. It is not a way for the
extension to obtain arbitrary machine access.

## Codex Local Quota (Unreleased Work Branch)

The preview has no standalone Companion installer. On the **same machine** as
the browser, obtain the matching project source, install Node.js `>=22.12.0`
and Codex CLI, and sign in to Codex CLI. From the project root, manually start
the Node reference bridge with an explicit, absolute Codex Home path:

```sh
node scripts/local-companion-bridge.mjs --codex-home "/absolute/path/to/CodexHome"
```

Replace the example path with the Codex Home used by the signed-in CLI. The
command runs on Windows, macOS and Linux when `node` and `codex` are on `PATH`;
use `--codex-bin <absolute-executable-path>` if the CLI is elsewhere. Keep the
terminal open. It prints a loopback URL and one-time pairing code; enter both
under **Provider display settings → Codex local connection** and allow Chrome's
local-address permission request. The disconnected Settings control includes
these steps. Restarting Companion clears the in-memory token and requires
pairing again with its new code.

The bridge invokes `codex app-server` for the read-only
`account/rateLimits/read` request. The CLI may contact Codex services, so this
removes the browser-page dependency but is not an offline mode. It does not
install Codex CLI, scan for an installation, or launch a persistent service.
Only an absolute, explicitly provided Codex Home is accepted. The default
`codex` executable must be on the operator's PATH; `--codex-bin` allows an
explicit executable path.

Under Provider display settings, enable Codex Personal, enter the printed
loopback URL and one-time code, and pair. Basic and Advanced users can use this
dedicated Codex control; arbitrary Custom Source controls remain
Developer/Debug-only. Pairing checks that a Codex quota can actually be read,
then defaults Codex Personal to **Local only**. With no pairing, existing
browser sync is unchanged. Select **Browser** to return to the browser source,
or **Local quota + browser history** to allow browser-only history when the
account identity matches on both sides. Local-only never issues Codex browser
requests and never silently falls back after a local error. Switching source,
changing pairing, or disconnecting clears the previous Codex snapshot and
invalidates in-flight sync results.

The authenticated `GET /v1/codex/summary` response uses
`ai-usage-dashboard.codex-local.v1` and includes captured time, quota windows,
reset times, optional banked reset count, a pairing-scoped HMAC account digest,
and bounded estimate summaries. It never returns the raw account id, token,
prompt, session text, model log, or file path. A missing reset count stays
**unknown**, distinct from a real zero. The raw Codex Home and pairing secret
remain local and outside Chrome Sync and configuration backups.

### Observed API Equivalent

After pairing, the bridge starts at the current end of existing rollout JSONL
files and reads only newly appended complete lines from the explicitly chosen
Codex Home. It reads an existing file's first metadata line only to verify its
creator account; no earlier usage is counted. New session and subagent files
are counted separately only when their creator account matches the current
quota account. Replayed fork history and unverified account records are not
priced. Cumulative `token_count` deltas prevent duplicate rate-limit-only
events from being charged twice. The reference price table is pinned to the [official API
pricing](https://developers.openai.com/api/docs/pricing) reviewed on
2026-09-24. Unrecognized models, tiers, cache categories, incomplete records,
oversized reads, account changes, and quota resets break the learning sample.
There is no historical backfill; Companion restart and re-pairing restart
learning.

Only after at least five percentage points of quota movement with complete
priced local calls does the extension show an estimate. Observed priced API
cost divided by the quota movement estimates a full 100% window, then that
full-window estimate is multiplied by the current used percentage. The detail
view shows a rounding range, priced-observation sample count, price date, and
Low or Medium confidence (never High). This is an **API equivalent**, not a
subscription bill, cash value, or balance. Work on other devices or otherwise
unobserved calls can change the actual quota without being priced locally;
the displayed estimate is therefore conditional and may be unavailable.

## Experimental CodexBar Dashboard Connection

Settings includes an experimental adapter for the versioned CodexBar dashboard
snapshot. CodexBar is optional third-party local software; this project does
not install, start, update, discover, or control it.

Because the adapter requires a separately operated loopback service and bearer
token, its Settings panel is shown only at the Developer and Debug display
levels. Basic and Advanced users do not see the experimental controls; changing
the display level does not alter an existing connection or its locally cached
rows.

Start a current CodexBar release explicitly with a strong token:

```sh
CODEXBAR_DASHBOARD_TOKEN="$(openssl rand -hex 32)" codexbar serve --port 8080
```

Keep the generated token available long enough to paste it into Settings, then
configure this exact endpoint:

```text
http://127.0.0.1:8080/dashboard/v1/snapshot
```

The extension requests optional access to `http://127.0.0.1/*` only after the
user selects Connect. It rejects `localhost`, LAN addresses, remote hosts,
query tokens, redirects, `/usage`, and `/cost`. Every request uses
`Authorization: Bearer` and requires an `application/json` response matching
dashboard schema version 1.

Accepted rows are mapped to ids beginning with `custom:codexbar-`. They are
displayed as local companion sources and never replace or merge with an
AI Usage Dashboard built-in Provider. Upstream identity fields and raw error
objects are discarded before storage. Disconnect removes the token and all
managed rows; clearing only the token preserves cached rows as stale until a
new token is supplied.

## Start The Reference Bridge

Prepare one or more JSON files that follow
[`ai-usage-dashboard.custom-source.v1`](./Custom_JSON_Sources.md), then start the
process explicitly:

```sh
npm run bridge:local -- \
  --source build-quota=/absolute/path/build-quota.json \
  --source local-credits=/absolute/path/local-credits.json
```

The process prints its loopback URL and a one-time pairing code. It does not
print the issued bearer token. The token exists only in process memory and the
extension's local secret store. Restarting the process invalidates the token.

Supported options:

- `--source <id>=<json-file>`: explicit input file; repeat up to 32 times
- `--ccusage <id>=<json-file>`: explicit ccusage daily export; shares the same
  32-source limit and may be combined with `--source`
- `--host 127.0.0.1`: IPv4 loopback, the default
- `--host ::1`: IPv6 loopback
- `--port <1-65535>`: fixed local port, default `47831`
- `--codex-home <absolute-directory>`: opt-in Codex CLI state directory;
  permits starting without any Custom Source file
- `--codex-bin <executable>`: manually selected Codex CLI executable

Without `--codex-home`, there is no directory scan, CLI invocation,
browser-profile, cookie, Keychain, or environment discovery. Codex mode reads
only session rollout files under the explicitly provided home.

## ccusage Daily Export (Experimental)

For a daily JSON export you have already produced, start the reference bridge
yourself with the exact file path:

```sh
npm run bridge:local -- --ccusage daily=/absolute/path/ccusage-daily.json
```

This does not run ccusage. No installation, CLI execution, directory scan,
raw-session import, software update or background-service startup occurs.
The converter supports a top-level `daily` array and `totals` object. Each row
has exactly one calendar `date` or `period` (`YYYY-MM-DD`), the five documented
token counters, and an optional `totalCost`. Dates must be unique; counters must
be finite non-negative safe integers with a consistent component sum. Inputs
are limited to 1 MiB and 366 daily rows. Project-grouped, session, block and
other JSON layouts are rejected, not scraped heuristically.

Only token totals, estimated USD cost, date coverage and export-file modification
time survive conversion. Totals are computed from daily rows, not copied from
the input totals object. Model names, project paths, account identities, raw
rows and unrelated fields are discarded. Omitted costs or upstream unpriced
markers make cost unavailable, never a fabricated zero. A genuinely reported
zero with no missing-pricing indication remains zero. Empty daily arrays show
no observations, not zero usage. These are CLI estimates, not provider billing
or remaining subscription quota. Source calendar dates are retained without
inferring a timezone or re-bucketing them.

The supported input contract follows the upstream [JSON output
reference](https://ccusage.com/guide/json-output) and [daily report
reference](https://ccusage.com/guide/daily-reports), reviewed on 2026-09-23.
Export-file modification time is provenance, not proof of a live upstream
account refresh; touching an old file cannot improve the underlying report.
Users must regenerate their explicit export themselves to update its contents.

In Developer or Debug Settings, pair the printed loopback URL and one-time
code. Pairing checks health and loads the index but does not poll every source.
Select a source and refresh it explicitly. A saved row uses the separate
`custom:companion-` namespace and cannot overwrite CodexBar or ordinary custom
rows. Its dashboard refresh action targets that saved source only. The source
capture time remains the file timestamp; failed refreshes never renew it.
Captures older than one hour, more than one minute in the future, or unknown
are shown as stale.

Refresh index updates health and removes saved rows no longer advertised by
the bridge. Remove saved source deletes the extension's cached row, not the
input file or bridge mapping; refreshing it explicitly can import it again.
Disconnect clears the local pairing and managed rows even when the bridge is
offline, then attempts revocation. Restarting the service expires the previous
token; pair again with its new code. A failed refresh preserves any existing
snapshot as stale. No automatic idle-source polling is added.

## Versioned Protocol

Protocol schema:

```text
ai-usage-dashboard.local-bridge.v1
```

Endpoints:

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/v1/pair` | one-time code in JSON body | issue one bearer token |
| `GET` | `/v1/health` | bearer token | bounded health and source count |
| `GET` | `/v1/sources` | bearer token | bounded source index |
| `GET` | `/v1/sources/<custom:id>` | bearer token | one validated `custom-source.v1` payload |
| `GET` | `/v1/codex/summary` | bearer token | bounded Codex quota and observed equivalent, only with `--codex-home` |
| `POST` | `/v1/revoke` | bearer token | invalidate token and rotate pairing code |

The pairing code and bearer token are never accepted in a URL or query string.
All authenticated requests use the `Authorization: Bearer <token>` header.

Example health response:

```json
{
  "schema": "ai-usage-dashboard.local-bridge.v1",
  "status": "ok",
  "bridgeVersion": "0.1.0-experimental",
  "sourceCount": 2
}
```

Example source index:

```json
{
  "schema": "ai-usage-dashboard.local-bridge.v1",
  "sources": [
    {
      "sourceId": "custom:build-quota",
      "label": "Build quota"
    }
  ]
}
```

Single-source responses use the public custom source schema directly. Built-in
Provider ids are rejected: a bridge source must use the `custom:` namespace and
cannot replace built-in Provider source truth.

## Security Boundary

The reference implementation:

- binds only to `127.0.0.1` or `::1`, never `0.0.0.0`
- requires authentication for health, index, source, and revocation requests
- uses constant-time comparison for pairing codes and bearer tokens
- allows extension origins for browser CORS handling and rejects normal web
  origins
- limits pairing attempts, authenticated requests, body size, response size,
  source count, and request duration
- validates every source file before returning it
- reads bounded regular files through a descriptor; refuses directories and
  final-path symlinks and rejects files changed during the read
- maps a fixed source id to a file selected when the process starts; HTTP
  callers cannot provide a path
- keeps bearer state in memory and supports immediate revocation

Loopback alone is not treated as authentication. Other local software can
reach loopback ports, so the bearer token remains mandatory even when the
caller and bridge run on the same machine.

## Extension Storage And Privacy

The extension-side foundation stores a paired bridge token only in
extension-managed local secret storage. It is not part of AppState, Chrome
Sync, configuration backup, logs, fixtures, source snapshots, or user-facing
errors. Normalized custom-source snapshots follow the same storage and display
rules as existing Custom JSON Sources.

Generic pairing has a protocol-specific local storage key so a CodexBar token
on the same loopback origin cannot be overwritten. Pairing codes are cleared
from the form after an attempt. UI responses expose only whitelisted connection
metadata and fixed status codes. HTTP redirects and query credentials are
rejected; streamed responses are bounded even without `Content-Length`.

The reference bridge does not upload files. It reads only paths explicitly
provided on its command line, plus Codex session logs under an explicitly
selected Codex Home in Codex mode, and returns validated data over loopback.
Users remain responsible for the contents and permissions of those files.

## External Companion Adapters

An explicitly enabled local companion adapter may translate data from a
separately installed tool into the same `custom-source.v1` payload. The
CodexBar dashboard adapter is the first such bounded integration. An
unauthenticated third-party `/usage` or `/cost` route is not trusted merely
because it uses loopback.

No adapter may execute arbitrary commands, override built-in Provider source
truth, persist raw credentials, or copy direct account identifiers into
AppState.
