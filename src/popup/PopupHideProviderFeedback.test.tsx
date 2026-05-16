import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import { PopupHideProviderFeedback } from "./PopupHideProviderFeedback";
import { buildPopupHideProviderFeedbackCopy } from "./popup-hide-provider-feedback-copy";

describe("PopupHideProviderFeedback", () => {
  it("renders the undo countdown as a compact Material-style status chip", () => {
    const runtimeI18n = createRuntimeI18n("zh-CN");
    const html = renderToStaticMarkup(
      <PopupHideProviderFeedback
        copy={buildPopupHideProviderFeedbackCopy(runtimeI18n)}
        feedback={{
          kind: "undo",
          providerId: "codex-personal-page",
          providerLabel: "Codex Personal",
          secondsRemaining: 3,
        }}
        undoSeconds={3}
        onOpenSettings={() => undefined}
        onUndo={() => undefined}
      />,
    );

    expect(html).toContain("popup-hide-feedback--undo");
    expect(html).toContain("已隐藏 Codex Personal");
    expect(html).toContain("撤销");
    expect(html).toContain("--popup-hide-feedback-progress:100%");
  });

  it("renders the settings notice after undo expires", () => {
    const runtimeI18n = createRuntimeI18n("en");
    const html = renderToStaticMarkup(
      <PopupHideProviderFeedback
        copy={buildPopupHideProviderFeedbackCopy(runtimeI18n)}
        feedback={{
          kind: "notice",
          providerId: "cursor-personal-page",
          providerLabel: "Cursor Personal",
        }}
        undoSeconds={3}
        onOpenSettings={() => undefined}
        onUndo={() => undefined}
      />,
    );

    expect(html).toContain("popup-hide-feedback--notice");
    expect(html).toContain("Cursor Personal can be shown again from Settings.");
    expect(html).toContain(">Settings</button>");
  });
});
