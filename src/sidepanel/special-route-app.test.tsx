import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getSpecialSidePanelRoute,
  SpecialRouteApp,
} from "./special-route-app";

describe("special-route-app", () => {
  it("maps supported debug hashes and ignores standard routes", () => {
    expect(getSpecialSidePanelRoute("#debug-capture-codex")).toBe(
      "debug-capture-codex",
    );
    expect(getSpecialSidePanelRoute("#debug-native-popup-probe")).toBe(
      "debug-native-popup-probe",
    );
    expect(getSpecialSidePanelRoute("#settings")).toBeNull();
    expect(getSpecialSidePanelRoute("#provider/codex")).toBeNull();
  });

  it("renders a lazy loading fallback without the standard app shell state", () => {
    const html = renderToStaticMarkup(
      <SpecialRouteApp route="debug-native-popup-probe" />,
    );

    expect(html).toContain("Preparing dashboard state");
    expect(html).toContain('class="hero-card"');
    expect(html).not.toContain("Opening native toolbar popup");
  });
});
