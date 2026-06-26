# Custom JSON Sources

Date: 2026-06-27

Document class:

- maintained user reference

Freshness model:

- maintained current behavior

Status note:

- this document describes the public custom source JSON protocol and user-visible
  privacy/security boundaries

## Purpose

Custom JSON sources let users show quota or usage data that is not covered by a
verified built-in provider. The extension acts as a local client: it periodically
fetches a user-configured HTTP or HTTPS endpoint, validates the JSON response,
stores a normalized snapshot, and displays it as a clearly marked custom source.

Custom sources are not verified or endorsed by AI Usage Dashboard. They are
displayed separately from built-in providers and use a `Custom` label.

## Endpoint Behavior

- Endpoints may use `http://` or `https://`.
- Non-network schemes such as `file:`, `data:`, `javascript:`,
  `chrome-extension:`, and `moz-extension:` are rejected.
- Chrome may prompt for optional host access to the configured endpoint origin.
- The extension sends a `GET` request with `Accept: application/json`.
- Requests use `credentials: omit`; browser cookies are not sent.
- Current custom sources do not store or send custom headers, auth tokens, or
  API keys.
- Redirects follow normal browser fetch behavior.
- The request times out after 10 seconds.
- The response body must be JSON text.
- The raw response body is parsed, normalized, and then discarded.
- HTML is never rendered, and scripts are never executed.

The response body is capped at 128 KB. Oversized responses are rejected before
display.

## JSON Schema

Every response must be a JSON object with this schema id:

```json
{
  "schema": "ai-usage-dashboard.custom-source.v1"
}
```

Required fields:

- `schema`: must be `ai-usage-dashboard.custom-source.v1`
- `label`: display name for the response
- `status`: one of `ok`, `warning`, or `error`
- at least one display payload: `summary`, `quota`, `windows`, `balances`, or
  `facts`

Optional top-level fields:

- `id`: endpoint-defined id for display/debugging
- `description`: short source description
- `tone`: one of `neutral`, `warning`, or `error`; defaults from `status`
- `syncedAt`: timestamp string from the endpoint
- `summary`: short human-readable summary
- `quota`: primary metric object
- `windows`: array of metric objects, max 8
- `balances`: array of metric objects, max 8
- `facts`: array of fact objects, max 16
- `warningReason`: short warning or error detail, or `null`

Metric object fields:

- `label`: metric label; required in `windows` and `balances`, optional in
  `quota`
- `unit`: required display unit, such as `percent`, `minutes`, `credits`,
  `requests`, or `sessions`
- `window`: optional window label, such as `daily`, `weekly`, or `monthly`
- `used`: optional non-negative number
- `remaining`: optional non-negative number
- `total`: optional non-negative number
- `resetAt`: optional timestamp string
- `resetLabel`: optional human-readable reset label

Each metric must include at least one of `used`, `remaining`, or `total`. If the
unit is `percent` and `used` or `remaining` is provided without `total`, the
extension treats `total` as `100`.

Fact object fields:

- `label`: required display label
- `value`: required display value; strings and numbers are accepted
- `detail`: optional short detail

Display strings are normalized for whitespace and length. HTML-like text that
contains `<` or `>` is rejected for custom source display fields.

## Minimum Valid Response

```json
{
  "schema": "ai-usage-dashboard.custom-source.v1",
  "label": "Build Quota",
  "status": "ok",
  "quota": {
    "unit": "minutes",
    "remaining": 90,
    "total": 100
  }
}
```

## Full Response

```json
{
  "schema": "ai-usage-dashboard.custom-source.v1",
  "id": "build-quota",
  "label": "Build Quota",
  "description": "Internal CI usage",
  "status": "warning",
  "tone": "warning",
  "syncedAt": "2026-06-27T02:30:00.000Z",
  "summary": "90 of 100 build minutes remaining",
  "quota": {
    "label": "Monthly build minutes",
    "unit": "minutes",
    "window": "monthly",
    "used": 10,
    "remaining": 90,
    "total": 100,
    "resetLabel": "Resets July 1"
  },
  "windows": [
    {
      "label": "Daily quota",
      "unit": "percent",
      "window": "daily",
      "used": 30,
      "remaining": 70,
      "resetLabel": "Resets tomorrow"
    },
    {
      "label": "Weekly quota",
      "unit": "requests",
      "window": "weekly",
      "used": 140,
      "remaining": 360,
      "total": 500,
      "resetAt": "2026-07-01T00:00:00.000Z"
    }
  ],
  "balances": [
    {
      "label": "Credit balance",
      "unit": "credits",
      "remaining": 12
    }
  ],
  "facts": [
    {
      "label": "Plan",
      "value": "Team",
      "detail": "Synced from an internal service"
    }
  ],
  "warningReason": "Below preferred reserve"
}
```

## Warning Or Error Response

Use `status: "warning"` or `status: "error"` when the endpoint can respond but
the underlying service needs attention. Include `warningReason` for the user.

```json
{
  "schema": "ai-usage-dashboard.custom-source.v1",
  "label": "Internal Gateway",
  "status": "error",
  "tone": "error",
  "summary": "Quota service is degraded",
  "facts": [
    {
      "label": "Last good sync",
      "value": "2026-06-27 01:45"
    }
  ],
  "warningReason": "Upstream quota API returned HTTP 503"
}
```

## Display And Refresh

Users configure each custom source in Settings. A source has:

- display name
- optional description
- endpoint URL
- enabled/disabled state
- refresh interval

Manual refresh fetches enabled custom sources immediately. Automatic refresh
uses the configured interval on the extension's normal alarm path. If a fetch
fails after a previous success, the old normalized snapshot can remain visible
with a stale or warning state.

Custom source snapshots can appear in:

- toolbar popup
- side panel dashboard
- full-page dashboard
- Provider Display ordering controls
- progress item visibility controls
- toolbar badge candidates when a custom metric has numeric `remaining`

When the toolbar icon is configured to match the selected badge, custom source
badges use the default extension icon because custom sources do not have a
verified provider favicon.

## Storage, Export, And Privacy

The extension stores custom source settings and normalized snapshots in the
user's browser profile. Configuration export includes custom source settings
such as id, label, description, endpoint URL, enabled state, and refresh
interval. It does not include raw response bodies.

Current custom sources do not store request headers, API tokens, cookies, or
provider page body text. If a future version adds authenticated custom source
headers, this document, `PRIVACY.md`, and `SECURITY.md` must be updated before
shipping that change.

Only configure endpoints you trust. Even though response text is validated and
not executed, endpoint URLs and normalized display values can appear in local
extension storage, UI, and exported configuration files.
