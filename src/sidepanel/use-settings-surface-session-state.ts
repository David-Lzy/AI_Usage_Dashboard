import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  restoreSurfaceSessionState,
  type SettingsSurfaceSessionState,
  type SurfaceSessionState,
  type ToolbarPopupPreviewSessionState,
} from "../shared/surface-session-state";
import {
  POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
  type ToolbarPopupPreviewPosition,
} from "./components/ToolbarPopupPreview";

const SETTINGS_SURFACE_SESSION_ROUTE_KEY = "#settings";
const SETTINGS_SURFACE_SESSION_STORAGE_KEY = buildSurfaceSessionKey(
  SETTINGS_SURFACE_SESSION_ROUTE_KEY,
);

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
  providerProgressDetailsOpen: Record<string, boolean>;
  carouselIndexById: Record<string, number>;
};

type UseSettingsSurfaceSessionStateInput = {
  activeSectionId: string | null;
  defaultAdvancedOpen: boolean;
  defaultUiMoreOpen: boolean;
  forceAdvancedOpen: boolean;
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

function getWindowScrollY(): number | null {
  return typeof window !== "undefined" && typeof window.scrollY === "number"
    ? window.scrollY
    : null;
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
    providerProgressDetailsOpen:
      restored?.providerProgressDetailsOpen ??
      defaults.providerProgressDetailsOpen,
    carouselIndexById: restored?.carouselIndexById ?? defaults.carouselIndexById,
  };
}

export function buildSettingsSurfaceSessionStateSnapshot(
  uiState: SettingsSurfaceSessionUiState,
  scrollY: number | null = null,
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
    settings: {
      activeSectionId: uiState.activeSectionId,
      advancedOpen: uiState.advancedOpen,
      uiMoreOpen: uiState.uiMoreOpen,
      toolbarPopupPreview,
      providerProgressDetailsOpen: uiState.providerProgressDetailsOpen,
      carouselIndexById: uiState.carouselIndexById,
    },
    providerDetail: null,
  };
}

export function useSettingsSurfaceSessionState({
  activeSectionId,
  defaultAdvancedOpen,
  defaultUiMoreOpen,
  forceAdvancedOpen,
}: UseSettingsSurfaceSessionStateInput): SettingsSurfaceSessionControls {
  const [hasRestored, setHasRestored] = useState(
    typeof window === "undefined",
  );
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
          resolveSettingsSurfaceSessionUiState({
            defaults: {
              ...defaults,
              activeSectionId: current.activeSectionId ?? defaults.activeSectionId,
            },
            forceAdvancedOpen,
            forceUiMoreOpen: defaultUiMoreOpen,
            restored: restoredState?.settings,
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setUiState((current) => ({
            ...current,
            advancedOpen: forceAdvancedOpen || current.advancedOpen,
            uiMoreOpen: defaultUiMoreOpen || current.uiMoreOpen,
          }));
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

  useEffect(() => {
    setUiState((current) => ({
      ...current,
      activeSectionId,
      advancedOpen: forceAdvancedOpen || current.advancedOpen,
      uiMoreOpen: defaultUiMoreOpen || current.uiMoreOpen,
    }));
  }, [activeSectionId, defaultUiMoreOpen, forceAdvancedOpen]);

  useEffect(() => {
    if (!hasRestored) {
      return;
    }

    void captureSurfaceSessionState(
      SETTINGS_SURFACE_SESSION_STORAGE_KEY,
      buildSettingsSurfaceSessionStateSnapshot(uiState, getWindowScrollY()),
    );
  }, [hasRestored, uiState]);

  const setAdvancedOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (update) => {
      setUiState((current) => ({
        ...current,
        advancedOpen: resolveUpdate(update, current.advancedOpen),
      }));
    },
    [],
  );
  const setUiMoreOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (update) => {
      setUiState((current) => ({
        ...current,
        uiMoreOpen: resolveUpdate(update, current.uiMoreOpen),
      }));
    },
    [],
  );
  const setToolbarPopupPreviewOpen = useCallback<
    Dispatch<SetStateAction<boolean>>
  >((update) => {
    setUiState((current) => ({
      ...current,
      toolbarPopupPreviewOpen: resolveUpdate(
        update,
        current.toolbarPopupPreviewOpen,
      ),
    }));
  }, []);
  const setPopupPreviewRemainingPercent = useCallback<
    Dispatch<SetStateAction<number>>
  >((update) => {
    setUiState((current) => ({
      ...current,
      popupPreviewRemainingPercent: normalizePercent(
        resolveUpdate(update, current.popupPreviewRemainingPercent),
      ),
    }));
  }, []);
  const setToolbarPopupPreviewPosition = useCallback<
    Dispatch<SetStateAction<ToolbarPopupPreviewPosition | null>>
  >((update) => {
    setUiState((current) => ({
      ...current,
      toolbarPopupPreviewPosition: resolveUpdate(
        update,
        current.toolbarPopupPreviewPosition,
      ),
    }));
  }, []);
  const setProviderProgressDetailsOpen = useCallback<
    Dispatch<SetStateAction<Record<string, boolean>>>
  >((update) => {
    setUiState((current) => ({
      ...current,
      providerProgressDetailsOpen: resolveUpdate(
        update,
        current.providerProgressDetailsOpen,
      ),
    }));
  }, []);
  const setCarouselIndexById = useCallback<
    Dispatch<SetStateAction<Record<string, number>>>
  >((update) => {
    setUiState((current) => ({
      ...current,
      carouselIndexById: resolveUpdate(update, current.carouselIndexById),
    }));
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
    },
    providerProgressDetailsOpen: uiState.providerProgressDetailsOpen,
    setProviderProgressDetailsOpen,
    carouselIndexById: uiState.carouselIndexById,
    setCarouselIndexById,
  };
}
