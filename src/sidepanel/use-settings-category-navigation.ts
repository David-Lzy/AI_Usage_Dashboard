import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MotionMode } from "../providers/types";
import { restoreSurfaceSessionState } from "../shared/surface-session-state";
import { SETTINGS_SURFACE_SESSION_STORAGE_KEY } from "./use-settings-surface-session-state";
import {
  getSettingsRouteFocusElement,
  getSettingsRouteFocusKey,
} from "./settings-route-focus";
import { buildSidePanelHash, type SettingsRouteFocus } from "./route-state";
import { getPreferredScrollBehavior } from "./motion";
import {
  getSettingsCategoryForFocus,
  getSettingsCategoryForSection,
  SETTINGS_CATEGORY_SECTIONS,
  type SettingsCategory,
} from "./settings-categories";

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useSettingsCategoryNavigation(
  focus: SettingsRouteFocus | undefined,
  motion: MotionMode,
) {
  const [category, setCategory] = useState<SettingsCategory>(() =>
    getSettingsCategoryForFocus(focus),
  );
  const positions = useRef<Partial<Record<SettingsCategory, number>>>({});
  const current = useRef(category);
  const userNavigated = useRef(false);
  const ownFocusKey = useRef<string | null>(null);
  const focusKey = getSettingsRouteFocusKey(focus);
  const previousFocusKey = useRef(focusKey);
  const pendingTarget = useRef<SettingsRouteFocus | undefined>(focus);
  const pendingScroll = useRef(false);

  useEffect(() => {
    if (focus) return;
    let active = true;
    void restoreSurfaceSessionState(SETTINGS_SURFACE_SESSION_STORAGE_KEY)
      .then((saved) => {
        if (
          active &&
          !userNavigated.current &&
          saved?.settings?.activeSectionId
        ) {
          setCategory(
            getSettingsCategoryForSection(saved.settings.activeSectionId),
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useBrowserLayoutEffect(() => {
    if (previousFocusKey.current === focusKey) return;
    previousFocusKey.current = focusKey;
    if (ownFocusKey.current === focusKey) {
      ownFocusKey.current = null;
      return;
    }
    positions.current[current.current] = window.scrollY;
    pendingTarget.current = focus;
    userNavigated.current = true;
    setCategory(getSettingsCategoryForFocus(focus));
  }, [focusKey]);

  useBrowserLayoutEffect(() => {
    const changed = current.current !== category;
    if (changed) pendingScroll.current = true;
    current.current = category;
    const target = pendingTarget.current;
    if (!pendingScroll.current && !target) return;
    let innerFrame = 0;
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        pendingScroll.current = false;
        if (target) {
          const element = getSettingsRouteFocusElement(target, document);
          element?.scrollIntoView({
            block: "start",
            behavior: getPreferredScrollBehavior(window, motion),
          });
          pendingTarget.current = undefined;
        } else {
          window.scrollTo({
            top: positions.current[category] ?? 0,
            behavior: "auto",
          });
        }
        const active = document.activeElement;
        if (
          active === document.body ||
          (active instanceof HTMLElement && !active.checkVisibility())
        ) {
          const destination = target
            ? getSettingsRouteFocusElement(target, document)
            : document.querySelector<HTMLElement>(".settings-category-heading");
          if (destination) {
            if (!destination.hasAttribute("tabindex"))
              destination.tabIndex = -1;
            destination.focus({ preventScroll: true });
          }
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(innerFrame);
    };
  }, [category, focusKey, motion]);

  function selectCategory(next: SettingsCategory) {
    if (next === category) return;
    positions.current[category] = window.scrollY;
    userNavigated.current = true;
    pendingTarget.current = undefined;
    const nextFocus: SettingsRouteFocus = {
      kind: "section",
      sectionId: SETTINGS_CATEGORY_SECTIONS[next],
    };
    ownFocusKey.current = getSettingsRouteFocusKey(nextFocus);
    setCategory(next);
    window.location.hash = buildSidePanelHash({
      name: "settings",
      focus: nextFocus,
    });
  }

  return {
    activeCategory: category,
    activeSettingsSection: SETTINGS_CATEGORY_SECTIONS[category],
    selectCategory,
    scrollToSettingsTop: () =>
      window.scrollTo({
        top: 0,
        behavior: getPreferredScrollBehavior(window, motion),
      }),
  };
}
