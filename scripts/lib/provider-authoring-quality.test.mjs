import { describe, expect, it } from "vitest";
import {
  validateProviderFixtureSizes,
  validateProviderUpstreamProvenance,
} from "./provider-authoring-quality.mjs";

function validate(adoption, options = {}) {
  return validateProviderUpstreamProvenance({
    ledger: { schemaVersion: 1, adoptions: [adoption] },
    notices: options.notices ?? "",
    readLocalFile: options.readLocalFile ?? (() => ""),
  });
}

const base = {
  id: "sample",
  classification: "protocol lead",
  repositoryUrl: "https://github.com/example/provider-tool",
  upstreamFilePath: null,
  pinnedCommit: "1234567890abcdef1234567890abcdef12345678",
  copyrightHolder: "Example contributors",
  license: "MIT",
  localDestination: "Doc/Product/example.md",
  modificationSummary: "Independently verified protocol candidate.",
  maintenanceOwner: "Maintainers",
  independentVerification: "Queried the official structured endpoint.",
  noticeId: null,
};

describe("provider authoring provenance quality", () => {
  it("accepts an independently verified protocol lead", () => {
    expect(validate(base)).toEqual([]);
  });

  it("rejects copied code without provenance, header, and notice", () => {
    const errors = validate({
      ...base,
      classification: "copied",
      upstreamFilePath: null,
      copyrightHolder: "",
      license: "",
      noticeId: "provider-copy-1",
    });

    expect(errors.join("\n")).toContain("missing upstreamFilePath");
    expect(errors.join("\n")).toContain("missing copyrightHolder");
    expect(errors.join("\n")).toContain("Upstream-Notice header");
    expect(errors.join("\n")).toContain("missing the notice ID");
  });

  it("accepts a complete translated adoption record", () => {
    const adoption = {
      ...base,
      classification: "translated/derived",
      upstreamFilePath: "src/parser.swift",
      noticeId: "provider-translation-1",
    };
    const errors = validate(adoption, {
      readLocalFile: () => "// Upstream-Notice: provider-translation-1",
      notices:
        "Notice ID: provider-translation-1\nExample contributors\nMIT",
    });

    expect(errors).toEqual([]);
  });

  it("keeps the checked-in provider fixture corpus below the limit", () => {
    expect(validateProviderFixtureSizes("fixtures")).toEqual([]);
  });
});
