# Page Session Fixture Conventions

Date: 2026-05-11

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical maintained fixture-safety reference
- refresh it whenever page-session fixture structure, redaction rules, or provider-note capture conventions change

## Purpose

- keep page-sourced provider fixtures safe, small, and reusable

## Rules

- never store raw cookies, auth headers, or copied session tokens in fixtures
- redact email addresses, account ids, workspace ids, and billing identifiers unless the exact format is needed for parser coverage
- prefer one fixture per source surface:
  - page HTML
  - boot data payload
  - observed network response
- when possible, keep each fixture to the minimum slice required by the parser
- if a response body is huge, trim it to the smallest shape that still proves the extraction path

## Suggested Layout

- `fixtures/<provider>/<page-name>.fixture.html`
- `fixtures/<provider>/<page-name>.boot.fixture.json`
- `fixtures/<provider>/<page-name>.network.fixture.json`

## Validation Checklist

- confirm no raw cookie names or bearer tokens are present
- confirm the fixture still contains the selectors or JSON keys the parser depends on
- confirm the provider note points to the fixture and explains its source type
