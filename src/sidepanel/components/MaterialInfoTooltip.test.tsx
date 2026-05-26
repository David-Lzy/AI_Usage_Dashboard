import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);
const materialInfoTooltipSource = readFileSync(
  new URL("./MaterialInfoTooltip.tsx", import.meta.url),
  "utf8",
);

describe("MaterialInfoTooltip", () => {
  it("renders a focusable trigger and hidden tooltip content", () => {
    const html = renderToStaticMarkup(
      <MaterialInfoTooltip>Helpful settings detail.</MaterialInfoTooltip>,
    );

    expect(html).toContain('class="material-info-tooltip"');
    expect(html).toContain('data-open="false"');
    expect(html).toContain('data-positioned="false"');
    expect(html).toContain('class="material-info-tooltip__trigger"');
    expect(html).toContain('data-material-icon="help-outline"');
    expect(html).toContain('class="material-info-tooltip__content"');
    expect(html).toContain('aria-label="Helpful settings detail."');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Helpful settings detail.");
  });

  it("uses a subtle trigger and fixed opaque tooltip surface", () => {
    expect(formControlsCss).toContain(".material-info-tooltip__trigger {");
    expect(formControlsCss).toContain("display: inline-flex;");
    expect(formControlsCss).toContain("align-items: center;");
    expect(formControlsCss).toContain("justify-content: center;");
    expect(formControlsCss).toContain("line-height: 0;");
    expect(formControlsCss).toContain(
      "--material-info-tooltip-size: var(--md-sys-typescale-label-large-size);",
    );
    expect(formControlsCss).toContain(
      "width: var(\n    --material-info-tooltip-size,",
    );
    expect(formControlsCss).toContain(
      "height: var(\n    --material-info-tooltip-size,",
    );
    expect(formControlsCss).toContain("position: absolute;");
    expect(formControlsCss).toContain("inset-block-start: 50%;");
    expect(formControlsCss).toContain("inset-inline-start: 50%;");
    expect(formControlsCss).toContain("transform: translate(-50%, -50%);");
    expect(formControlsCss).toContain("box-sizing: border-box;");
    expect(formControlsCss).toContain("padding: 0;");
    expect(formControlsCss).toContain("border: 1px solid transparent;");
    expect(formControlsCss).toContain("background: transparent;");
    expect(formControlsCss).toContain("opacity: 0.48;");
    expect(formControlsCss).toContain("filter: blur(0.18px) saturate(0.8);");
    expect(formControlsCss).toContain(".material-info-tooltip__trigger .material-icon");
    expect(formControlsCss).toContain(
      ".section-title-with-info {\n  --material-info-tooltip-size: var(--md-sys-typescale-title-medium-size);",
    );
    expect(formControlsCss).toContain(
      ".material-info-tooltip__trigger:hover {\n  box-shadow: none;\n}",
    );
    expect(formControlsCss).toContain(
      ".material-info-tooltip__trigger:focus-visible {\n  box-shadow: var(--app-focus-ring-shadow);\n}",
    );
    expect(formControlsCss).toContain("position: fixed;");
    expect(formControlsCss).toContain("display: block;");
    expect(formControlsCss).toContain(
      "background: var(--md-sys-color-surface-container-highest);",
    );
    expect(formControlsCss).toContain(
      '.material-info-tooltip__content[data-open="true"][data-positioned="true"]',
    );
  });

  it("extends hover and focus feedback to nearby label rows", () => {
    expect(materialInfoTooltipSource).toContain("const rootRef");
    expect(materialInfoTooltipSource).toContain("root.closest<HTMLElement>");
    expect(materialInfoTooltipSource).toContain(".form-field__label-row");
    expect(materialInfoTooltipSource).toContain(".section-title-with-info");
    expect(materialInfoTooltipSource).toContain(".field-label-with-info");
    expect(materialInfoTooltipSource).toContain(".settings-overview__eyebrow");
    expect(materialInfoTooltipSource).toContain(
      'hoverTarget.addEventListener("pointerenter", openTooltip);',
    );
    expect(materialInfoTooltipSource).toContain(
      'hoverTarget.addEventListener("focusin", openTooltip);',
    );
    expect(materialInfoTooltipSource).toContain(
      "hoverTarget.contains(relatedTarget as Node)",
    );

    expect(formControlsCss).toContain(
      ".form-field__label-row:hover .material-info-tooltip__trigger,",
    );
    expect(formControlsCss).toContain(
      ".section-title-with-info:focus-within .material-info-tooltip__trigger,",
    );
    expect(formControlsCss).toContain(
      ".settings-overview__eyebrow:focus-within .material-info-tooltip__trigger,",
    );
  });
});
