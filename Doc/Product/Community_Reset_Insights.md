# Community Reset Insights

Date: 2026-10-13

Document class:

- maintained technical reference

Freshness model:

- update when public feed contracts, permissions or notification rules change

Status note:

- optional community context in the in-progress provider insights update
- not an official account service or a claim about the currently published Store build

## Sources And Meaning

The extension implements its own bounded readers for
[codex-resets.com](https://codex-resets.com/api/docs) and
[codex-reset.com](https://codex-reset.com/developers). No upstream executable,
classifier, website markup or JavaScript is incorporated. Every consumer carries
the source's name and homepage link on the same surface.

The plural-domain v1 status/list contract distinguishes regular resets, banked
grants, explicitly scheduled announcements and active watches. The singular
domain's documented timeline classification uses `group` and
`announcement_state`; explicit `banked_state` is separate. Generic credits are
not inferred to be reset cards from their text. Only documented rounded forecast
probabilities are retained, never the site's undocumented signal score.

These are **community reports**, not proof that the current account reset or
received anything. Predictions and announced schedules never change personal
quota, deadline, money, reset-card count or notification eligibility. Passing a
scheduled time does not change its state. Null, unsupported and malformed fields
remain unavailable rather than becoming zero.

Canonical X/Twitter post identities (without tracking parameters) merge the same
announcement across sources. This preserves both attributions, not two independent
confirmations. Different classifications of the same post remain a conflict;
observations without traceable announcement evidence stay display-only. No fuzzy
text matching combines unrelated posts.

## Local Preferences And Requests

The separate local preference is Off / In-app / In-app and desktop; Off is the
initial value. Both sources are initially selected, but selecting a source alone
does not contact it. A user gesture requests only the selected exact HTTPS
origins, with optional notifications access for desktop delivery. Background
polling never prompts for permissions. A denied or revoked source stays unavailable
without affecting the other source or personal sync.

The approximately five-minute alarm is independent of provider refresh. Fixed
HTTPS GET endpoints are the plural `/api/v1/status` and `/api/v1/resets?limit=20`,
and singular `/api/timeline` and `/api/forecast`. Requests omit credentials and
referrers, reject redirects and have an eight-second timeout and 512 KiB streamed
response limit. They send no account-derived parameters or custom User-Agent in
the browser. Project-identified server-side research uses the site's documented
identification requirement; extension traffic follows its documented browser
example with visible credit.

Readers coalesce simultaneous requests, retain conditional ETags, honor
Cache-Control/Age and published expiry headers, and apply exponential backoff and
Retry-After. They keep at most 100 normalized events per endpoint and read only
the first bounded page, not an unbounded historical crawl. Failed/stale data keeps
its last successful capture time; HTTP success or 304 is not a new reset.

Disabling a source aborts pending work and invalidates its generation. Late
responses cannot restore disabled preferences or data. Worker restart reconstructs
the optional alarm. Screenshot QA locks suppress requests. No provider tab is
opened, refreshed or focused by this polling.

## Privacy And Delivery Boundary

The community cache/preferences are a distinct machine-local key, not AppState,
provider account snapshots, configuration export or Chrome Sync. Only normalized
public summaries, attribution, timestamps and cache metadata are stored; raw
response bodies and arbitrary payload fields are discarded. Site operators still
receive ordinary network metadata such as IP address.

The feed layer does not itself deliver desktop notifications. Notification
eligibility and durable deduplication are evaluated separately, with first-enable,
pause, account identity, conflict and freshness safeguards. Browser exit, sleep or
OS notification suppression can delay or prevent delivery; no new daemon is added.

## Verification

Contract, cache/network and controller tests are in
`src/shared/community-reset-feeds.test.ts`,
`src/shared/community-reset-client.test.ts`,
`src/background/community-reset-fetch.test.ts` and
`src/background/community-reset-controller.test.ts`. They use synthetic public
payloads and mocked permissions/network, including cancellation and worker restart.
