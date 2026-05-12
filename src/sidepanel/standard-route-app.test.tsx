import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../background/message-bus";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { StandardRouteApp } from "./standard-route-app";
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
