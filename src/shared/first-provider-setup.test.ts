import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "./constants";
import { getRecommendedFirstSetupProvider } from "./first-provider-setup";

describe("getRecommendedFirstSetupProvider", () => {
  it("recommends Codex before other disabled providers for the personal first-run path", () => {
    const provider = getRecommendedFirstSetupProvider(
      SAMPLE_APP_STATE.providerSettings.map((setting) => ({
        ...setting,
        enabled: false,
      })),
    );

    expect(provider?.id).toBe("codex");
  });

  it("keeps JetBrains out of the default recommendation when another disabled provider is available", () => {
    const provider = getRecommendedFirstSetupProvider(
      SAMPLE_APP_STATE.providerSettings
        .filter((setting) => setting.id === "jetbrains" || setting.id === "cursor")
        .map((setting) => ({
          ...setting,
          enabled: false,
        })),
    );

    expect(provider?.id).toBe("cursor");
  });
});
