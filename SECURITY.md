# Security Policy

## Reporting Security Issues

Please do not file public issues for vulnerabilities, leaked credentials, or provider-account exposure.

Use GitHub private vulnerability reporting when it is enabled for the repository. If that is not available, contact the repository owner privately through the GitHub profile listed in `package.json`.

## Project Security Boundaries

AI Usage Dashboard is designed to avoid collecting raw browser authentication material:

- It does not ask users to paste cookies.
- It does not ask users to paste raw browser auth headers.
- It stores settings, optional API credentials, page bindings, cached snapshots, and import/export payloads in the user's Chrome profile.
- It uses optional host permissions only for supported provider origins.
- It uses packaged extension scripts and does not load remote executable code.
- User-configured custom JSON sources are fetched as JSON with browser
  credentials omitted. The response is validated and normalized; raw response
  bodies are not stored, HTML is not rendered, and scripts are not executed.

## Sensitive Data Rules

- Do not commit real API keys, cookies, auth headers, personal account exports, or screenshots that reveal private account information.
- When adding fixtures, redact account identifiers and provider-specific private values.
- When adding store screenshots, use the repository screenshot request/archive workflow so truth boundaries and operator notes stay attached to the image set.
- Do not commit real custom source endpoint secrets, private endpoint payloads,
  or exported configuration files that reveal private service URLs.
