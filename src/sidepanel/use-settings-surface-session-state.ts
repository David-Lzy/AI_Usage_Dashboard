import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  restoreSurfaceSessionState,
  type SettingsActivePopoverSessionState,
  type SettingsSurfaceSessionState,
  type SurfaceSessionState,
  type ToolbarPopupPreviewSessionState,
} from "../shared/surface-session-state";
import {
  POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
  type ToolbarPopupPreviewPosition,
} from "./components/ToolbarPopupPreview";
import {
  getSurfaceScrollProgress,
  getSurfaceScrollY,
  restoreSurfacePopoverAnchorAfterLayout,
  restoreSurfaceScrollPositionAfterLayout,
} from "./surface-scroll-position";

export const SETTINGS_SURFACE_SESSION_ROUTE_KEY = "#settings";
export const SETTINGS_SURFACE_SESSION_STORAGE_KEY = buildSurfaceSessionKey(
  SETTINGS_SURFACE_SESSION_ROUTE_KEY,
);

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

let latestSettingsSurfaceSessionStateSnapshot: SurfaceSessionState | null = null;

export type SettingsPreferencesSurfaceSessionControls = {
  uiMoreOpen: boolean;
  setUiMoreOpen: Dispatch<SetStateAction<boolean>>;
  toolbarPopupPreviewOpen: boolean;
  setToolbarPopupPreviewOpen: Dispatch<SetStateAction<boolean>>;
  popupPreviewRemainingPercent: number;
  setPopupPreviewRemainingPercent: Dispatch<SetStateAction<number>>;
  toolbarPopupPreviewPosition: ToolbarPopupPreviewPosition | null;
  setToolbarPopupPreviewPosition: Dispatch<
    SetStateAction<ToolbarPopupPreviewPosition | null>
  >;
  activePopover: SettingsActivePopoverSessionState | null;
  setActivePopover: Dispatch<
    SetStateAction<SettingsActivePopoverSessionState | null>
  >;
};

export type SettingsSurfaceSessionControls = {
  advancedOpen: boolean;
  setAdvancedOpen: Dispatch<SetStateAction<boolean>>;
  preferences: SettingsPreferencesSurfaceSessionControls;
  providerProgressDetailsOpen: Record<string, boolean>;
  setProviderProgressDetailsOpen: Dispatch<SetStateAction<Record<string, boolean>>>;
  carouselIndexById: Record<string, number>;
  setCarouselIndexById: Dispatch<SetStateAction<Record<string, number>>>;
};

type SettingsSurfaceSessionUiState = {
  activeSectionId: string | null;
  advancedOpen: boolean;
  uiMoreOpen: boolean;
  toolbarPopupPreviewOpen: boolean;
  popupPreviewRemainingPercent: number;
  toolbarPopupPreviewPosition: ToolbarPopupPreviewPosition | null;
  activePopover: SettingsActivePopoverSessionState | null;
  providerProgressDetailsOpen: Record<string, boolean>;
  carouselIndexById: Record<string, number>;
};

type UseSettingsSurfaceSessionStateInput = {
  activeSectionId: string | null;
  defaultAdvancedOpen: boolean;
  defaultUiMoreOpen: boolean;
  forceAdvancedOpen: boolean;
  restoreScroll?: boolean;
};

function normalizePercent(value: number): number {
  if (!Number.isFinite(value)) {
    return POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function resolveUpdate<T>(update: SetStateAction<T>, current: T): T {
  return typeof update === "function"
    ? (update as (currentValue: T) => T)(current)
    : update;
}

export function rememberLatestSettingsSurfaceSessionStateSnapshot(
  state: SurfaceSessionState | null,
): void {
  latestSettingsSurfaceSessionStateSnapshot = state;
}

export function getLatestSettingsSurfaceSessionStateSnapshot(
  scrollY: number | null = getSurfaceScrollY(),
  scrollProgress: number | null = getSurfaceScrollProgress(),
): SurfaceSessionState | null {
  if (!latestSettingsSurfaceSessionStateSnapshot) {
    return null;
  }

  return {
    ...latestSettingsSurfaceSessionStateSnapshot,
    scrollProgress:
      scrollProgress ?? latestSettingsSurfaceSessionStateSnapshot.scrollProgress,
    scrollY: scrollY ?? latestSettingsSurfaceSessionStateSnapshot.scrollY,
  };
}

export function createDefaultSettingsSurfaceSessionUiState({
  activeSectionId,
  defaultAdvancedOpen,
  defaultUiMoreOpen,
  forceAdvancedOpen,
}: UseSettingsSurfaceSessionStateInput): SettingsSurfaceSessionUiState {
  return {
    activeSectionId,
    advancedOpen: forceAdvancedOpen || defaultAdvancedOpen,
    uiMoreOpen: defaultUiMoreOpen,
    toolbarPopupPreviewOpen: false,
    popupPreviewRemainingPercent:
      POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
    toolbarPopupPreviewPosition: null,
    activePopover: null,
    providerProgressDetailsOpen: {},
    carouselIndexById: {},
  };
}

export function resolveSettingsSurfaceSessionUiState({
  defaults,
  forceAdvancedOpen,
  forceUiMoreOpen,
  restored,
}: {
  defaults: SettingsSurfaceSessionUiState;
  forceAdvancedOpen: boolean;
  forceUiMoreOpen: boolean;
  restored: SettingsSurfaceSessionState | null | undefined;
}): SettingsSurfaceSessionUiState {
  const toolbarPopupPreview = restored?.toolbarPopupPreview ?? null;

  return {
    activeSectionId: restored?.activeSectionId ?? defaults.activeSectionId,
    advancedOpen: forceAdvancedOpen
      ? true
      : (restored?.advancedOpen ?? defaults.advancedOpen),
    uiMoreOpen: forceUiMoreOpen || (restored?.uiMoreOpen ?? defaults.uiMoreOpen),
    toolbarPopupPreviewOpen:
      toolbarPopupPreview?.open ?? defaults.toolbarPopupPreviewOpen,
    popupPreviewRemainingPercent: normalizePercent(
      toolbarPopupPreview?.percent ?? defaults.popupPreviewRemainingPercent,
    ),
    toolbarPopupPreviewPosition:
      toolbarPopupPreview?.position ?? defaults.toolbarPopupPreviewPosition,
    activePopover: restored?.activePopover ?? defaults.activePopover,
    providerProgressDetailsOpen:
      restored?.providerProgressDetailsOpen ??
      defaults.providerProgressDetailsOpen,
    carouselIndexById: restored?.carouselIndexById ?? defaults.carouselIndexById,
  };
}

export function buildSettingsSurfaceSessionStateSnapshot(
  uiState: SettingsSurfaceSessionUiState,
  scrollY: number | null = null,
  scrollProgress: number | null = null,
): SurfaceSessionState {
  const toolbarPopupPreview: ToolbarPopupPreviewSessionState = {
    open: uiState.toolbarPopupPreviewOpen,
    percent: normalizePercent(uiState.popupPreviewRemainingPercent),
    position: uiState.toolbarPopupPreviewPosition,
  };

  return {
    routeName: "settings",
    routeKey: SETTINGS_SURFACE_SESSION_ROUTE_KEY,
    scrollY,
    scrollProgress,
    settings: {
      activeSectionId: uiState.activeSectionId,
      advancedOpen: uiState.advancedOpen,
      uiMoreOpen: uiState.uiMoreOpen,
      toolbarPopupPreview,
      activePopover: uiState.activePopover,
      providerProgressDetailsOpen: uiState.providerProgressDetailsOpen,
      carouselIndexById: uiState.carouselIndexById,
    },
    providerDetail: null,
  };
}

function rememberUiStateSnapshot(uiState: SettingsSurfaceSessionUiState): void {
  rememberLatestSettingsSurfaceSessionStateSnapshot(
    buildSettingsSurfaceSessionStateSnapshot(
      uiState,
      getSurfaceScrollY(),
      getSurfaceScrollProgress(),
    ),
  );
}

function rememberAndReturnUiState(
  uiState: SettingsSurfaceSessionUiState,
): SettingsSurfaceSessionUiState {
  rememberUiStateSnapshot(uiState);
  return uiState;
}

export function useSettingsSurfaceSessionState({
  activeSectionId,
  defaultAdvancedOpen,
  defaultUiMoreOpen,
  forceAdvancedOpen,
  restoreScroll = false,
}: UseSettingsSurfaceSessionStateInput): SettingsSurfaceSessionControls {
  const [hasRestored, setHasRestored] = useState(
    typeof window === "undefined",
  );
  const [pendingScrollRestoreY, setPendingScrollRestoreY] =
    useState<number | null>(null);
  const [pendingScrollRestoreProgress, setPendingScrollRestoreProgress] =
    useState<number | null>(null);
  const [pendingPopoverAnchorRestoreId, setPendingPopoverAnchorRestoreId] =
    useState<string | null>(null);
  const [uiState, setUiState] = useState(() =>
    createDefaultSettingsSurfaceSessionUiState({
      activeSectionId,
      defaultAdvancedOpen,
      defaultUiMoreOpen,
      forceAdvancedOpen,
    }),
  );

  useEffect(() => {
    let cancelled = false;
    const defaults = createDefaultSettingsSurfaceSessionUiState({
      activeSectionId,
      defaultAdvancedOpen,
      defaultUiMoreOpen,
      forceAdvancedOpen,
    });

    setHasRestored(false);
    restoreSurfaceSessionState(SETTINGS_SURFACE_SESSION_STORAGE_KEY)
      .then((restoredState) => {
        if (cancelled) {
          return;
        }

        setUiState((current) =>
          rememberAndReturnUiState(
            resolveSettingsSurfaceSessionUiState({
              defaults: {
                ...defaults,
                activeSectionId:
                  current.activeSectionId ?? defaults.activeSectionId,
              },
              forceAdvancedOpen,
              forceUiMoreOpen: defaultUiMoreOpen,
              restored: restoredState?.settings,
            }),
          ),
        );
        setPendingScrollRestoreY(restoredState?.scrollY ?? null);
        setPendingScrollRestoreProgress(restoredState?.scrollProgress ?? null);
        setPendingPopoverAnchorRestoreId(
          restoredState?.settings?.activePopover?.id ?? null,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setUiState((current) =>
            rememberAndReturnUiState({
              ...current,
              advancedOpen: forceAdvancedOpen || current.advancedOpen,
              uiMoreOpen: defaultUiMoreOpen || current.uiMoreOpen,
            }),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHasRestored(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [defaultAdvancedOpen, defaultUiMoreOpen, forceAdvancedOpen]);

  useBrowserLayoutEffect(() => {
    rememberLatestSettingsSurfaceSessionStateSnapshot(
      buildSettingsSurfaceSessionStateSnapshot(
        uiState,
        getSurfaceScrollY(),
        getSurfaceScrollProgress(),
      ),
    );
  }, [uiState]);

  useEffect(() => {
    const hasPendingScrollPosition =
      pendingScrollRestoreY !== null ||
      pendingScrollRestoreProgress !== null ||
      pendingPopoverAnchorRestoreId !== null;

    if (!hasRestored || !restoreScroll || !hasPendingScrollPosition) {
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      const restoredPopoverAnchor = pendingPopoverAnchorRestoreId
        ? await restoreSurfacePopoverAnchorAfterLayout(
            pendingPopoverAnchorRestoreId,
          )
        : false;

      if (!restoredPopoverAnchor) {
        await restoreSurfaceScrollPositionAfterLayout({
          scrollProgress: pendingScrollRestoreProgress,
          scrollY: pendingScrollRestoreY,
        });
      }

      if (cancelled) {
        return;
      }

      if (pendingPopoverAnchorRestoreId && !restoredPopoverAnchor) {
        setUiState((current) =>
          current.activePopover?.id === pendingPopoverAnchorRestoreId
            ? rememberAndReturnUiState({
                ...current,
                activePopover: null,
              })
            : current,
        );
      }

      setPendingScrollRestoreY(null);
      setPendingScrollRestoreProgress(null);
      setPendingPopoverAnchorRestoreId(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hasRestored,
    pendingPopoverAnchorRestoreId,
    pendingScrollRestoreProgress,
    pendingScrollRestoreY,
    restoreScroll,
    uiState.advancedOpen,
    uiState.uiMoreOpen,
  ]);

  useEffect(() => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        activeSectionId,
        advancedOpen: forceAdvancedOpen || current.advancedOpen,
        uiMoreOpen: defaultUiMoreOpen || current.uiMoreOpen,
      }),
    );
  }, [activeSectionId, defaultUiMoreOpen, forceAdvancedOpen]);

  useEffect(() => {
    if (
      !hasRestored ||
      pendingScrollRestoreY !== null ||
      pendingScrollRestoreProgress !== null ||
      pendingPopoverAnchorRestoreId !== null
    ) {
      return;
    }

    void captureSurfaceSessionState(
      SETTINGS_SURFACE_SESSION_STORAGE_KEY,
      buildSettingsSurfaceSessionStateSnapshot(
        uiState,
        getSurfaceScrollY(),
        getSurfaceScrollProgress(),
      ),
    );
  }, [
    hasRestored,
    pendingPopoverAnchorRestoreId,
    pendingScrollRestoreProgress,
    pendingScrollRestoreY,
    uiState,
  ]);

  const setAdvancedOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (update) => {
      setUiState((current) =>
        rememberAndReturnUiState({
          ...current,
          advancedOpen: resolveUpdate(update, current.advancedOpen),
        }),
      );
    },
    [],
  );
  const setUiMoreOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (update) => {
      setUiState((current) =>
        rememberAndReturnUiState({
          ...current,
          uiMoreOpen: resolveUpdate(update, current.uiMoreOpen),
        }),
      );
    },
    [],
  );
  const setToolbarPopupPreviewOpen = useCallback<
    Dispatch<SetStateAction<boolean>>
  >((update) => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        toolbarPopupPreviewOpen: resolveUpdate(
          update,
          current.toolbarPopupPreviewOpen,
        ),
      }),
    );
  }, []);
  const setPopupPreviewRemainingPercent = useCallback<
    Dispatch<SetStateAction<number>>
  >((update) => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        popupPreviewRemainingPercent: normalizePercent(
          resolveUpdate(update, current.popupPreviewRemainingPercent),
        ),
      }),
    );
  }, []);
  const setToolbarPopupPreviewPosition = useCallback<
    Dispatch<SetStateAction<ToolbarPopupPreviewPosition | null>>
  >((update) => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        toolbarPopupPreviewPosition: resolveUpdate(
          update,
          current.toolbarPopupPreviewPosition,
        ),
      }),
    );
  }, []);
  const setActivePopover = useCallback<
    Dispatch<SetStateAction<SettingsActivePopoverSessionState | null>>
  >((update) => {
    setUiState((current) => {
      const nextUiState = {
        ...current,
        activePopover: resolveUpdate(update, current.activePopover),
      };

      return rememberAndReturnUiState(nextUiState);
    });
  }, []);
  const setProviderProgressDetailsOpen = useCallback<
    Dispatch<SetStateAction<Record<string, boolean>>>
  >((update) => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        providerProgressDetailsOpen: resolveUpdate(
          update,
          current.providerProgressDetailsOpen,
        ),
      }),
    );
  }, []);
  const setCarouselIndexById = useCallback<
    Dispatch<SetStateAction<Record<string, number>>>
  >((update) => {
    setUiState((current) =>
      rememberAndReturnUiState({
        ...current,
        carouselIndexById: resolveUpdate(update, current.carouselIndexById),
      }),
    );
  }, []);

  return {
    advancedOpen: uiState.advancedOpen,
    setAdvancedOpen,
    preferences: {
      uiMoreOpen: uiState.uiMoreOpen,
      setUiMoreOpen,
      toolbarPopupPreviewOpen: uiState.toolbarPopupPreviewOpen,
      setToolbarPopupPreviewOpen,
      popupPreviewRemainingPercent: uiState.popupPreviewRemainingPercent,
      setPopupPreviewRemainingPercent,
      toolbarPopupPreviewPosition: uiState.toolbarPopupPreviewPosition,
      setToolbarPopupPreviewPosition,
      activePopover: uiState.activePopover,
      setActivePopover,
    },
    providerProgressDetailsOpen: uiState.providerProgressDetailsOpen,
    setProviderProgressDetailsOpen,
    carouselIndexById: uiState.carouselIndexById,
    setCarouselIndexById,
  };
}
