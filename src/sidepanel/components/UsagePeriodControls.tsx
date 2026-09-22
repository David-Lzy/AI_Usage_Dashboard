import { useEffect, useId, useState } from "react";

import type { RuntimeI18n } from "../../shared/i18n";
import { buildUsagePeriodLocalizedCopy } from "../../shared/usage-period-localized-copy";
import {
  getUsagePeriodRange,
  getUsagePeriodReferenceTimezone,
  type UsagePeriodPreset,
} from "../../shared/usage-periods";
import { type UsageDateRange, usageRangeDayCount } from "../../shared/usage-aggregates";
import { MaterialSelect } from "./MaterialSelect";
import "./UsagePeriodControls.css";

type UsagePeriodControlsProps = {
  i18n: RuntimeI18n;
  range: UsageDateRange;
  referenceTimezone?: string | null;
  onChange: (range: UsageDateRange) => void;
  surface: "export" | "comparison";
};

const PERIOD_PRESETS: readonly UsagePeriodPreset[] = [
  "this_week", "this_month", "last_7_days", "last_30_days", "custom",
];

export function UsagePeriodControls({ i18n, range, referenceTimezone, onChange, surface }: UsagePeriodControlsProps) {
  const copy = buildUsagePeriodLocalizedCopy(i18n.resolvedLocale);
  const [preset, setPreset] = useState<UsagePeriodPreset>("custom");
  const startId = useId();
  const endId = useId();
  const invalidId = useId();
  const validRange = usageRangeDayCount(range) > 0;
  const timezone = getUsagePeriodReferenceTimezone(referenceTimezone);
  const dateProbe = surface === "export" ? "data-usage-export-date-input" : "data-deployment-comparison-date-input";

  useEffect(() => {
    if (preset === "custom") return;
    const expected = getUsagePeriodRange(preset, new Date(), timezone);
    if (expected.start !== range.start || expected.end !== range.end) setPreset("custom");
  }, [preset, range.end, range.start, timezone]);

  function selectPreset(nextPreset: UsagePeriodPreset) {
    setPreset(nextPreset);
    if (nextPreset !== "custom") onChange(getUsagePeriodRange(nextPreset, new Date(), timezone));
  }

  function updateRange(part: keyof UsageDateRange, value: string) {
    setPreset("custom");
    onChange({ ...range, [part]: value });
  }

  return <div className="usage-period-controls" data-usage-period-controls="">
    <div data-usage-period-preset="">
      <MaterialSelect
        fieldIdPrefix={`${surface}-usage-period`}
        label={copy.preset}
        options={PERIOD_PRESETS.map((value) => ({ value, label: copy.presets[value] }))}
        value={preset}
        onChange={selectPreset}
      />
    </div>
    <label className="usage-period-controls__date" htmlFor={startId}>
      <span>{copy.startDate}</span>
      <input id={startId} type="date" value={range.start} aria-describedby={!validRange ? invalidId : undefined} aria-invalid={!validRange} {...{ [dateProbe]: "start" }} onChange={(event) => updateRange("start", event.target.value)} />
    </label>
    <label className="usage-period-controls__date" htmlFor={endId}>
      <span>{copy.endDate}</span>
      <input id={endId} type="date" value={range.end} aria-describedby={!validRange ? invalidId : undefined} aria-invalid={!validRange} {...{ [dateProbe]: "end" }} onChange={(event) => updateRange("end", event.target.value)} />
    </label>
    <p className="usage-period-controls__timezone">{copy.referenceTimezone(timezone)}</p>
    {!validRange ? <p id={invalidId} className="usage-period-controls__error" role="alert">{copy.invalidRange}</p> : null}
  </div>;
}
