import { afterEach, describe, expect, it, vi } from "vitest";
import manifest from "../manifest.json";
import { createDefaultAppState } from "../shared/production-state";
import { buildConfigurationBackup } from "../shared/configuration-backup";
import { createSanitizedDiagnostics } from "../shared/sanitized-diagnostics";
import { QUOTA_NOTIFICATION_STORAGE_KEY, normalizeQuotaNotificationStore } from "../shared/quota-notifications";
import { quotaNotificationController, quotaNotificationPermission } from "./quota-notification-runtime";
import { APP_STATE_STORAGE_KEY } from "../shared/constants";
import { SUPPORTED_APP_LOCALES } from "../shared/i18n";

afterEach(() => vi.unstubAllGlobals());
describe("notification runtime permissions and local storage", () => {
  it("declares notifications only as optional and supports Firefox without OS permission probing", async () => {
    expect(manifest.optional_permissions).toContain("notifications");
    expect(manifest.permissions).not.toContain("notifications");
    vi.stubGlobal("browser", { runtime: { id: "qa" }, permissions: { contains: async () => true }, notifications: { create: vi.fn() } });
    expect(await quotaNotificationPermission()).toBe("granted");
    vi.stubGlobal("browser", { runtime: { id: "qa" }, permissions: { contains: async () => false } });
    expect(await quotaNotificationPermission()).toBe("denied");
    vi.unstubAllGlobals();
    expect(await quotaNotificationPermission()).toBe("unsupported");
  });
  it("honors OS-level denial or errors even after the extension permission was granted", async () => {
    const getPermissionLevel = vi.fn(async () => "denied");
    vi.stubGlobal("chrome", { runtime: { id: "qa" }, permissions: { contains: async () => true }, notifications: { create: vi.fn(), getPermissionLevel } });
    expect(await quotaNotificationPermission()).toBe("denied");
    getPermissionLevel.mockRejectedValueOnce(new Error("OS unavailable"));
    expect(await quotaNotificationPermission()).toBe("denied");
  });
  it("delivers localized basic notifications without credentials, account labels or raw source text", async () => {
    const state = createDefaultAppState();
    state.settings.locale = "zh-CN";
    const secret = "NEVER_NOTIFICATION_SECRET";
    state.providers[0].providerLabel = secret;
    state.providers[0].warningReason = secret;
    const store = normalizeQuotaNotificationStore(undefined);
    store.preferences.enabled = true;
    const create = vi.fn(async () => "notification-id");
    const get = vi.fn(async (key: string) => key === APP_STATE_STORAGE_KEY ? { [key]: state }
      : key === QUOTA_NOTIFICATION_STORAGE_KEY ? { [key]: store } : {});
    vi.stubGlobal("chrome", { runtime: { id: "qa", getURL: (path: string) => `chrome-extension://qa/${path}` },
      permissions: { contains: async () => true }, notifications: { create }, storage: { local: { get, set: vi.fn(async () => {}) } } });
    expect(await quotaNotificationController.handle({ type: "quota-notifications:test" })).toMatchObject({ ok: true, tested: true });
    const [id, notification] = create.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(id).toMatch(/^ai-usage-dashboard-quota-/);
    expect(notification).toMatchObject({ type: "basic", iconUrl: "chrome-extension://qa/icons/icon128.png", title: "配额通知已开启" });
    expect(JSON.stringify(create.mock.calls)).not.toContain(secret);
    expect(JSON.stringify(buildConfigurationBackup(state))).not.toContain("disabledWindowKeys");
    expect(JSON.stringify(createSanitizedDiagnostics(state, { appVersion: "0.2.0-rc.13" }))).not.toContain("disabledWindowKeys");
  });
  it.each(SUPPORTED_APP_LOCALES)("formats a real low event in %s without unresolved placeholders or private model text", async (locale) => {
    const state = createDefaultAppState();
    state.settings.locale = locale;
    const snapshot = state.providers.find((provider) => provider.providerId === "codex-personal-page")!;
    state.providerSettings.find((provider) => provider.id === snapshot.providerId)!.status = "granted";
    const now = Date.now();
    Object.assign(snapshot, { syncStatus: "ok", lastAttemptAt: new Date(now - 2000).toISOString(), lastSuccessAt: new Date(now - 2000).toISOString(), usageWindows: [{ label: "PRIVATE_MODEL_SENTINEL", normalizedLabel: "PRIVATE_MODEL_SENTINEL", modelLabel: "PRIVATE_MODEL_SENTINEL", kind: "model_weekly", quotaUnit: "percent", used: 30, remaining: 70, total: 100, resetAt: new Date(now + 3600_000).toISOString(), resetLabel: null }] });
    let store = normalizeQuotaNotificationStore(undefined);
    store.preferences.enabled = true;
    const create = vi.fn(async () => "id");
    vi.stubGlobal("chrome", { runtime: { id: "qa", getURL: (path: string) => `chrome-extension://qa/${path}` }, permissions: { contains: async () => true }, notifications: { create }, storage: { local: {
      get: async (key: string) => key === APP_STATE_STORAGE_KEY ? { [key]: state } : key === QUOTA_NOTIFICATION_STORAGE_KEY ? { [key]: store } : {},
      set: async (value: Record<string, typeof store>) => { store = value[QUOTA_NOTIFICATION_STORAGE_KEY]; },
    } } });
    await quotaNotificationController.evaluate();
    snapshot.lastAttemptAt = snapshot.lastSuccessAt = new Date(now - 1000).toISOString();
    snapshot.usageWindows![0].used = 90;
    snapshot.usageWindows![0].remaining = 10;
    await quotaNotificationController.evaluate();
    expect(create).toHaveBeenCalledTimes(1);
    const output = JSON.stringify(create.mock.calls);
    expect(output).not.toContain("PRIVATE_MODEL_SENTINEL");
    expect(output).not.toContain("{provider}");
    expect(output).not.toContain("{remaining}");
    expect(output).toContain("Codex Personal");
  });
});
