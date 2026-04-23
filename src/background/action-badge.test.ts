import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildActionBadgeModel } from "./action-badge";

describe("action badge", () => {
  it("clears the badge when no visible provider needs attention", () => {
    const model = buildActionBadgeModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: "granted",
      })),
    });

    expect(model.text).toBe("");
    expect(model.title).toContain("all visible providers are healthy");
  });

  it("shows the number of visible providers needing attention", () => {
    const model = buildActionBadgeModel(SAMPLE_APP_STATE);

    expect(model.text).toBe("3");
    expect(model.title).toContain("3 visible providers need attention");
    expect(model.backgroundColor).toEqual([161, 84, 0, 255]);
  });
});
