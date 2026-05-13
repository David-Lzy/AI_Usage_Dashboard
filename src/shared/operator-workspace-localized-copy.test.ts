import { describe, expect, it } from "vitest";

import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "./i18n";
import { buildOperatorWorkspaceLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildOperatorWorkspaceLocalizedCopy } from "./operator-workspace-localized-copy";

describe("buildOperatorWorkspaceLocalizedCopy", () => {
  it("builds English interaction audit and theme recovery copy", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.interactionAudit.topbar.title).toBe("Interaction Audit");
    expect(copy.interactionAudit.signoff.pass).toBe("Pass");
    expect(copy.interactionAudit.reviewQueue.label).toBe("Review Queue");
    expect(copy.interactionAudit.reviewQueue.queueStatus.followUp).toBe(
      "Follow-up required",
    );
    expect(copy.interactionAudit.surfaceCard.sectionLabel).toBe(
      "Audit Surface",
    );
    expect(copy.interactionAudit.surfaceCard.signoffStatus.followUp).toBe(
      "Follow-up required",
    );
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
    expect(copy.interactionAudit.reviewQueue.nextTarget).toBe("下一个目标");
    expect(copy.interactionAudit.surfaceCard.openStandalone).toBe("单独打开");
    expect(copy.themeRecovery.currentTruth.reviewStage).toBe("复查阶段");
  });

  it("builds explicit operator workspace copy for every shipped locale", () => {
    const expectedTitles = {
      en: {
        interactionAudit: "Interaction Audit",
        themeRecovery: "Theme Recovery Review",
      },
      "zh-CN": {
        interactionAudit: "交互审计",
        themeRecovery: "主题恢复审核",
      },
      "zh-TW": {
        interactionAudit: "互動稽核",
        themeRecovery: "主題恢復審核",
      },
      ja: {
        interactionAudit: "インタラクション監査",
        themeRecovery: "テーマ復旧レビュー",
      },
      ko: {
        interactionAudit: "상호작용 감사",
        themeRecovery: "테마 복구 검토",
      },
      "es-419": {
        interactionAudit: "Auditoría de interacción",
        themeRecovery: "Revisión de recuperación de tema",
      },
      "pt-BR": {
        interactionAudit: "Auditoria de interação",
        themeRecovery: "Revisão de recuperação de tema",
      },
      fr: {
        interactionAudit: "Audit d'interaction",
        themeRecovery: "Revue de récupération du thème",
      },
      de: {
        interactionAudit: "Interaktionsaudit",
        themeRecovery: "Theme-Recovery-Review",
      },
      it: {
        interactionAudit: "Audit interazioni",
        themeRecovery: "Revisione recupero tema",
      },
      ru: {
        interactionAudit: "Аудит взаимодействий",
        themeRecovery: "Проверка восстановления темы",
      },
      ar: {
        interactionAudit: "تدقيق التفاعل",
        themeRecovery: "مراجعة استعادة theme",
      },
      hi: {
        interactionAudit: "इंटरैक्शन audit",
        themeRecovery: "Theme recovery समीक्षा",
      },
      id: {
        interactionAudit: "Audit interaksi",
        themeRecovery: "Review pemulihan theme",
      },
    } as const;

    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n(locale));

      expect(copy.interactionAudit.topbar.title).toBe(
        expectedTitles[locale].interactionAudit,
      );
      expect(copy.themeRecovery.topbar.title).toBe(
        expectedTitles[locale].themeRecovery,
      );
      expect(copy.interactionAudit.guidance.checks).toHaveLength(3);
      expect(copy.interactionAudit.reviewQueue.label.length).toBeGreaterThan(0);
      expect(
        copy.interactionAudit.reviewQueue.itemMeta({
          signoffLabel: copy.interactionAudit.reviewQueue.signoffStatus.pass,
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
        }),
      ).toContain("1");
      expect(copy.interactionAudit.surfaceCard.sectionLabel.length).toBeGreaterThan(
        0,
      );
      expect(copy.themeRecovery.workflow.steps).toHaveLength(5);
    }
  });

  it("uses explicit Arabic copy for interaction audit and theme recovery", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n("ar"));

    expect(copy.interactionAudit.hero.title).toContain("مراجعة");
    expect(copy.interactionAudit.reviewQueue.pendingChecks(3)).toContain("3");
    expect(copy.interactionAudit.surfaceCard.notesPlaceholder).toContain(
      "surface",
    );
    expect(copy.themeRecovery.outputs.clipboardUnavailable).toContain(
      "clipboard",
    );
    expect(copy.themeRecovery.links.sidePanel.settings).toBe("فتح الإعدادات");
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(copy.themeRecovery.topbar.title).toBe("Theme Recovery Review");
  });
});
