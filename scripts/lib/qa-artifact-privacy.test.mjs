import { describe, expect, it } from "vitest";

import {
  scanQaArtifactJsonText,
  scanQaArtifactValue,
} from "./qa-artifact-privacy.mjs";

describe("QA artifact privacy guard", () => {
  it("accepts route and status metadata", () => {
    expect(
      scanQaArtifactValue({
        status: "passed",
        checks: {
          extensionId: "abcdef",
          settingsSessionRestore: {
            urlProtocol: "chrome-extension:",
            hash: "#settings",
            search: "?surface=full-page",
            colorDropdownOpen: "true",
          },
        },
      }),
    ).toEqual([]);
  });

  it("flags risky private evidence keys", () => {
    expect(
      scanQaArtifactValue({
        providerDetail: {
          bodyText: "full provider page text",
        },
        screenshotDataUrl: "redacted",
        nested: {
          apiKey: "redacted",
        },
      }),
    ).toEqual([
      {
        path: "providerDetail.bodyText",
        reason: "Forbidden QA artifact key matched /bodyText/i.",
      },
      {
        path: "screenshotDataUrl",
        reason: "Forbidden QA artifact key matched /screenshot/i.",
      },
      {
        path: "nested.apiKey",
        reason: "Forbidden QA artifact key matched /apiKey/i.",
      },
    ]);
  });

  it("flags private-looking string payloads and invalid JSON", () => {
    expect(
      scanQaArtifactJsonText(
        JSON.stringify({
          metadata: {
            preview: "data:image/png;base64,AAAA",
          },
        }),
      ),
    ).toEqual([
      {
        path: "metadata.preview",
        reason: "Forbidden QA artifact string matched /data:image\\//i.",
      },
    ]);
    expect(scanQaArtifactJsonText("{not-json")[0]?.reason).toContain(
      "Invalid JSON artifact",
    );
  });
});
