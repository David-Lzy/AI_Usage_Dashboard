import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";

const { createJetBrainsConsoleClientMock } = vi.hoisted(() => ({
  createJetBrainsConsoleClientMock: vi.fn(),
}));

vi.mock("./official", () => ({
  createJetBrainsConsoleClient: createJetBrainsConsoleClientMock,
}));

import { syncJetBrainsProvider } from "./adapter";

const baseProvider: ProviderSnapshot = {
  providerId: "jetbrains",
  providerLabel: "JetBrains AI",
  planName: "Unknown",
  quotaUnit: "credits",
  quotaWindow: "monthly",
  used: null,
  remaining: null,
  total: null,
  resetAt: "Unknown",
  resetLabel: "Unknown",
  syncedAt: "Unknown",
  syncSource: "page_parse",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "Never synced",
  sourceSelectionReason: "",
  sourceFallbackReason: null,
  tone: "neutral",
};

const grantedSetting: ProviderSetting = {
  id: "jetbrains",
  label: "JetBrains AI",
  enabled: true,
  status: "granted",
  credentialStatus: "not_required",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "account.jetbrains.com · jetbrains.com",
  hostOrigins: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
  description: "Needed for current AI Credits usage pages.",
};

describe("syncJetBrainsProvider", () => {
  beforeEach(() => {
    createJetBrainsConsoleClientMock.mockReset();
  });

  it("normalizes the live Users and licensing page into a provider snapshot", async () => {
    const attemptedAt = new Date(2026, 3, 20, 11, 34);
    createJetBrainsConsoleClientMock.mockReturnValue({
      getUsersAndLicensingPage: vi.fn(async () => ({
        status: "ok",
        pageBinding: createEmptyPageBinding(),
        page: {
          html: `
            <main data-page="users-and-licensing">
              <h1>Users and licensing</h1>
              <section aria-label="Users licensed for AI">
                <p data-field="licensed-users-count">12</p>
                <span data-field="users-almost-out-of-ai-credits-count">2</span>
              </section>
              <section aria-label="Top-up AI Credits available">
                <p data-field="top-up-ai-credits-available">145</p>
              </section>
              <table>
                <tbody>
                  <tr data-user-row="1">
                    <td data-field="name">Alex</td>
                    <td data-field="email">alex@company.com</td>
                    <td data-field="licenses-and-quotas">
                      <ul>
                        <li data-license-name="AI Pro"><span data-field="used">8</span><span data-field="included">20</span></li>
                        <li data-license-name="All Products Pack"><span data-field="used">4</span><span data-field="included">20</span></li>
                      </ul>
                    </td>
                    <td data-field="balance-used-percent">54%</td>
                    <td data-field="top-up-usage">2</td>
                    <td data-field="top-up-limit">10</td>
                  </tr>
                  <tr data-user-row="2">
                    <td data-field="name">Morgan</td>
                    <td data-field="email">morgan@company.com</td>
                    <td data-field="licenses-and-quotas">
                      <ul>
                        <li data-license-name="AI Ultimate"><span data-field="used">60</span><span data-field="included">70</span></li>
                      </ul>
                    </td>
                    <td data-field="balance-used-percent">86%</td>
                    <td data-field="top-up-usage">0</td>
                    <td data-field="top-up-limit">15</td>
                  </tr>
                </tbody>
              </table>
            </main>
          `,
        },
      })),
    });

    const { snapshot } = await syncJetBrainsProvider({
      provider: baseProvider,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.providerLabel).toBe("JetBrains AI");
    expect(snapshot.planName).toBe("JetBrains Console (12 licensed)");
    expect(snapshot.used).toBe(72);
    expect(snapshot.total).toBe(110);
    expect(snapshot.remaining).toBe(38);
    expect(snapshot.resetAt).toBe("Renews every 30 days");
    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "2 users are almost out of monthly AI Credits",
    );
    expect(snapshot.lastSyncLabel).toBe("JetBrains Console synced just now");
    expect(snapshot.syncedAt).toBe("2026-04-20 11:34");
    expect(createJetBrainsConsoleClientMock).toHaveBeenCalledWith({
      source: "live",
    });
  });

  it("returns a readable error snapshot when JetBrains access is missing", async () => {
    const attemptedAt = new Date(2026, 3, 20, 11, 34);
    const { snapshot } = await syncJetBrainsProvider({
      provider: baseProvider,
      setting: {
        ...grantedSetting,
        status: "missing",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toContain(
      "JetBrains Central Console access is not configured",
    );
    expect(snapshot.lastSyncLabel).toBe("JetBrains Console access required");
  });

  it("surfaces live-capture errors without silently falling back to fixture numbers", async () => {
    const attemptedAt = new Date(2026, 3, 20, 11, 34);
    createJetBrainsConsoleClientMock.mockReturnValue({
      getUsersAndLicensingPage: vi.fn(async () => ({
        status: "open_page_required",
        reason:
          "Open the JetBrains Console Users and licensing page in a browser tab, then refresh again.",
        pageBinding: createEmptyPageBinding(),
      })),
    });

    const { snapshot } = await syncJetBrainsProvider({
      provider: baseProvider,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toContain(
      "Open the JetBrains Console Users and licensing page",
    );
    expect(snapshot.lastSyncLabel).toBe("JetBrains Console page not open");
  });

  it("surfaces unsupported org-account access as an error instead of pretending the page is merely closed", async () => {
    const attemptedAt = new Date(2026, 3, 20, 11, 34);
    createJetBrainsConsoleClientMock.mockReturnValue({
      getUsersAndLicensingPage: vi.fn(async () => ({
        status: "access_unavailable",
        reason:
          "The current JetBrains account does not expose a usable organization Users and licensing page. Switch to an organization account with AI visibility, then refresh again.",
        pageBinding: createEmptyPageBinding(),
      })),
    });

    const { snapshot } = await syncJetBrainsProvider({
      provider: baseProvider,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toContain(
      "does not expose a usable organization Users and licensing page",
    );
    expect(snapshot.lastSyncLabel).toBe("JetBrains org access unavailable");
    expect(snapshot.resetLabel).toBe(
      "Use a JetBrains organization account with AI visibility",
    );
  });
});
