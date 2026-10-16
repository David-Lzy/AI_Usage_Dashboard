import { describe, expect, it } from "vitest";
import { createDefaultAppState } from "./production-state";
import { buildConfigurationBackup } from "./configuration-backup";
import { createSanitizedDiagnostics } from "./sanitized-diagnostics";
import { COMMUNITY_RESET_STORAGE_KEY } from "./community-reset-feeds";
import { RESET_NOTIFICATION_STORAGE_KEY } from "./reset-notifications";
import { CODEX_RESET_CAPTURE_KEY } from "./codex-reset-capture";
import { LOCAL_COMPANION_PAIRING_KEY } from "./local-companion-pairing";

describe("insight privacy projection", () => {
  it("excludes machine cache, identity, pairing and raw insight material from both portable formats and diagnostics", () => {
    const state = createDefaultAppState();
    const secret = "PRIVATE_INSIGHT_SENTINEL_DO_NOT_EXPORT";
    for (const key of [COMMUNITY_RESET_STORAGE_KEY, RESET_NOTIFICATION_STORAGE_KEY, CODEX_RESET_CAPTURE_KEY, LOCAL_COMPANION_PAIRING_KEY]) {
      Object.assign(state, { [key]: { identity: secret, token: secret, rawBody: secret, clicks: [secret] } });
    }
    Object.assign(state.providers.find((provider) => provider.providerId === "codex-personal-page")!, {
      usageInsights: { rawAccountId: secret, rawBody: secret, prompts: [secret] },
    });
    for (const includeCustomToolbarIconImage of [true, false]) {
      const text = JSON.stringify(buildConfigurationBackup(state, { includeCustomToolbarIconImage }));
      expect(text).not.toContain(secret);
      for (const key of [COMMUNITY_RESET_STORAGE_KEY, RESET_NOTIFICATION_STORAGE_KEY, CODEX_RESET_CAPTURE_KEY, LOCAL_COMPANION_PAIRING_KEY]) expect(text).not.toContain(key);
    }
    const text = JSON.stringify(createSanitizedDiagnostics(state, { appVersion: "0.2.2", generatedAt: new Date("2026-10-13T10:00:00Z") }));
    expect(text).not.toContain(secret); expect(text).not.toContain("usageInsights");
  });
});
