import React, { useState, useCallback } from "react";
import "../css/CalcBase.css";

/* ══════════════════════════════════════════════════════
   UNIT DATA
   For linear categories: each unit has a factor = (1 unit in base).
   Base units: meter, square meter, cubic meter, kilogram.
   Temperature: handled separately with explicit formulas.
══════════════════════════════════════════════════════ */
const CATEGORIES = {
  Length: {
    base: "Meter",
    units: [
      { name: "Meter",       factor: 1 },
      { name: "Kilometer",   factor: 1000 },
      { name: "Centimeter",  factor: 0.01 },
      { name: "Millimeter",  factor: 0.001 },
      { name: "Micrometer",  factor: 1e-6 },
      { name: "Nanometer",   factor: 1e-9 },
      { name: "Mile",        factor: 1609.344 },
      { name: "Yard",        factor: 0.9144 },
      { name: "Foot",        factor: 0.3048 },
      { name: "Inch",        factor: 0.0254 },
      { name: "Light Year",  factor: 9.461e15 },
    ],
  },
  Temperature: {
    base: null, // special handling
    units: [
      { name: "Celsius" },
      { name: "Kelvin" },
      { name: "Fahrenheit" },
    ],
  },
  Area: {
    base: "Square Meter",
    units: [
      { name: "Square Meter",      factor: 1 },
      { name: "Square Kilometer",  factor: 1e6 },
      { name: "Square Centimeter", factor: 1e-4 },
      { name: "Square Millimeter", factor: 1e-6 },
      { name: "Square Micrometer", factor: 1e-12 },
      { name: "Hectare",           factor: 10000 },
      { name: "Square Mile",       factor: 2589988.110336 },
      { name: "Square Yard",       factor: 0.83612736 },
      { name: "Square Foot",       factor: 0.09290304 },
      { name: "Square Inch",       factor: 0.00064516 },
      { name: "Acre",              factor: 4046.8564224 },
    ],
  },
  Volume: {
    base: "Cubic Meter",
    units: [
      // Metric
      { name: "Cubic Kilometer",       factor: 1e9 },
      { name: "Cubic Meter",           factor: 1 },
      { name: "Cubic Decimeter",       factor: 0.001 },
      { name: "Cubic Centimeter",      factor: 1e-6 },
      { name: "Cubic Millimeter",      factor: 1e-9 },
      { name: "Liter",                 factor: 0.001 },
      { name: "Milliliter",            factor: 1e-6 },
      // US Customary
      { name: "US Gallon",             factor: 0.00378541178 },
      { name: "US Quart",              factor: 0.000946352946 },
      { name: "US Pint",               factor: 0.000473176473 },
      { name: "US Cup",                factor: 0.000236588236 },
      { name: "US Fluid Ounce",        factor: 2.95735296e-5 },
      { name: "US Tablespoon",         factor: 1.47867648e-5 },
      { name: "US Teaspoon",           factor: 4.92892159e-6 },
      // Imperial
      { name: "Imperial Gallon",       factor: 0.00454609 },
      { name: "Imperial Quart",        factor: 0.0011365225 },
      { name: "Imperial Pint",         factor: 0.00056826125 },
      { name: "Imperial Fluid Ounce",  factor: 2.84130625e-5 },
      // Other
      { name: "Cubic Inch",            factor: 1.6387064e-5 },
      { name: "Cubic Foot",            factor: 0.028316846592 },
      { name: "Cubic Yard",            factor: 0.764554857984 },
      { name: "Barrel (Oil)",          factor: 0.158987294928 },
      { name: "Acre-Foot",             factor: 1233.48183754752 },
    ],
  },
  Weight: {
    base: "Kilogram",
    units: [
      { name: "Kilogram",         factor: 1 },
      { name: "Gram",             factor: 0.001 },
      { name: "Milligram",        factor: 1e-6 },
      { name: "Metric Ton",       factor: 1000 },
      { name: "Long Ton",         factor: 1016.05 },
      { name: "Short Ton",        factor: 907.185 },
      { name: "Pound",            factor: 0.453592 },
      { name: "Ounce",            factor: 0.0283495 },
      { name: "Carat",            factor: 0.0002 },
      { name: "Atomic Mass Unit", factor: 1.66054e-27 },
    ],
  },
};

const TABS = Object.keys(CATEGORIES);

/* ── Temperature conversion helpers ── */
function toTempBase(value, fromUnit) {
  // Convert any temperature to Celsius (base for intermediary)
  if (fromUnit === "Celsius")    return value;
  if (fromUnit === "Kelvin")     return value - 273.15;
  if (fromUnit === "Fahrenheit") return (value - 32) * 5 / 9;
  return value;
}
function fromTempBase(celsius, toUnit) {
  if (toUnit === "Celsius")    return celsius;
  if (toUnit === "Kelvin")     return celsius + 273.15;
  if (toUnit === "Fahrenheit") return celsius * 9 / 5 + 32;
  return celsius;
}

/* ── Generic conversion ── */
function convert(value, fromUnit, toUnit, category) {
  if (fromUnit === toUnit) return value;

  if (category === "Temperature") {
    const celsius = toTempBase(value, fromUnit);
    return fromTempBase(celsius, toUnit);
  }

  const units = CATEGORIES[category].units;
  const fromFactor = units.find((u) => u.name === fromUnit)?.factor ?? 1;
  const toFactor   = units.find((u) => u.name === toUnit)?.factor   ?? 1;
  return (value * fromFactor) / toFactor;
}

/* ── Format result: up to 12 significant digits, strip trailing zeros ── */
function formatResult(n) {
  if (!isFinite(n) || isNaN(n)) return "";
  // toPrecision gives us sig figs, but we strip trailing zeros + dot
  let s = parseFloat(n.toPrecision(12)).toString();
  // Avoid exponential for very large/small in favour of fixed where possible
  if (Math.abs(n) !== 0 && (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && Math.abs(n) > 0))) {
    s = n.toExponential(10).replace(/\.?0+e/, "e");
  }
  return s;
}

/* ══════════════════════════════════════════════════════
   STYLES (inline — no extra CSS file needed)
══════════════════════════════════════════════════════ */
const S = {
  wrap: {
    maxWidth: 860,
    margin: "0 auto",
  },
  tabRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  tab: (active) => ({
    padding: "8px 20px",
    border: active ? "none" : "1.5px solid rgba(99,102,241,0.25)",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13.5,
    background: active ? "#4f46e5" : "#fff",
    color:      active ? "#fff"    : "#4b5280",
    transition: "background 0.15s, color 0.15s",
    minHeight: 36,
  }),
  cols: {
    display: "grid",
    gridTemplateColumns: "1fr 40px 1fr",
    gap: 0,
    alignItems: "start",
  },
  colLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7a9e",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    fontSize: 15,
    fontWeight: 600,
    color: "#1e1b4b",
    background: "#f8f9ff",
    border: "1.5px solid rgba(99,102,241,0.22)",
    borderRadius: 10,
    outline: "none",
    marginBottom: 8,
  },
  listbox: {
    width: "100%",
    boxSizing: "border-box",
    height: 260,
    border: "1.5px solid rgba(99,102,241,0.18)",
    borderRadius: 10,
    overflowY: "auto",
    background: "#fff",
    padding: "4px 0",
  },
  listItem: (selected) => ({
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: selected ? 700 : 400,
    color:      selected ? "#fff" : "#374151",
    background: selected ? "#4f46e5" : "transparent",
    userSelect: "none",
    whiteSpace: "nowrap",
  }),
  arrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 110,
    fontSize: 22,
    color: "#9ca3af",
    userSelect: "none",
  },
};

/* ══════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════ */
export default function ConversionCalculator() {
  const [activeTab, setActiveTab] = useState("Length");

  // Per-tab state: { fromUnit, toUnit, fromVal, toVal, lastEdited }
  const initTabState = useCallback((cat) => {
    const units = CATEGORIES[cat].units;
    return {
      fromUnit: units[0].name,
      toUnit:   units[1]?.name ?? units[0].name,
      fromVal:  "1",
      toVal:    formatResult(convert(1, units[0].name, units[1]?.name ?? units[0].name, cat)),
      lastEdited: "from",
    };
  }, []);

  const [tabStates, setTabStates] = useState(() => {
    const s = {};
    TABS.forEach((t) => { s[t] = initTabState(t); });
    return s;
  });

  const state = tabStates[activeTab];
  const units = CATEGORIES[activeTab].units;

  const updateState = (patch) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...patch },
    }));
  };

  /* ── Handle From input change ── */
  const handleFromVal = (raw) => {
    const num = parseFloat(raw);
    if (raw === "" || raw === "-") {
      updateState({ fromVal: raw, toVal: "", lastEdited: "from" });
      return;
    }
    if (isNaN(num)) return; // ignore non-numeric
    const result = convert(num, state.fromUnit, state.toUnit, activeTab);
    updateState({ fromVal: raw, toVal: formatResult(result), lastEdited: "from" });
  };

  /* ── Handle To input change ── */
  const handleToVal = (raw) => {
    const num = parseFloat(raw);
    if (raw === "" || raw === "-") {
      updateState({ toVal: raw, fromVal: "", lastEdited: "to" });
      return;
    }
    if (isNaN(num)) return;
    const result = convert(num, state.toUnit, state.fromUnit, activeTab);
    updateState({ toVal: raw, fromVal: formatResult(result), lastEdited: "to" });
  };

  /* ── Handle From unit selection ── */
  const handleFromUnit = (unitName) => {
    let fromVal = state.fromVal;
    let toVal   = state.toVal;
    const num = parseFloat(state.lastEdited === "from" ? state.fromVal : state.toVal);
    if (isFinite(num)) {
      if (state.lastEdited === "from") {
        toVal = formatResult(convert(num, unitName, state.toUnit, activeTab));
      } else {
        fromVal = formatResult(convert(num, state.toUnit, unitName, activeTab));
      }
    }
    updateState({ fromUnit: unitName, fromVal, toVal });
  };

  /* ── Handle To unit selection ── */
  const handleToUnit = (unitName) => {
    let fromVal = state.fromVal;
    let toVal   = state.toVal;
    const num = parseFloat(state.lastEdited === "from" ? state.fromVal : state.toVal);
    if (isFinite(num)) {
      if (state.lastEdited === "from") {
        toVal = formatResult(convert(num, state.fromUnit, unitName, activeTab));
      } else {
        fromVal = formatResult(convert(num, unitName, state.fromUnit, activeTab));
      }
    }
    updateState({ toUnit: unitName, fromVal, toVal });
  };

  /* ── Switch tab ── */
  const handleTab = (cat) => {
    setActiveTab(cat);
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Conversion Calculator</h1>
        <p className="muted">
          Convert between units of length, temperature, area, volume, and weight.
          Type a value in either field for instant two-way conversion.
        </p>
      </header>

      <div style={S.wrap}>
        <div className="card">
          {/* ── Tabs ── */}
          <div style={S.tabRow} role="tablist">
            {TABS.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeTab === cat}
                style={S.tab(activeTab === cat)}
                onClick={() => handleTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Two-column converter ── */}
          <div style={S.cols}>
            {/* FROM column */}
            <div>
              <div style={S.colLabel}>From:</div>
              <input
                style={S.input}
                value={state.fromVal}
                onChange={(e) => handleFromVal(e.target.value)}
                placeholder="Enter value"
              />
              <div style={S.listbox}>
                {units.map((u) => (
                  <div
                    key={u.name}
                    style={S.listItem(state.fromUnit === u.name)}
                    onClick={() => handleFromUnit(u.name)}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={S.arrow}>⇄</div>

            {/* TO column */}
            <div>
              <div style={S.colLabel}>To:</div>
              <input
                style={S.input}
                value={state.toVal}
                onChange={(e) => handleToVal(e.target.value)}
                placeholder="Result"
              />
              <div style={S.listbox}>
                {units.map((u) => (
                  <div
                    key={u.name}
                    style={S.listItem(state.toUnit === u.name)}
                    onClick={() => handleToUnit(u.name)}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick-reference formula line ── */}
          {state.fromVal !== "" && state.toVal !== "" && (
            <div style={{ marginTop: 18, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontSize: 13, color: "#4b5280" }}>
              <strong>{state.fromVal} {state.fromUnit}</strong>
              {" = "}
              <strong>{state.toVal} {state.toUnit}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
