# Experimental Local Companion Bridge

Date: 2026-07-25

Document class:

- maintained reference

Freshness model:

- experimental contract; review before every user-facing rollout

Status note:

- reference CLI plus an experimental Settings connection for the authenticated
  CodexBar dashboard snapshot
- local companion rows remain Custom Sources and are not built-in Providers

## Status

The repository includes an experimental Node reference bridge for development
and protocol testing. The extension does not install, start, download, or
update this process, and the generic reference CLI is not presented as a
built-in Provider connection. Settings separately exposes the bounded CodexBar
dashboard adapter described below.

The bridge proves a narrow local-source boundary before any future desktop
companion or CodexBar adapter is exposed to users. It is not a way for the
extension to obtain arbitrary machine access.

## Experimental CodexBar Dashboard Connection

Settings includes an experimental adapter for the versioned CodexBar dashboard
snapshot. CodexBar is optional third-party local software; this project does
not install, start, update, discover, or control it.

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
- `--host 127.0.0.1`: IPv4 loopback, the default
- `--host ::1`: IPv6 loopback
- `--port <1-65535>`: fixed local port, default `47831`

There is deliberately no directory scan, command, executable, browser-profile,
cookie, Keychain, or environment-discovery option.

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

The reference bridge does not upload files. It reads only paths explicitly
provided on its command line and returns validated data over loopback. Users
remain responsible for the contents and permissions of those files.

## External Companion Adapters

An explicitly enabled local companion adapter may translate data from a
separately installed tool into the same `custom-source.v1` payload. The
CodexBar dashboard adapter is the first such bounded integration. An
unauthenticated third-party `/usage` or `/cost` route is not trusted merely
because it uses loopback.

No adapter may execute arbitrary commands, override built-in Provider source
truth, persist raw credentials, or copy direct account identifiers into
AppState.
