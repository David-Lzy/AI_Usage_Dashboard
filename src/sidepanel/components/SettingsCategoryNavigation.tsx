import type { ResolvedAppLocale } from "../../shared/i18n";
import { getSettingsCategoryCopy } from "../../shared/settings-category-localized-copy";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import {
  SETTINGS_CATEGORIES,
  SETTINGS_CATEGORY_ICONS,
  type SettingsCategory,
} from "../settings-categories";
import { FusionSelect } from "./material-ui/FusionControls";
import { useRef } from "react";
import { useMotionSelection } from "../../shared/use-motion-effects";

export function SettingsCategoryNavigation({
  locale,
  label,
  value,
  onChange,
}: {
  locale: ResolvedAppLocale;
  label: string;
  value: SettingsCategory;
  onChange: (category: SettingsCategory) => void;
}) {
  const copy = getSettingsCategoryCopy(locale);
  const railRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  useMotionSelection(railRef, indicatorRef, value);
  return (
    <>
      <nav
        ref={railRef}
        className="settings-category-rail"
        aria-label={label}
        data-settings-category-navigation="rail"
      >
        <span className="settings-category-rail__indicator" ref={indicatorRef} aria-hidden="true" />
        {SETTINGS_CATEGORIES.map((category) => (
          <button
            type="button"
            key={category}
            data-settings-category-link={category}
            aria-current={value === category ? "page" : undefined}
            onClick={() => onChange(category)}
          >
            <MaterialActionIcon name={SETTINGS_CATEGORY_ICONS[category]} />
            <span>{copy[category]}</span>
          </button>
        ))}
      </nav>
      <div
        className="settings-category-mobile"
        data-settings-category-navigation="select"
      >
        <FusionSelect
          label={label}
          value={value}
          fieldIdPrefix="settings-category"
          options={SETTINGS_CATEGORIES.map((category) => ({
            value: category,
            label: copy[category],
          }))}
          onChange={onChange}
        />
      </div>
    </>
  );
}
