import { useEffect, useState } from "react";

import type { MotionMode } from "../providers/types";
import { getPreferredScrollBehavior } from "./motion";
import {
  SETTINGS_SECTION_IDS,
  SETTINGS_SECTION_ID_VALUES,
  type SettingsSectionId,
} from "./settings-section-ids";

export function useSettingsSectionNavigation(motionMode: MotionMode = "system") {
  const [activeSettingsSection, setActiveSettingsSection] =
    useState<SettingsSectionId>(SETTINGS_SECTION_IDS.overview);

  useEffect(() => {
    if (
      typeof document === "undefined" ||
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const sectionElements = SETTINGS_SECTION_ID_VALUES
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top,
          );
        const nextSectionId = visibleEntries[0]?.target.id as
          | SettingsSectionId
          | undefined;

        if (nextSectionId) {
          setActiveSettingsSection(nextSectionId);
        }
      },
      {
        root: null,
        rootMargin: "-28% 0px -62% 0px",
        threshold: 0,
      },
    );

    for (const sectionElement of sectionElements) {
      observer.observe(sectionElement);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  function scrollToSection(sectionId: SettingsSectionId) {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      block: "start",
      behavior: getPreferredScrollBehavior(
        typeof window === "undefined" ? undefined : window,
        motionMode,
      ),
    });
  }

  function scrollToSettingsTop() {
    if (typeof window === "undefined") {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: getPreferredScrollBehavior(window, motionMode),
    });
  }

  return {
    activeSettingsSection,
    scrollToSection,
    scrollToSettingsTop,
  };
}
