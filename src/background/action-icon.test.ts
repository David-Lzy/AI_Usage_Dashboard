import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildActionBadgeQuotaCandidates } from "../shared/action-badge-preferences";
import {
  buildProviderFaviconUrl,
  resolveToolbarIconProviderId,
  syncToolbarIconFromState,
} from "./action-icon";

function createStateWithCodexBadge(): AppState {
  const state = {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex-personal-page"
        ? {
            ...provider,
            remaining: 51,
            quotaUnit: "percent" as const,
            usageWindows: [
              {
                label: "Weekly usage window",
                normalizedLabel: "Weekly usage window",
                kind: "weekly" as const,
                modelLabel: null,
                quotaUnit: "percent" as const,
                used: 49,
                remaining: 51,
                total: 100,
                resetAt: "2026-05-19T09:15:00.000Z",
                resetLabel: "Resets Tuesday",
              },
            ],
          }
        : provider,
    ),
  };
  const weeklyCandidate = buildActionBadgeQuotaCandidates(state).find(
    (candidate) => candidate.providerId === "codex-personal-page",
  );

  return {
    ...state,
    settings: {
      ...state.settings,
      actionBadgeSelectionMode: "manual",
      actionBadgeSelection: weeklyCandidate?.value ?? "attention",
      actionBadgeSelections: [weeklyCandidate?.value ?? "attention"],
      toolbarIconMode: "match-badge",
    },
  };
}

describe("action icon", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves provider icons from explicit provider settings", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "provider",
        toolbarIconProviderId: "claude-code-team-page",
      },
    };

    expect(resolveToolbarIconProviderId(state)).toBe("claude-code-team-page");
  });

  it("matches the selected quota badge provider when configured", () => {
    expect(resolveToolbarIconProviderId(createStateWithCodexBadge())).toBe(
      "codex-personal-page",
    );
  });

  it("matches the provider for the active rotated quota badge", () => {
    const state = {
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        if (provider.providerId === "codex-personal-page") {
          return {
            ...provider,
            remaining: 51,
            quotaUnit: "percent" as const,
          };
        }

        if (provider.providerId === "claude-code-team-page") {
          return {
            ...provider,
            remaining: 93,
            quotaUnit: "percent" as const,
          };
        }

        return provider;
      }),
    };
    const candidates = buildActionBadgeQuotaCandidates(state);
    const codexCandidate = candidates.find(
      (candidate) => candidate.providerId === "codex-personal-page",
    );
    const claudeCandidate = candidates.find(
      (candidate) => candidate.providerId === "claude-code-team-page",
    );
    const rotatingState: AppState = {
      ...state,
      settings: {
        ...state.settings,
        toolbarIconMode: "match-badge",
        actionBadgeSelectionMode: "manual",
        actionBadgeSelections: [
          codexCandidate?.value ?? "attention",
          claudeCandidate?.value ?? "attention",
        ],
        actionBadgeRotationIntervalSeconds: 60,
      },
    };

    expect(resolveToolbarIconProviderId(rotatingState, 0)).toBe("codex-personal-page");
    expect(resolveToolbarIconProviderId(rotatingState, 60_000)).toBe(
      "claude-code-team-page",
    );
  });

  it("falls back to the default icon for attention-count badges", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "match-badge",
        actionBadgeSelectionMode: "manual",
        actionBadgeSelection: "attention",
        actionBadgeSelections: ["attention"],
      },
    };

    expect(resolveToolbarIconProviderId(state)).toBeNull();
  });

  it("builds Chrome favicon API URLs for provider toolbar icons", () => {
    vi.stubGlobal("chrome", {
      runtime: {
        getURL: (path: string) => `chrome-extension://extension-id${path}`,
      },
    });

    expect(buildProviderFaviconUrl("codex-personal-page", 32)).toBe(
      "chrome-extension://extension-id/_favicon/?pageUrl=https%3A%2F%2Fchatgpt.com%2F&size=32",
    );
  });

  it("disables provider favicon URLs when running against Firefox browser APIs", () => {
    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `moz-extension://extension-id/${path}`,
      },
      sidebarAction: {
        open: vi.fn(),
        setPanel: vi.fn(),
      },
    });

    expect(buildProviderFaviconUrl("codex-personal-page", 32)).toBeNull();
  });

  it("closes decoded toolbar icon bitmaps after building icon image data", async () => {
    const close = vi.fn();
    const setIcon = vi.fn(async () => {});
    const createImageBitmap = vi.fn(async () => ({
      width: 32,
      height: 32,
      close,
    }) as unknown as ImageBitmap);

    vi.stubGlobal("chrome", {
      action: {
        setIcon,
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob(["icon"], { type: "image/png" }),
      })),
    );
    vi.stubGlobal("createImageBitmap", createImageBitmap);
    vi.stubGlobal(
      "OffscreenCanvas",
      class {
        constructor(
          readonly width: number,
          readonly height: number,
        ) {}

        getContext() {
          return {
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
              width: this.width,
              height: this.height,
              data: new Uint8ClampedArray(this.width * this.height * 4),
            }) as ImageData),
          };
        }
      },
    );

    await syncToolbarIconFromState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "custom",
        toolbarIconCustomImageDataUrl: "data:image/png;base64,phase593-success",
      },
    });

    expect(createImageBitmap).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(2);
    expect(setIcon).toHaveBeenCalledWith({
      imageData: expect.objectContaining({
        16: expect.objectContaining({ width: 16, height: 16 }),
        32: expect.objectContaining({ width: 32, height: 32 }),
      }),
    });
  });

  it("closes decoded toolbar icon bitmaps before falling back on canvas failure", async () => {
    const close = vi.fn();
    const setIcon = vi.fn(async () => {});

    vi.stubGlobal("chrome", {
      action: {
        setIcon,
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob(["icon"], { type: "image/png" }),
      })),
    );
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 32,
        height: 32,
        close,
      }) as unknown as ImageBitmap),
    );
    vi.stubGlobal(
      "OffscreenCanvas",
      class {
        getContext() {
          return null;
        }
      },
    );

    await syncToolbarIconFromState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "custom",
        toolbarIconCustomImageDataUrl: "data:image/png;base64,phase593-fallback",
      },
    });

    expect(close).toHaveBeenCalledTimes(1);
    expect(setIcon).toHaveBeenCalledWith({
      path: expect.any(Object),
    });
  });
});
