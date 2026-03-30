import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ---------- Constants ---------- */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.",
];

const SIDEBAR_LINKS = [
  { label: "Time Calculator",        to: "/time" },
  { label: "Hours Calculator",       to: "/hours-calculator" },
  { label: "Age Calculator",         to: "/age" },
  { label: "Date Calculator",        to: "/date" },
  { label: "Retirement Calculator",  to: "/retirement" },
];

/* ---------- Inline style helpers (keep consistent with CalcBase theme) ---------- */
const selectStyle = {
  padding: "10px 10px",
  borderRadius: 12,
  border: "1.5px solid rgba(99,102,241,0.2)",
  background: "#f8f9ff",
  color: "#1e1b4b",
  fontSize: 14,
  cursor: "pointer",
  outline: "none",
};

const inputStyle = {
  background: "#f8f9ff",
  color: "#1e1b4b",
  border: "1.5px solid rgba(99,102,241,0.2)",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

/* ---------- Pure helpers ---------- */

/** Parse "h:mm" or "hh:mm" → {h, m} or null on invalid. */
function parseTime(str) {
  if (!str || !str.trim()) return null;
  const match = str.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  return { h, m };
}

/** Convert 12-hour {h, m, ampm} to total minutes since midnight. */
function convertTo24HourMins(h, m, ampm) {
  let hours = h;
  if (ampm === "AM") {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  return hours * 60 + m;
}

/** Return the 24-hour integer (0-23) for use in Date constructor. */
function to24HourValue(h, ampm) {
  if (ampm === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

/** Days in a given month/year. */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/** Format hh:mm AM/PM display string. */
function formatTimeDisplay(h, m, ampm) {
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Format "Mar. 5, 2026" display string. */
function formatDateDisplay(month, day, year) {
  return `${MONTH_ABBR[month - 1]} ${day}, ${year}`;
}

/** Format total hours as a clean string (no trailing .0). */
function formatHoursLabel(totalHours) {
  if (Number.isInteger(totalHours)) return `${totalHours}`;
  return parseFloat(totalHours.toFixed(4)).toString();
}

/* ---------- Component ---------- */
export default function HoursCalculator() {
  /* Section 1 — times only */
  const [s1, setS1] = useState({
    startTime: "", startAmPm: "AM",
    endTime:   "", endAmPm:   "PM",
  });
  const [result1, setResult1] = useState(null);
  const [error1,  setError1]  = useState("");

  /* Section 2 — full date + time */
  const initNow = new Date();
  const [s2, setS2] = useState({
    startMonth: initNow.getMonth() + 1,
    startDay:   initNow.getDate(),
    startYear:  initNow.getFullYear(),
    startTime:  "",
    startAmPm:  "AM",
    endMonth:   initNow.getMonth() + 1,
    endDay:     initNow.getDate(),
    endYear:    initNow.getFullYear(),
    endTime:    "",
    endAmPm:    "PM",
  });
  const [result2, setResult2] = useState(null);
  const [error2,  setError2]  = useState("");

  /* ---- helpers ---- */
  function getNowTimeParts() {
    const n = new Date();
    let h = n.getHours();
    const m = n.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0)       h = 12;
    else if (h > 12)   h -= 12;
    return {
      timeStr: `${h}:${String(m).padStart(2, "0")}`,
      ampm,
      month: n.getMonth() + 1,
      day:   n.getDate(),
      year:  n.getFullYear(),
    };
  }

  /* ---- Section 1 handlers ---- */
  const setNow1 = (which) => {
    const { timeStr, ampm } = getNowTimeParts();
    if (which === "start") setS1(p => ({ ...p, startTime: timeStr, startAmPm: ampm }));
    else                   setS1(p => ({ ...p, endTime:   timeStr, endAmPm:   ampm }));
  };

  const calculate1 = () => {
    const start = parseTime(s1.startTime);
    const end   = parseTime(s1.endTime);
    if (!start) { setError1('Invalid start time. Use hh:mm format (e.g. 8:30).'); setResult1(null); return; }
    if (!end)   { setError1('Invalid end time. Use hh:mm format (e.g. 5:30).');   setResult1(null); return; }

    let startMins = convertTo24HourMins(start.h, start.m, s1.startAmPm);
    let endMins   = convertTo24HourMins(end.h,   end.m,   s1.endAmPm);
    if (endMins <= startMins) endMins += 24 * 60; // treat as next day

    const totalMinutes = endMins - startMins;
    const totalHours   = totalMinutes / 60;

    setError1("");
    setResult1({
      totalMinutes,
      totalHours,
      startDisplay: formatTimeDisplay(start.h, start.m, s1.startAmPm),
      endDisplay:   formatTimeDisplay(end.h,   end.m,   s1.endAmPm),
    });
  };

  const clear1 = () => {
    setS1({ startTime: "", startAmPm: "AM", endTime: "", endAmPm: "PM" });
    setResult1(null);
    setError1("");
  };

  /* ---- Section 2 handlers ---- */
  const setNow2 = (which) => {
    const { timeStr, ampm, month, day, year } = getNowTimeParts();
    if (which === "start") {
      setS2(p => ({ ...p, startTime: timeStr, startAmPm: ampm, startMonth: month, startDay: day, startYear: year }));
    } else {
      setS2(p => ({ ...p, endTime:   timeStr, endAmPm:   ampm, endMonth:   month, endDay:   day, endYear:   year }));
    }
  };

  const calculate2 = () => {
    // Parse times (default to 12:00 if blank)
    let startT = { h: 12, m: 0 };
    let endT   = { h: 12, m: 0 };

    if (s2.startTime) {
      const parsed = parseTime(s2.startTime);
      if (!parsed) { setError2('Invalid start time. Use hh:mm format (e.g. 8:30).'); setResult2(null); return; }
      startT = parsed;
    }
    if (s2.endTime) {
      const parsed = parseTime(s2.endTime);
      if (!parsed) { setError2('Invalid end time. Use hh:mm format (e.g. 5:30).'); setResult2(null); return; }
      endT = parsed;
    }

    const startDate = new Date(
      s2.startYear, s2.startMonth - 1, s2.startDay,
      to24HourValue(startT.h, s2.startAmPm), startT.m, 0
    );
    const endDate = new Date(
      s2.endYear, s2.endMonth - 1, s2.endDay,
      to24HourValue(endT.h, s2.endAmPm), endT.m, 0
    );

    if (endDate <= startDate) {
      setError2("End date/time must be after start date/time.");
      setResult2(null);
      return;
    }

    const diffMs       = endDate - startDate;
    const totalMinutes = Math.round(diffMs / 60000);
    const totalHours   = totalMinutes / 60;

    setError2("");
    setResult2({
      totalMinutes,
      totalHours,
      startDisplay: `${formatDateDisplay(s2.startMonth, s2.startDay, s2.startYear)}, ${formatTimeDisplay(startT.h, startT.m, s2.startAmPm)}`,
      endDisplay:   `${formatDateDisplay(s2.endMonth,   s2.endDay,   s2.endYear)},   ${formatTimeDisplay(endT.h,   endT.m,   s2.endAmPm)}`,
    });
  };

  const clear2 = () => {
    const n = new Date();
    setS2({
      startMonth: n.getMonth() + 1, startDay: n.getDate(), startYear: n.getFullYear(),
      startTime: "", startAmPm: "AM",
      endMonth:   n.getMonth() + 1, endDay:   n.getDate(), endYear:   n.getFullYear(),
      endTime: "", endAmPm: "PM",
    });
    setResult2(null);
    setError2("");
  };

  /* ---- Dropdown data ---- */
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 200 }, (_, i) => currentYear - 100 + i);

  function getDayOptions(month, year) {
    const count = daysInMonth(month, year);
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  /* ---- Sub-components ---- */
  function ResultBox({ result }) {
    return (
      <section className="card" style={{ marginBottom: 18 }}>
        <div className="result-header">
          <span>Result</span>
        </div>
        <p style={{ color: "#374151", fontSize: 14, margin: "0 0 14px", lineHeight: 1.6 }}>
          The time between <strong>{result.startDisplay}</strong> and{" "}
          <strong>{result.endDisplay}</strong> is:
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="kpi" style={{ flex: 1, minWidth: 150 }}>
            <div className="kpi-label">Hours</div>
            <div className="kpi-value">{formatHoursLabel(result.totalHours)}</div>
            <div className="kpi-sub">hours</div>
          </div>
          <div className="kpi" style={{ flex: 1, minWidth: 150 }}>
            <div className="kpi-label">Minutes</div>
            <div className="kpi-value">{result.totalMinutes}</div>
            <div className="kpi-sub">minutes</div>
          </div>
        </div>
      </section>
    );
  }

  function TimeInputRow({ timeVal, ampmVal, onTimeChange, onAmPmChange, onNow }) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="hh:mm"
          value={timeVal}
          onChange={(e) => onTimeChange(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 80px", minWidth: 80 }}
        />
        <select
          value={ampmVal}
          onChange={(e) => onAmPmChange(e.target.value)}
          style={selectStyle}
        >
          <option>AM</option>
          <option>PM</option>
        </select>
        <button type="button" className="link-btn" onClick={onNow}>Now</button>
      </div>
    );
  }

  const fieldLabelStyle = {
    display: "block", fontSize: 11.5, fontWeight: 700,
    color: "#6b7a9e", marginBottom: 7, letterSpacing: "0.4px",
    textTransform: "uppercase",
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Hours Calculator</h1>
        <p className="muted">
          Calculate the number of hours and minutes between two times, or between two
          full date-and-time values. Perfect for tracking work shifts, travel duration,
          and scheduling.
        </p>
      </header>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ===== Section 1 — Result ===== */}
          {result1 && <ResultBox result={result1} />}

          {/* ===== Section 1 — Calculator ===== */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Hours Calculator</h2>
            <p className="rng-desc">
              Enter a start and end time to find the total hours and minutes between them.
              If the end time is earlier than the start time, the end is assumed to be
              the following day.
            </p>

            {/* Blue instruction bar */}
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 10, padding: "9px 14px", marginBottom: 18,
              color: "#1d4ed8", fontSize: 13.5, fontWeight: 500,
            }}>
              Enter times in <strong>hh:mm</strong> format (e.g.{" "}
              <strong>8:30</strong> or <strong>12:00</strong>), then choose AM or PM.
            </div>

            {/* Start Time */}
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabelStyle}>Start Time</label>
              <TimeInputRow
                timeVal={s1.startTime}
                ampmVal={s1.startAmPm}
                onTimeChange={(v) => setS1(p => ({ ...p, startTime: v }))}
                onAmPmChange={(v) => setS1(p => ({ ...p, startAmPm: v }))}
                onNow={() => setNow1("start")}
              />
            </div>

            {/* End Time */}
            <div style={{ marginBottom: 20 }}>
              <label style={fieldLabelStyle}>End Time</label>
              <TimeInputRow
                timeVal={s1.endTime}
                ampmVal={s1.endAmPm}
                onTimeChange={(v) => setS1(p => ({ ...p, endTime: v }))}
                onAmPmChange={(v) => setS1(p => ({ ...p, endAmPm: v }))}
                onNow={() => setNow1("end")}
              />
            </div>

            <div className="row two rng-btn-row">
              <button type="button" className="btn-primary" onClick={calculate1}>Calculate</button>
              <button type="button" className="btn-secondary" onClick={clear1}>Clear</button>
            </div>

            {error1 && <div className="rng-error">{error1}</div>}
          </section>

          {/* ===== Section 2 — Hours Between Two Dates ===== */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Hours Between Two Dates</h2>
            <p className="rng-desc">
              Select start and end dates with times to calculate the exact number of hours
              and minutes between them. Time defaults to 12:00 AM if left blank.
            </p>

            {/* Result inline */}
            {result2 && (
              <div style={{ marginBottom: 20 }}>
                <div className="result-header">
                  <span>Result</span>
                </div>
                <p style={{ color: "#374151", fontSize: 14, margin: "0 0 14px", lineHeight: 1.6 }}>
                  The time between <strong>{result2.startDisplay}</strong> and{" "}
                  <strong>{result2.endDisplay}</strong> is:
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div className="kpi" style={{ flex: 1, minWidth: 150 }}>
                    <div className="kpi-label">Hours</div>
                    <div className="kpi-value">{formatHoursLabel(result2.totalHours)}</div>
                    <div className="kpi-sub">hours</div>
                  </div>
                  <div className="kpi" style={{ flex: 1, minWidth: 150 }}>
                    <div className="kpi-label">Minutes</div>
                    <div className="kpi-value">{result2.totalMinutes}</div>
                    <div className="kpi-sub">minutes</div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Date & Time */}
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabelStyle}>Start Date &amp; Time</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {/* Month */}
                <select
                  value={s2.startMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    setS2(p => ({
                      ...p,
                      startMonth: m,
                      startDay: Math.min(p.startDay, daysInMonth(m, p.startYear)),
                    }));
                  }}
                  style={{ ...selectStyle, minWidth: 110 }}
                >
                  {MONTHS.map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>

                {/* Day */}
                <select
                  value={s2.startDay}
                  onChange={(e) => setS2(p => ({ ...p, startDay: parseInt(e.target.value, 10) }))}
                  style={{ ...selectStyle, minWidth: 58 }}
                >
                  {getDayOptions(s2.startMonth, s2.startYear).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Year */}
                <select
                  value={s2.startYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    setS2(p => ({
                      ...p,
                      startYear: y,
                      startDay: Math.min(p.startDay, daysInMonth(p.startMonth, y)),
                    }));
                  }}
                  style={{ ...selectStyle, minWidth: 80 }}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Time hh:mm */}
                <input
                  type="text"
                  placeholder="hh:mm"
                  value={s2.startTime}
                  onChange={(e) => setS2(p => ({ ...p, startTime: e.target.value }))}
                  style={{ ...inputStyle, width: 80 }}
                />

                {/* AM/PM */}
                <select
                  value={s2.startAmPm}
                  onChange={(e) => setS2(p => ({ ...p, startAmPm: e.target.value }))}
                  style={selectStyle}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>

                <button type="button" className="link-btn" onClick={() => setNow2("start")}>Now</button>
              </div>
            </div>

            {/* End Date & Time */}
            <div style={{ marginBottom: 20 }}>
              <label style={fieldLabelStyle}>End Date &amp; Time</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {/* Month */}
                <select
                  value={s2.endMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    setS2(p => ({
                      ...p,
                      endMonth: m,
                      endDay: Math.min(p.endDay, daysInMonth(m, p.endYear)),
                    }));
                  }}
                  style={{ ...selectStyle, minWidth: 110 }}
                >
                  {MONTHS.map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>

                {/* Day */}
                <select
                  value={s2.endDay}
                  onChange={(e) => setS2(p => ({ ...p, endDay: parseInt(e.target.value, 10) }))}
                  style={{ ...selectStyle, minWidth: 58 }}
                >
                  {getDayOptions(s2.endMonth, s2.endYear).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Year */}
                <select
                  value={s2.endYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    setS2(p => ({
                      ...p,
                      endYear: y,
                      endDay: Math.min(p.endDay, daysInMonth(p.endMonth, y)),
                    }));
                  }}
                  style={{ ...selectStyle, minWidth: 80 }}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Time hh:mm */}
                <input
                  type="text"
                  placeholder="hh:mm"
                  value={s2.endTime}
                  onChange={(e) => setS2(p => ({ ...p, endTime: e.target.value }))}
                  style={{ ...inputStyle, width: 80 }}
                />

                {/* AM/PM */}
                <select
                  value={s2.endAmPm}
                  onChange={(e) => setS2(p => ({ ...p, endAmPm: e.target.value }))}
                  style={selectStyle}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>

                <button type="button" className="link-btn" onClick={() => setNow2("end")}>Now</button>
              </div>
            </div>

            <div className="row two rng-btn-row">
              <button type="button" className="btn-primary" onClick={calculate2}>Calculate</button>
              <button type="button" className="btn-secondary" onClick={clear2}>Clear</button>
            </div>

            {error2 && <div className="rng-error">{error2}</div>}
          </section>

          {/* ===== Related ===== */}
          <section className="card">
            <div className="bar-title">Related</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                <Link
                  to="/time"
                  style={{ display: "block", padding: "10px 4px", color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: 14 }}
                >
                  Time Card Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/time"
                  style={{ display: "block", padding: "10px 4px", color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: 14 }}
                >
                  Time Calculator
                </Link>
              </li>
            </ul>
          </section>

        </div>

        {/* ===== Sidebar ===== */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Time Calculators</h3>
            <ul className="rng-sidebar-list">
              {SIDEBAR_LINKS.map((lnk) => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/hours-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
