import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { MotionMode } from "../../providers/types";
import { getPreferredScrollBehavior } from "../motion";
import type { SettingsSectionId } from "../settings-section-ids";

export type SettingsSectionNavItem = {
  id: SettingsSectionId;
  label: string;
};

type SettingsSectionNavigationProps = {
  ariaLabel: string;
  activeSectionId: SettingsSectionId;
  items: SettingsSectionNavItem[];
  motionMode?: MotionMode;
  onSelectSection: (sectionId: SettingsSectionId) => void;
};

type SettingsBackToTopButtonProps = {
  label: string;
  shortLabel: string;
  onClick: () => void;
};

export function SettingsSectionNavigation({
  ariaLabel,
  activeSectionId,
  items,
  motionMode = "system",
  onSelectSection,
}: SettingsSectionNavigationProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="true"]');

    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) {
      return;
    }

    const navBounds = nav.getBoundingClientRect();
    const activeBounds = active.getBoundingClientRect();
    const leftOverflow = activeBounds.left - navBounds.left - 8;
    const rightOverflow = activeBounds.right - navBounds.right + 8;

    if (leftOverflow < 0 || rightOverflow > 0) {
      nav.scrollBy({
        left: leftOverflow < 0 ? leftOverflow : rightOverflow,
        behavior: getPreferredScrollBehavior(window, motionMode),
      });
    }
  }, [activeSectionId, motionMode]);

  return (
    <nav
      ref={navRef}
      className="settings-section-nav"
      aria-label={ariaLabel}
      data-i18n-layout-contract="settings-navigation"
    >
      {items.map((item) => {
        const isActive = activeSectionId === item.id;

        return (
          <button
            key={item.id}
            className="settings-nav-chip"
            type="button"
            aria-current={isActive ? "true" : undefined}
            data-active={isActive ? "true" : "false"}
            onClick={() => onSelectSection(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export function SettingsBackToTopButton({
  label,
  shortLabel,
  onClick,
}: SettingsBackToTopButtonProps) {
  const button = (
    <button
      className="settings-back-to-top-fab"
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width="22"
        height="22"
      >
        <path
          d="M12 5l-7 7 1.4 1.4 4.6-4.58V20h2V8.82l4.6 4.58L19 12z"
          fill="currentColor"
        />
      </svg>
      <span className="settings-back-to-top-fab__label">{shortLabel}</span>
    </button>
  );

  if (typeof document === "undefined") {
    return button;
  }

  return createPortal(button, document.body);
}
