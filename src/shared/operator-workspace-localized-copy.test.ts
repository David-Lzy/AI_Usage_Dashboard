import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "./i18n";
import { buildOperatorWorkspaceLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildOperatorWorkspaceLocalizedCopy } from "./operator-workspace-localized-copy";

describe("buildOperatorWorkspaceLocalizedCopy", () => {
  it("builds English interaction audit and theme recovery copy", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.interactionAudit.topbar.title).toBe("Interaction Audit");
    expect(copy.interactionAudit.signoff.pass).toBe("Pass");
    expect(copy.themeRecovery.hero.title).toBe(
      "One place to stage native-prompt and real-session recovery checks",
    );
    expect(copy.themeRecovery.outputs.copyJson).toBe("Copy JSON");
  });

  it("builds Simplified Chinese operator workspace copy", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.interactionAudit.hero.eyebrow).toBe("审计中心");
    expect(copy.interactionAudit.signoff.reviewedSurfaces).toBe(
      "已复查 surface",
    );
    expect(copy.themeRecovery.currentTruth.reviewStage).toBe("复查阶段");
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(copy.themeRecovery.topbar.title).toBe("Theme Recovery Review");
  });
});
