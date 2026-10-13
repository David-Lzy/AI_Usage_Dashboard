import { describe, expect, it } from "vitest";
import { resetNotificationClickUrl, resetNotificationText } from "./reset-notification-runtime";
import { SUPPORTED_APP_LOCALES } from "../shared/i18n";
import { normalizeResetNotificationStore } from "../shared/reset-notifications";

describe("sanitized reset messages and click targets", () => {
  it("localizes all fixed copy and visibly credits both sources without raw source text or account data", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const message = resetNotificationText({ kind: "community_report", keys: ["private-ledger-key"], types: ["reset", "grant"], sources: ["codex-resets", "codex-reset"], target: { kind: "community", source: "codex-resets" } }, locale);
      expect(message.title.length).toBeGreaterThan(4);
      expect(message.message).toContain("https://codex-resets.com/");
      expect(message.message).toContain("https://codex-reset.com/");
      expect(message.message).not.toContain("private-ledger-key");
      const grant = resetNotificationText({ kind: "account_grant", accountKey: "raw-account-alias", identity: "private-identity", capturedAt: "2026-10-13T06:00:00Z",
        target: { kind: "account", providerId: "codex-personal-page", accountKey: '["codex-personal-page","default"]' } }, locale);
      expect(JSON.stringify(grant)).not.toMatch(/raw-account|private-identity|2026-10-13|\$/);
    }
  });
  it("opens only fixed source homepages or account-matching extension details", () => {
    const extension = (path: string) => `chrome-extension://test/${path}`;
    expect(resetNotificationClickUrl({ kind: "community", source: "codex-reset" }, extension, null)).toBe("https://codex-reset.com/");
    const target = { kind: "account" as const, providerId: "codex-personal-page" as const, accountKey: '["codex-personal-page","default"]' };
    expect(resetNotificationClickUrl(target, extension, "default")).toContain("#provider-detail/codex-personal-page");
    expect(resetNotificationClickUrl(target, extension, "another")).toContain("#settings/section/settings-quick-setup");
    expect(normalizeResetNotificationStore({ schemaVersion: 1, clicks: { "ai-usage-reset-00000000-0000-4000-8000-000000000001": {
      createdAt: "2026-10-13T06:00:00Z", target: { kind: "community", source: "https://evil.test/" },
    } } }).clicks).toEqual({});
  });
});
