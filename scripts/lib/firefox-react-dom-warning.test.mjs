import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isKnownReactDomInnerHtmlWarning } from "./firefox-react-dom-warning.mjs";

const reactCase = 'case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(61);if(t=n.__html,t!=null){if(i.children!=null)throw Error(60);e.innerHTML=t}}break;';
const warning = {
  code: "UNSAFE_VAR_ASSIGNMENT",
  file: "assets/usage-progress.js",
  message: "Unsafe assignment to innerHTML",
  line: 1,
  column: reactCase.indexOf("e.innerHTML=") + 1,
};

describe("Firefox React DOM warning attribution", () => {
  it("accepts only the known React DOM assignment context", () => {
    expect(isKnownReactDomInnerHtmlWarning(warning, reactCase)).toBe(true);
    expect(isKnownReactDomInnerHtmlWarning(warning, 'e.innerHTML=userInput')).toBe(false);
  });

  it("rejects different files, locations and warning types", () => {
    expect(isKnownReactDomInnerHtmlWarning({ ...warning, file: "assets/sidepanel.js" }, reactCase)).toBe(false);
    expect(isKnownReactDomInnerHtmlWarning({ ...warning, column: 1 }, reactCase)).toBe(false);
    expect(isKnownReactDomInnerHtmlWarning({ ...warning, code: "OTHER" }, reactCase)).toBe(false);
  });

  it("keeps production source free of raw HTML insertion sinks", async () => {
    async function sourceFiles(directory) {
      const entries = await readdir(directory, { withFileTypes: true });
      const nested = await Promise.all(entries.map(async (entry) => {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) return sourceFiles(file);
        return entry.isFile() && /\.(?:[cm]?[jt]sx?|html)$/.test(entry.name) &&
          !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name) ? [file] : [];
      }));
      return nested.flat();
    }

    const files = (await Promise.all(["src", "public"].map(sourceFiles))).flat();
    const violations = [];
    for (const file of files) {
      const source = await readFile(file, "utf8");
      if (/dangerouslySetInnerHTML|\b(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/.test(source)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});
