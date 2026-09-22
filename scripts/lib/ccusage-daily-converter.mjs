export const CCUSAGE_DAILY_MAX_INPUT_BYTES = 1 * 1024 * 1024;
export const CCUSAGE_DAILY_MAX_DAYS = 366;

const CUSTOM_SOURCE_SCHEMA_V1 = "ai-usage-dashboard.custom-source.v1";
const TOKEN_FIELDS = [
  "inputTokens",
  "outputTokens",
  "cacheCreationTokens",
  "cacheReadTokens",
  "totalTokens",
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

function readToken(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`ccusage daily ${field} must be a non-negative safe integer.`);
  }
  return value;
}

function readCost(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error("ccusage daily totalCost must be a finite non-negative number.");
  }
  return value;
}

function checkedAdd(left, right, field) {
  const sum = left + right;
  if (!Number.isSafeInteger(sum)) {
    throw new Error(`ccusage daily ${field} exceeds the safe integer range.`);
  }
  return sum;
}

function rowHasMissingPricing(row) {
  if (!hasOwn(row, "modelBreakdowns")) {
    return false;
  }
  if (!Array.isArray(row.modelBreakdowns)) {
    throw new Error("ccusage daily modelBreakdowns must be an array when present.");
  }
  return row.modelBreakdowns.some((entry) => {
    if (!isRecord(entry)) {
      throw new Error("ccusage daily modelBreakdowns entries must be objects.");
    }
    if (hasOwn(entry, "missingPricing") && typeof entry.missingPricing !== "boolean") {
      throw new Error("ccusage daily missingPricing must be a boolean when present.");
    }
    return entry.missingPricing === true;
  });
}

function validateUnpricedModels(totals) {
  if (!hasOwn(totals, "unpricedModels")) {
    return false;
  }
  if (
    !Array.isArray(totals.unpricedModels) ||
    !totals.unpricedModels.every((model) => typeof model === "string")
  ) {
    throw new Error("ccusage totals.unpricedModels must be an array of strings when present.");
  }
  return totals.unpricedModels.length > 0;
}

function formatCoverage(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/**
 * Converts only the documented ccusage `daily` report shapes. It intentionally
 * does not retain identities, model names, paths, or input rows.
 */
export function convertCcusageDailyExport(value, options) {
  if (!isRecord(value) || !Array.isArray(value.daily) || !isRecord(value.totals)) {
    throw new Error("ccusage export must contain documented daily rows and totals.");
  }
  if (value.daily.length > CCUSAGE_DAILY_MAX_DAYS) {
    throw new Error(`ccusage daily export may contain at most ${CCUSAGE_DAILY_MAX_DAYS} rows.`);
  }
  if (typeof options?.sourceId !== "string" || typeof options?.label !== "string") {
    throw new Error("ccusage converter requires a normalized source definition.");
  }
  if (!(options.mtime instanceof Date) || Number.isNaN(options.mtime.getTime())) {
    throw new Error("ccusage converter requires the export file modification time.");
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let cacheCreationTokens = 0;
  let cacheReadTokens = 0;
  let totalTokens = 0;
  let totalCost = 0;
  let hasEveryCost = value.daily.length > 0;
  let missingPricing = validateUnpricedModels(value.totals);
  const dates = new Set();

  for (const row of value.daily) {
    if (!isRecord(row)) {
      throw new Error("ccusage daily rows must be objects.");
    }
    const hasDate = hasOwn(row, "date");
    const hasPeriod = hasOwn(row, "period");
    if (hasDate === hasPeriod || !isCalendarDate(hasDate ? row.date : row.period)) {
      throw new Error("ccusage daily rows require exactly one YYYY-MM-DD date or period.");
    }
    const date = hasDate ? row.date : row.period;
    if (dates.has(date)) {
      throw new Error("ccusage daily dates must be unique.");
    }
    dates.add(date);

    const tokens = Object.fromEntries(
      TOKEN_FIELDS.map((field) => [field, readToken(row[field], field)]),
    );
    const componentTotal = checkedAdd(
      checkedAdd(tokens.inputTokens, tokens.outputTokens, "totalTokens"),
      checkedAdd(tokens.cacheCreationTokens, tokens.cacheReadTokens, "totalTokens"),
      "totalTokens",
    );
    if (tokens.totalTokens !== componentTotal) {
      throw new Error("ccusage daily totalTokens must equal the token components.");
    }
    inputTokens = checkedAdd(inputTokens, tokens.inputTokens, "inputTokens");
    outputTokens = checkedAdd(outputTokens, tokens.outputTokens, "outputTokens");
    cacheCreationTokens = checkedAdd(
      cacheCreationTokens,
      tokens.cacheCreationTokens,
      "cacheCreationTokens",
    );
    cacheReadTokens = checkedAdd(cacheReadTokens, tokens.cacheReadTokens, "cacheReadTokens");
    totalTokens = checkedAdd(totalTokens, tokens.totalTokens, "totalTokens");

    if (hasOwn(row, "totalCost")) {
      totalCost += readCost(row.totalCost);
      if (!Number.isFinite(totalCost)) {
        throw new Error("ccusage daily totalCost is too large.");
      }
    } else {
      hasEveryCost = false;
    }
    missingPricing ||= rowHasMissingPricing(row);
  }

  const datesInOrder = [...dates].sort();
  const hasKnownCost = hasEveryCost && !missingPricing;
  const label = options.label.trim().slice(0, 80);
  if (label.length === 0) {
    throw new Error("ccusage converter requires a non-empty source label.");
  }
  const facts = [
    {
      label: "Date range",
      value:
        datesInOrder.length === 0
          ? "No observed days"
          : `${datesInOrder[0]} to ${datesInOrder.at(-1)}`,
    },
    { label: "Coverage", value: formatCoverage(datesInOrder.length) },
    { label: "Export modified", value: options.mtime.toISOString() },
  ];

  return {
    schema: CUSTOM_SOURCE_SCHEMA_V1,
    id: options.sourceId,
    label,
    description: "Converted from an explicit ccusage daily JSON export.",
    status: hasKnownCost ? "ok" : "warning",
    tone: hasKnownCost ? "neutral" : "warning",
    syncedAt: options.mtime.toISOString(),
    summary:
      datesInOrder.length === 0
        ? "No daily usage rows in export."
        : `${totalTokens} total tokens across ${formatCoverage(datesInOrder.length)}.`,
    windows:
      datesInOrder.length === 0
        ? []
        : [
            { label: "Input tokens", unit: "tokens", used: inputTokens },
            { label: "Output tokens", unit: "tokens", used: outputTokens },
            {
              label: "Cache creation tokens",
              unit: "tokens",
              used: cacheCreationTokens,
            },
            { label: "Cache read tokens", unit: "tokens", used: cacheReadTokens },
            { label: "Total tokens", unit: "tokens", used: totalTokens },
          ],
    balances: hasKnownCost
      ? [{ label: "Estimated USD cost", unit: "USD", used: totalCost }]
      : [],
    facts,
    warningReason: hasKnownCost
      ? null
      : "Estimated USD cost is unavailable because pricing is incomplete or omitted.",
  };
}
