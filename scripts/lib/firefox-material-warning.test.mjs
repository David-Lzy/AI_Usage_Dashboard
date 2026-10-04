import { describe, expect, it } from "vitest";
import { knownMaterialWarningKind, verifyMaterialWarningSources } from "./firefox-material-warning.mjs";

const cases = {
  "lit-static-template": 'static createElement(e,i){const s=be.createElement("template");return s.innerHTML=e,s}',
  "mdui-dom-factory": 'Us=(t,e)=>{const i=Li(e);return i.innerHTML=t,[].slice.call(i.childNodes)};',
};
const warningFor = (source) => ({ code: "UNSAFE_VAR_ASSIGNMENT", file: "assets/material-controls.js", message: "Unsafe assignment to innerHTML", line: 1, column: source.indexOf(".innerHTML=") });
describe("Firefox Material warning attribution", () => {
  it("requires the reviewed installed dependency sources", async () => {
    expect(await verifyMaterialWarningSources(process.cwd())).toBe(true);
  });
  it.each(Object.entries(cases))("recognizes only the %s assignment", (kind, source) => {
    const warning = warningFor(source);
    expect(knownMaterialWarningKind(warning, source)).toBe(kind);
    expect(knownMaterialWarningKind({ ...warning, file: "assets/SettingsPage.js" }, source)).toBe(null);
    expect(knownMaterialWarningKind({ ...warning, column: 1 }, source)).toBe(null);
    expect(knownMaterialWarningKind({ ...warning, code: "OTHER" }, source)).toBe(null);
  });
  it("does not accept arbitrary HTML insertion", () => {
    const source = 'function unsafe(x){const e=document.createElement("div");return e.innerHTML=x,e}';
    expect(knownMaterialWarningKind(warningFor(source), source)).toBe(null);
  });
});
