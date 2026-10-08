import React from "react";

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const STANDARD_PRESETS = [
  {
    key: "today",
    label: "Today",
    getRange: () => { const t = toISO(new Date()); return { from: t, to: t }; },
  },
  {
    key: "month",
    label: "This Month",
    getRange: () => {
      const d = new Date();
      return { from: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`, to: toISO(d) };
    },
  },
  {
    key: "year",
    label: "This Year",
    getRange: () => {
      const d = new Date();
      return { from: `${d.getFullYear()}-01-01`, to: toISO(d) };
    },
  },
  {
    key: "alltime",
    label: "All Time",
    getRange: () => ({ from: "", to: "" }),
  },
];

/**
 * DateRangeBar — preset pill buttons + custom From/To date inputs.
 *
 * Props:
 *   presets      – array from STANDARD_PRESETS or a subset; defaults to STANDARD_PRESETS
 *   fromDate     – controlled ISO date string (or "")
 *   setFromDate  – setter
 *   toDate       – controlled ISO date string (or "")
 *   setToDate    – setter
 *   onPresetApply – optional callback(from, to) called when a preset is clicked
 *                   (use this in Reports to auto-apply the filter)
 */
const DateRangeBar = ({
  presets = STANDARD_PRESETS,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onPresetApply,
}) => {
  const isPresetActive = (preset) => {
    const { from, to } = preset.getRange();
    return fromDate === from && toDate === to;
  };

  const noPresetMatches =
    fromDate !== undefined &&
    toDate !== undefined &&
    !presets.some(isPresetActive);
  const isCustom = noPresetMatches && (fromDate || toDate);

  const handlePreset = (preset) => {
    const { from, to } = preset.getRange();
    setFromDate(from);
    setToDate(to);
    if (onPresetApply) onPresetApply(from, to);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {/* Preset pill group */}
      <div
        style={{
          display: "inline-flex",
          gap: "3px",
          padding: "3px",
          background: "var(--bg-body)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          flexShrink: 0,
        }}
      >
        {presets.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.key}
              onClick={() => handlePreset(preset)}
              style={{
                padding: "5px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                borderRadius: "6px",
                background: active ? "var(--color-primary, #6366f1)" : "transparent",
                color: active ? "#fff" : "var(--color-text-subtle)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {preset.label}
            </button>
          );
        })}
        {isCustom && (
          <span
            style={{
              padding: "5px 10px",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "6px",
              background: "var(--bg-subtle, #f3f4f6)",
              color: "var(--color-text-subtle)",
              whiteSpace: "nowrap",
            }}
          >
            Custom
          </span>
        )}
      </div>

      <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", userSelect: "none" }}>
        or
      </span>

      {/* Custom date inputs */}
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        title="From date"
        style={{
          padding: "6px 10px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          outline: "none",
          fontSize: "0.85rem",
          fontWeight: fromDate ? "600" : "400",
          color: fromDate ? "var(--color-primary)" : "inherit",
        }}
      />
      <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", userSelect: "none" }}>–</span>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        title="To date"
        style={{
          padding: "6px 10px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          outline: "none",
          fontSize: "0.85rem",
          fontWeight: toDate ? "600" : "400",
          color: toDate ? "var(--color-primary)" : "inherit",
        }}
      />
    </div>
  );
};

export default DateRangeBar;
