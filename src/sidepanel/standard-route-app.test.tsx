import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../shared/app-message-types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  shouldRestoreSurfaceSessionStateForRoute,
  StandardRouteApp,
} from "./standard-route-app";
import { useStandardAppRuntime } from "./use-standard-app-runtime";

vi.mock("./use-standard-app-runtime", () => ({
  useStandardAppRuntime: vi.fn(),
}));

const mockedUseStandardAppRuntime = vi.mocked(useStandardAppRuntime);

function setRuntimeState({
  appState = SAMPLE_APP_STATE,
  isLoading = false,
}: {
  appState?: typeof SAMPLE_APP_STATE | null;
  isLoading?: boolean;
} = {}) {
  mockedUseStandardAppRuntime.mockReturnValue({
    appState,
    toast: null,
    isLoading,
    loadError: null,
    applyMessage: vi.fn(
      async (_message: AppMessage) => appState !== null,
    ),
    handleRetryInitialization: vi.fn(),
    setToast: vi.fn(),
  });
}

describe("StandardRouteApp cached-first rendering", () => {
  beforeEach(() => {
    mockedUseStandardAppRuntime.mockReset();
  });

  it("renders cached dashboard state while background bootstrap is still loading", () => {
    setRuntimeState({ isLoading: true });

    const html = renderToStaticMarkup(
      <StandardRouteApp locationHash="#dashboard" />,
    );

    expect(mockedUseStandardAppRuntime).toHaveBeenCalledWith({
      preferCachedBootstrap: true,
    });
    expect(html).toContain("One panel for AI coding quotas");
    expect(html).toContain("Provider cards");
    expect(html).not.toContain("Preparing dashboard state");
  });

  it("keeps the loading card for true no-state initialization", () => {
    setRuntimeState({ appState: null, isLoading: true });

    const html = renderToStaticMarkup(
      <StandardRouteApp locationHash="#dashboard" />,
    );

    expect(html).toContain("Preparing dashboard state");
    expect(html).not.toContain("Provider cards");
  });
});

describe("surface session restore route matching", () => {
  it("allows route-matched scroll restore without explicit URL focus", () => {
    expect(
      shouldRestoreSurfaceSessionStateForRoute(
        { name: "settings" },
        {
          routeName: "settings",
          routeKey: "#settings",
          scrollProgress: 0.5,
          scrollY: 400,
          settings: null,
          providerDetail: null,
        },
      ),
    ).toBe(true);
  });

  it("does not restore old scroll over explicit URL focus", () => {
    expect(
      shouldRestoreSurfaceSessionStateForRoute(
        {
          name: "settings",
          focus: {
            kind: "section",
            sectionId: "settings-appearance",
          },
        },
        {
          routeName: "settings",
          routeKey: "#settings/section/settings-appearance",
          scrollProgress: 0.5,
          scrollY: 400,
          settings: null,
          providerDetail: null,
        },
      ),
    ).toBe(false);
  });

  it("does not restore provider detail state for another provider", () => {
    expect(
      shouldRestoreSurfaceSessionStateForRoute(
        {
          name: "provider-detail",
          providerId: "cursor-personal-page",
        },
        {
          routeName: "provider-detail",
          routeKey: "#provider-detail/cursor-personal-page",
          scrollProgress: 0.25,
          scrollY: 300,
          settings: null,
          providerDetail: {
            providerId: "codex-personal-page",
            quotaDetailsOpen: {},
          },
        },
      ),
    ).toBe(false);
  });

  it("does not restore stale state into a different route", () => {
    expect(
      shouldRestoreSurfaceSessionStateForRoute(
        { name: "dashboard" },
        {
          routeName: "settings",
          routeKey: "#settings",
          scrollProgress: 0.25,
          scrollY: 300,
          settings: null,
          providerDetail: null,
        },
      ),
    ).toBe(false);
  });
});
