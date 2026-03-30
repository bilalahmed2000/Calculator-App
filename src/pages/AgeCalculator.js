import React, { useState } from "react";
import "../css/CalcBase.css";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const today = new Date();
const THIS_YEAR = today.getFullYear();

const daysInMonth = (m, y) => new Date(y, m, 0).getDate(); // m is 1-based

const defaultBirth = () => ({ month: 1, day: 1, year: THIS_YEAR - 25 });
const defaultToday = () => ({
  month: today.getMonth() + 1,
  day:   today.getDate(),
  year:  THIS_YEAR,
});

const pickerToDate = ({ month, day, year }) => new Date(year, month - 1, day);

// Years: 120 years back for birth, current year for "age at"
const BIRTH_YEARS = Array.from({ length: 121 }, (_, i) => THIS_YEAR - i);
const AGE_AT_YEARS = Array.from({ length: 11 }, (_, i) => THIS_YEAR - 5 + i);

/* ── Date Picker ── */
const LS = {
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6b7a9e", marginBottom: 6,
    letterSpacing: "0.4px", textTransform: "uppercase",
  },
  sel: {
    flex: 1, minWidth: 100,
    padding: "9px 10px", fontSize: 14, fontWeight: 600,
    color: "#1e1b4b", background: "#f8f9ff",
    border: "1.5px solid rgba(99,102,241,0.22)",
    borderRadius: 10, outline: "none", cursor: "pointer",
  },
};

function DatePicker({ label, value, onChange, yearOptions }) {
  const maxDay = daysInMonth(value.month, value.year);
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1);

  const update = (key, val) => {
    const next = { ...value, [key]: Number(val) };
    const limit = daysInMonth(next.month, next.year);
    if (next.day > limit) next.day = limit;
    onChange(next);
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={LS.label}>{label}</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select style={LS.sel} value={value.month} onChange={(e) => update("month", e.target.value)}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth: 72 }} value={value.day} onChange={(e) => update("day", e.target.value)}>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth: 90 }} value={value.year} onChange={(e) => update("year", e.target.value)}>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ── Format large number with commas ── */
const fmt = (n) => Math.round(n).toLocaleString("en-US");

/* ══════════════════════════════════════════════════════
   CALCULATE AGE
══════════════════════════════════════════════════════ */
function calcAge(birth, ageAt) {
  const start = pickerToDate(birth);
  const end   = pickerToDate(ageAt);

  if (end < start) return null; // end before birth

  // Years / months / days  (Gregorian calendar-aware)
  let years  = end.getFullYear() - start.getFullYear();
  let months = end.getMonth()    - start.getMonth();
  let days   = end.getDate()     - start.getDate();

  if (days < 0) {
    months -= 1;
    days   += daysInMonth(end.getMonth() === 0 ? 12 : end.getMonth(), end.getMonth() === 0 ? end.getFullYear() - 1 : end.getFullYear());
  }
  if (months < 0) {
    years  -= 1;
    months += 12;
  }

  // Total counts from raw millisecond diff
  const diffMs      = end - start;
  const totalDays   = Math.floor(diffMs / 86_400_000);
  const totalWeeks  = Math.floor(totalDays / 7);
  const totalHours  = Math.floor(diffMs / 3_600_000);
  const totalMins   = Math.floor(diffMs / 60_000);
  const totalSecs   = Math.floor(diffMs / 1_000);
  const totalMonths = years * 12 + months;

  return { years, months, days, totalDays, totalWeeks, totalHours, totalMins, totalSecs, totalMonths };
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AgeCalculator() {
  const [birth,  setBirth]  = useState(defaultBirth());
  const [ageAt,  setAgeAt]  = useState(defaultToday());
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");

  const calculate = () => {
    setError("");
    const r = calcAge(birth, ageAt);
    if (!r) {
      setError("The 'Age at the Date of' must be on or after the date of birth.");
      setResult(null);
    } else {
      setResult(r);
    }
  };

  const clear = () => {
    setBirth(defaultBirth());
    setAgeAt(defaultToday());
    setResult(null);
    setError("");
  };

  /* ── Result stat block ── */
  const Stat = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #f0eeff" }}>
      <span style={{ fontSize: 13.5, color: "#4b5280" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>{value}</span>
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Age Calculator</h1>
        <p className="muted">
          Calculate age between two dates — in years, months, days, weeks,
          hours, minutes, and seconds.
        </p>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── INPUT CARD ── */}
        <section className="card">
          <DatePicker
            label="Date of Birth:"
            value={birth}
            onChange={setBirth}
            yearOptions={BIRTH_YEARS}
          />

          <DatePicker
            label="Age at the Date of:"
            value={ageAt}
            onChange={setAgeAt}
            yearOptions={AGE_AT_YEARS}
          />

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13.5 }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={calculate}
              style={{ padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
            >
              Calculate
            </button>
            <button
              onClick={clear}
              style={{ padding: "12px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "#fff", color: "#6b7a9e" }}
            >
              Clear
            </button>
          </div>
        </section>

        {/* ── RESULTS CARD ── */}
        {result && (
          <section className="card">
            {/* Primary result — green header */}
            <div style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.28)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Age
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#065f46", letterSpacing: "-0.3px" }}>
                {result.years} year{result.years !== 1 ? "s" : ""}, {result.months} month{result.months !== 1 ? "s" : ""}, {result.days} day{result.days !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Breakdown table */}
            <div style={{ border: "1px solid #f0eeff", borderRadius: 12, overflow: "hidden", marginBottom: 6 }}>
              <Stat label="Years"   value={fmt(result.years)} />
              <Stat label="Months"  value={fmt(result.totalMonths)} />
              <Stat label="Weeks"   value={fmt(result.totalWeeks)} />
              <Stat label="Days"    value={fmt(result.totalDays)} />
              <Stat label="Hours"   value={fmt(result.totalHours)} />
              <Stat label="Minutes" value={fmt(result.totalMins)} />
              <Stat label="Seconds" value={fmt(result.totalSecs)} />
            </div>

            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, lineHeight: 1.6 }}>
              Calculated from{" "}
              <strong>{MONTHS[birth.month - 1]} {birth.day}, {birth.year}</strong> to{" "}
              <strong>{MONTHS[ageAt.month - 1]} {ageAt.day}, {ageAt.year}</strong>.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
