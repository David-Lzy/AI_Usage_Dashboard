import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import {
  PopupErrorCard,
  PopupLoadingCard,
} from "./PopupLoadStateCards";

const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);

describe("PopupLoadStateCards", () => {
  it("renders loading as a polite Material state card with a stable indicator", () => {
    const html = renderToStaticMarkup(
      <PopupLoadingCard runtimeI18n={createRuntimeI18n("en")} />,
    );

    expect(html).toContain("popup-load-state-card--loading");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("popup-load-state-card__indicator");
    expect(html).toContain("Loading cached dashboard state");
  });

  it("renders errors as a toned alert card with retry first", () => {
    const html = renderToStaticMarkup(
      <PopupErrorCard
        message="State read failed."
        runtimeI18n={createRuntimeI18n("en")}
        onOpenDashboard={() => undefined}
        onOpenSettings={() => undefined}
        onRetry={() => undefined}
      />,
    );

    expect(html).toContain("status-card--error");
    expect(html).toContain("popup-load-state-card--error");
    expect(html).toContain('role="alert"');
    expect(html).toContain("popup-load-state-card__actions");
    expect(html.indexOf(">Retry</button>")).toBeLessThan(
      html.indexOf(">Open dashboard</button>"),
    );
  });

  it("keeps popup load-state actions equal-width and wrapped by CSS", () => {
    expect(popupThemeCss).toContain(".popup-load-state-card__actions");
    expect(popupThemeCss).toContain(
      "grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));",
    );
    expect(popupThemeCss).toContain(".popup-load-state-card__indicator");
  });
});
