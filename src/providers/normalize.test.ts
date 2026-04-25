import { describe, expect, it } from "vitest";

import { buildUsageSignal } from "./normalize";

describe("buildUsageSignal", () => {
  it("returns typed overage diagnostics while preserving raw warning messages", () => {
    const signal = buildUsageSignal(320, 1000, 80, "requests", 15, "cursor");

    expect(signal.syncStatus).toBe("warning");
    expect(signal.tone).toBe("warning");
    expect(signal.warningReason).toBe(
      "15 pay-per-use requests recorded this cycle",
    );
    expect(signal.warningDiagnostic).toMatchObject({
      code: "usage.overage_detected",
      category: "usage_threshold",
      severity: "warning",
      rawMessage: signal.warningReason,
      params: {
        providerId: "cursor",
        usageThresholdKind: "overage_detected",
        overageCount: 15,
        unitLabel: "requests",
      },
    });
  });

  it("returns typed threshold diagnostics while preserving raw warning messages", () => {
    const signal = buildUsageSignal(820, 1000, 80, "credits", 0, "jetbrains");

    expect(signal.syncStatus).toBe("warning");
    expect(signal.tone).toBe("warning");
    expect(signal.warningReason).toBe("82% of included credits consumed");
    expect(signal.warningDiagnostic).toMatchObject({
      code: "usage.threshold_warning",
      category: "usage_threshold",
      severity: "warning",
      rawMessage: signal.warningReason,
      params: {
        providerId: "jetbrains",
        usageThresholdKind: "threshold_warning",
        usagePercent: 82,
        thresholdPercent: 80,
        unitLabel: "credits",
      },
    });
  });
});
