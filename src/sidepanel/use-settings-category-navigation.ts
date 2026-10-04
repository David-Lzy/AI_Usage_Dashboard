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
import { animateEntrance, animateMotion, readMotion } from "../shared/motion-runtime";
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
  const [isCategoryRestoring, setIsCategoryRestoring] = useState(
    !focus && typeof window !== "undefined",
  );
  const positions = useRef<Partial<Record<SettingsCategory, number>>>({});
  const current = useRef(category);
  const userNavigated = useRef(false);
  const ownFocusKey = useRef<string | null>(null);
  const focusKey = getSettingsRouteFocusKey(focus);
  const previousFocusKey = useRef(focusKey);
  const pendingTarget = useRef<SettingsRouteFocus | undefined>(focus);
  const pendingScroll = useRef(false);
  const entrances = useRef<Array<() => void>>([]);

  useBrowserLayoutEffect(() => () => {
    entrances.current.forEach((cancel) => cancel());
    entrances.current = [];
  }, [category, motion]);

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
      .catch(() => {})
      .finally(() => {
        if (active) setIsCategoryRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useBrowserLayoutEffect(() => {
    if (previousFocusKey.current === focusKey) return;
    previousFocusKey.current = focusKey;
    setIsCategoryRestoring(false);
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
    const animations: Array<() => void> = [];
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
        const content = document.querySelector<HTMLElement>(".settings-category-content");
        if (content?.checkVisibility()) {
          entrances.current.forEach((cancel) => cancel());
          entrances.current = animations;
          const fade = animateMotion(content, [{ opacity: 0.45 }, { opacity: 1 }], { channel: "category" });
          if (fade) animations.push(fade);
          const count = readMotion(content).profile === "expressive" ? 4 : 1;
          const headings = [...content.querySelectorAll<HTMLElement>(".settings-category-heading, h2, h3")]
            .filter((heading) => heading.checkVisibility() && heading.getBoundingClientRect().top < innerHeight && heading.getBoundingClientRect().bottom > 0)
            .slice(0, count);
          headings.forEach((heading, index) => { const cancel = animateEntrance(heading, index); if (cancel) animations.push(cancel); });
          if (count > 1) {
            [...content.querySelectorAll<HTMLElement>(".settings-connection, .settings-appearance-group, [data-settings-category-panel] > section")]
              .filter((group) => group.checkVisibility() && group.getBoundingClientRect().top < innerHeight && group.getBoundingClientRect().bottom > 0)
              .slice(0, 4).forEach((group, index) => {
                const cancel = animateMotion(group, [{ opacity: 0.5 }, { opacity: 1 }], { channel: "category-group", delay: index * 30 });
                if (cancel) animations.push(cancel);
              });
          }
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(innerFrame);
      // An acknowledgement of our own hash can arrive after the first frame.
      // It must not cancel the entrance of the category that is still selected.
    };
  }, [category, focusKey, motion]);

  function selectCategory(next: SettingsCategory) {
    if (next === category) return;
    positions.current[category] = window.scrollY;
    userNavigated.current = true;
    setIsCategoryRestoring(false);
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
    isCategoryRestoring,
    activeSettingsSection: SETTINGS_CATEGORY_SECTIONS[category],
    selectCategory,
    scrollToSettingsTop: () =>
      window.scrollTo({
        top: 0,
        behavior: getPreferredScrollBehavior(window, motion),
      }),
  };
}
