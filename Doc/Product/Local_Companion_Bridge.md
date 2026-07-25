# Experimental Local Companion Bridge

Date: 2026-07-25

Document class:

- maintained reference

Freshness model:

- experimental contract; review before every user-facing rollout

Status note:

- reference CLI and extension-side protocol foundation only
- no shipped Settings connection or built-in Provider adapter yet

## Status

The repository includes an experimental Node reference bridge for development
and protocol testing. The extension does not install, start, download, or
update this process, and the current Settings UI does not present it as a
shipped Provider connection.

The bridge proves a narrow local-source boundary before any future desktop
companion or CodexBar adapter is exposed to users. It is not a way for the
extension to obtain arbitrary machine access.

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

A future adapter may translate data from an explicitly enabled local companion,
including a separately installed CodexBar CLI or server, into the same
`custom-source.v1` payload. Such an adapter must still use this authenticated,
bounded bridge contract. An unauthenticated third-party `/usage` or `/cost`
route is not trusted merely because it uses loopback.

No adapter may execute arbitrary commands, override built-in Provider source
truth, persist raw credentials, or copy direct account identifiers into
AppState.
