import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TechnicalText } from "./TechnicalText";

const technicalTextCss = readFileSync(
  new URL("./technical-text.css", import.meta.url),
  "utf8",
);

describe("TechnicalText", () => {
  it("isolates source-faithful technical text as LTR by default", () => {
    const html = renderToStaticMarkup(
      <TechnicalText>GET /v1/usage</TechnicalText>,
    );

    expect(html).toContain("<bdi");
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('data-technical-text="ltr"');
    expect(html).toContain("GET /v1/usage");
  });

  it("supports auto direction for either localized or source labels", () => {
    const html = renderToStaticMarkup(
      <TechnicalText direction="auto">سطح المكتب</TechnicalText>,
    );

    expect(html).toContain('dir="auto"');
    expect(html).toContain('data-technical-text="auto"');
  });

  it("keeps isolation and emergency wrapping local to the fragment", () => {
    expect(technicalTextCss).toMatch(
      /\.technical-text\s*\{[^}]*unicode-bidi:\s*isolate;[^}]*overflow-wrap:\s*anywhere;/s,
    );
  });
});
