# Security Policy

## Reporting Security Issues

Please do not file public issues for vulnerabilities, leaked credentials, or provider-account exposure.

Use GitHub private vulnerability reporting when it is enabled for the repository. If that is not available, contact the repository owner privately through the GitHub profile listed in `package.json`.

## Project Security Boundaries

AI Usage Dashboard is designed to avoid persistent collection of raw browser authentication material:

- It does not ask users to paste cookies.
- It does not ask users to paste raw browser auth headers.
- Codex personal sync may keep one short-lived ChatGPT access token in
  `chrome.storage.session`, or only in service-worker memory when session
  storage is unavailable. The token is sent only to `chatgpt.com` and is not
  written to AppState, Chrome Sync, configuration backups, logs, fixtures, or
  provider snapshots.
- Codex automatic authentication first uses a bounded background request to the
  signed-in `chatgpt.com` session. Eligible cookies are attached by the browser
  only to that origin; extension code does not inspect or persist them, and the
  raw session response is discarded after extracting the temporary credential.
  Existing-tab script capture remains a compatibility fallback, not a required
  foreground workflow.
- Advanced Codex recovery accepts only a bare temporary access-token value. It
  rejects cookies, authentication JSON, refresh tokens, and complete
  Authorization headers, and provides an immediate clear action.
- Cursor personal summary requests reuse the browser's existing signed-in
  `cursor.com` session with optional host access. Eligible cookies are attached
  by the browser only to `cursor.com`; extension code does not read, persist,
  export, synchronize, or log them.
- Claude Personal refresh uses optional `claude.ai` host access and a bounded,
  allowlisted page-session observer. Eligible cookies stay browser-managed on
  `claude.ai`; raw responses, headers, page text, account identifiers, and
  cookies are not persisted, exported, synchronized, or logged. Only normalized
  usage windows, reset timing, plan identity, and available usage-credit facts
  may enter the cached provider snapshot.
- The Claude Code Analytics Admin API remains a separate organization source.
  Its optional Admin API key is stored in extension-managed local storage and
  is never reused for the Claude Personal page source.
- The optional Sub2API connector sends an account-scoped API key only to the
  exact user-configured deployment origin for `GET /v1/usage`. The key remains
  in account-isolated extension-local secret storage and is excluded from
  AppState, Chrome Sync, backups, imports, exports, logs, fixtures, diagnostics,
  snapshots, and user-facing errors.
- Sub2API deployments request optional host access for the configured scheme and
  host. Runtime requests enforce the exact origin and reject embedded URL
  credentials, paths, queries, fragments, cross-origin redirects, non-JSON
  responses, and oversized payloads. Non-loopback HTTP requires explicit
  acknowledgement because it does not provide transport encryption.
- Sub2API account-dashboard sessions, refresh tokens, cookies, passwords, raw
  usage rows, prompts, responses, identities, key lists, group names, and
  endpoint paths are outside the connector contract. Disconnect removes the
  credential; retaining a previous nonsecret summary requires an explicit user
  choice and keeps it marked as saved data.
- It stores settings, optional API credentials, page bindings, cached snapshots,
  locally cached provider favicon images for toolbar icon matching, and
  import/export payloads in the user's Chrome profile.
- It uses optional host permissions for supported provider origins and
  user-approved custom source HTTP/HTTPS endpoint origins.
- It uses packaged extension scripts and does not load remote executable code.
- User-configured custom JSON sources are fetched as JSON with browser
  credentials omitted. The response is validated and normalized; raw response
  bodies are not stored, HTML is not rendered, and scripts are not executed.
- The experimental Local Companion Bridge binds only to `127.0.0.1` or `::1`
  and requires a one-time pairing flow plus a revocable bearer token. Loopback
  is not treated as authentication. Tokens remain in bridge memory and
  extension-local secret storage and are excluded from AppState, Chrome Sync,
  backups, logs, fixtures, snapshots, and diagnostics.
- The reference bridge reads only JSON files explicitly named when the process
  starts. It cannot accept arbitrary paths over HTTP, scan user directories,
  execute commands, inspect browser profiles, or replace a built-in Provider
  source entry.
- The optional CodexBar dashboard adapter accepts only the exact authenticated
  `http://127.0.0.1:<port>/dashboard/v1/snapshot` route after a user-initiated
  optional host grant. It rejects `localhost`, LAN or remote hosts, redirects,
  query credentials, and CodexBar's unauthenticated `/usage` and `/cost`
  routes. Its independently implemented parser enforces schema, response-size,
  provider-count, numeric-range, timestamp, and staleness bounds before
  creating separate `custom:codexbar-*` rows.

## Sensitive Data Rules

- Do not commit real API keys, cookies, auth headers, personal account exports, or screenshots that reveal private account information.
- Do not log, fixture, export, sync, or persist Codex session tokens outside
  `chrome.storage.session`. Authentication failures must use fixed diagnostic
  text and must never include the submitted token or response body.
- Do not fixture or persist raw Claude Personal page/network evidence. Fixtures
  must contain only sanitized synthetic or normalized contract fields and must
  omit organization ids, account ids, cookies, and request headers.
- When adding fixtures, redact account identifiers and provider-specific private values.
- When adding store screenshots, use the repository screenshot request/archive workflow so truth boundaries and operator notes stay attached to the image set.
- Do not commit real custom source endpoint secrets, private endpoint payloads,
  or exported configuration files that reveal private service URLs.
- Do not log, fixture, export, synchronize, or place Local Companion pairing
  codes or bearer tokens in URLs. Do not weaken bridge authentication for a
  third-party loopback service.
- Do not store, log, fixture, export, synchronize, or place a CodexBar dashboard
  token in AppState, configuration backup, diagnostics, or a URL. Do not use
  CodexBar's unauthenticated loopback routes as a fallback.
- Do not store, log, fixture, export, synchronize, or display a Sub2API API key,
  account-dashboard token, refresh token, real deployment response, or private
  deployment URL. Synthetic fixtures must use reserved example domains and
  invented aggregate values.
