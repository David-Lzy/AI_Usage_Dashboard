import { afterEach, describe, expect, it, vi } from "vitest";

import type { SourceAttemptFailure } from "./source-selection";

async function importSourceSelection() {
  return import("./source-selection");
}

describe("source selection helpers", () => {
  afterEach(() => {
    vi.doUnmock("./provider-sources");
    vi.resetModules();
  });

  it("builds auto and explicit selection reasons without fallback", async () => {
    vi.doMock("./provider-sources", () => ({
      getSourceAttemptOrder: vi.fn(() => ["official_api", "session_page"]),
      getSourceKindLabel: vi.fn((kind: string) =>
        kind === "official_api" ? "Official API" : "Session page",
      ),
      getSourcePreferenceLabel: vi.fn((preference: string) =>
        preference === "official_api" ? "Official API" : "Session page",
      ),
    }));
    const { buildSourceSelectionReason } = await importSourceSelection();

    expect(
      buildSourceSelectionReason(
        "codex-personal-page",
        "auto",
        "session_page",
        false,
      ),
    ).toBe("Auto selected Session page.");

    expect(
      buildSourceSelectionReason(
        "codex-personal-page",
        "official_api",
        "official_api",
        false,
      ),
    ).toBe("Official API selected by user preference.");
  });

  it("builds fallback selection reasons for auto and explicit preferences", async () => {
    vi.doMock("./provider-sources", () => ({
      getSourceAttemptOrder: vi.fn(() => ["official_api", "session_page"]),
      getSourceKindLabel: vi.fn((kind: string) =>
        kind === "official_api" ? "Official API" : "Session page",
      ),
      getSourcePreferenceLabel: vi.fn((preference: string) =>
        preference === "official_api" ? "Official API" : "Session page",
      ),
    }));
    const { buildSourceSelectionReason } = await importSourceSelection();

    expect(
      buildSourceSelectionReason(
        "codex-personal-page",
        "auto",
        "session_page",
        true,
      ),
    ).toBe("Auto fell back to Session page.");

    expect(
      buildSourceSelectionReason(
        "codex-personal-page",
        "official_api",
        "session_page",
        true,
      ),
    ).toBe("Official API preference fell back to Session page.");
  });

  it("uses the only-source reason for providers without fallback options", async () => {
    const { buildSourceSelectionReason } = await importSourceSelection();

    expect(
      buildSourceSelectionReason(
        "codex-personal-page",
        "auto",
        "session_page",
        false,
      ),
    ).toBe("Session page is the only shipped source for codex-personal-page.");
    expect(
      buildSourceSelectionReason(
        "gemini-policy",
        "auto",
        "policy_only",
        false,
      ),
    ).toBe("Policy only is the only shipped source for gemini-policy.");
  });

  it("formats source fallback and no-source-available reasons", async () => {
    const { buildNoSourceAvailableReason, buildSourceFallbackReason } =
      await importSourceSelection();

    expect(
      buildSourceFallbackReason({
        code: "credential_missing",
        detail: "API key is missing.",
        kind: "official_api",
      }),
    ).toBe("Official API unavailable: API key is missing.");

    expect(buildNoSourceAvailableReason("auto")).toBe(
      "Auto could not find an available live source.",
    );
    expect(buildNoSourceAvailableReason("session_page")).toBe(
      "Session page preference could not find an available live source.",
    );
  });

  it("stops fallback for host access failures only", async () => {
    const { shouldAttemptFallback } = await importSourceSelection();
    const fallbackAllowedFailures: SourceAttemptFailure[] = [
      {
        code: "credential_missing",
        detail: "API key is missing.",
        kind: "official_api",
      },
      {
        code: "open_page_required",
        detail: "Open a provider page.",
        kind: "session_page",
      },
      {
        code: "logged_out",
        detail: "Provider page is logged out.",
        kind: "session_page",
      },
      {
        code: "sync_error",
        detail: "Sync failed.",
        kind: "official_api",
      },
    ];

    expect(
      shouldAttemptFallback({
        code: "host_access_missing",
        detail: "Host permission is missing.",
        kind: "session_page",
      }),
    ).toBe(false);
    expect(fallbackAllowedFailures.map(shouldAttemptFallback)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});
