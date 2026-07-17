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
- Advanced Codex recovery accepts only a bare temporary access-token value. It
  rejects cookies, authentication JSON, refresh tokens, and complete
  Authorization headers, and provides an immediate clear action.
- It stores settings, optional API credentials, page bindings, cached snapshots,
  locally cached provider favicon images for toolbar icon matching, and
  import/export payloads in the user's Chrome profile.
- It uses optional host permissions for supported provider origins and
  user-approved custom source HTTP/HTTPS endpoint origins.
- It uses packaged extension scripts and does not load remote executable code.
- User-configured custom JSON sources are fetched as JSON with browser
  credentials omitted. The response is validated and normalized; raw response
  bodies are not stored, HTML is not rendered, and scripts are not executed.

## Sensitive Data Rules

- Do not commit real API keys, cookies, auth headers, personal account exports, or screenshots that reveal private account information.
- Do not log, fixture, export, sync, or persist Codex session tokens outside
  `chrome.storage.session`. Authentication failures must use fixed diagnostic
  text and must never include the submitted token or response body.
- When adding fixtures, redact account identifiers and provider-specific private values.
- When adding store screenshots, use the repository screenshot request/archive workflow so truth boundaries and operator notes stay attached to the image set.
- Do not commit real custom source endpoint secrets, private endpoint payloads,
  or exported configuration files that reveal private service URLs.
