import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "./i18n";
import {
  buildProviderDetailLocalizedCopy as buildReexportedCopy,
  getPermissionStatusLabel as getReexportedPermissionStatusLabel,
  getProviderDetailStatusBadgeLabel as getReexportedStatusBadgeLabel,
} from "./localized-copy";
import {
  buildProviderDetailLocalizedCopy,
  getPermissionStatusLabel,
  getProviderDetailStatusBadgeLabel,
} from "./provider-detail-localized-copy";

describe("provider detail localized copy", () => {
  it("builds English provider detail labels and badge fallbacks", () => {
    const copy = buildProviderDetailLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.sections.providerDetail).toBe("Provider Detail");
    expect(copy.values.usedAndRemaining("42%", "58%")).toBe(
      "42% used · 58% remaining",
    );
    expect(getProviderDetailStatusBadgeLabel("missing", "ok", copy)).toBe(
      "Needs access",
    );
    expect(getProviderDetailStatusBadgeLabel("granted", "warning", copy)).toBe(
      "Warning",
    );
    expect(getPermissionStatusLabel("granted", copy)).toBe("Granted");
  });

  it("builds Simplified Chinese provider detail labels", () => {
    const copy = buildProviderDetailLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.sections.syncStatus).toBe("同步状态");
    expect(copy.badges.syncIssue).toBe("同步异常");
    expect(copy.values.remainingOnly("58%")).toBe("剩余 58%");
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(getReexportedStatusBadgeLabel("granted", "ok", copy)).toBe(
      "Healthy",
    );
    expect(getReexportedPermissionStatusLabel("missing", copy)).toBe("Missing");
  });
});
