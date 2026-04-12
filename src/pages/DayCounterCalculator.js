import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function countBusinessDays(start, end) {
  let count = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endD = new Date(end);
  endD.setHours(0, 0, 0, 0);
  const step = cur <= endD ? 1 : -1;
  while (cur.getTime() !== endD.getTime()) {
    cur.setDate(cur.getDate() + step);
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
  }
  return count;
}

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} (${DAY_NAMES[d.getDay()]})`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString().slice(0, 10);

export default function DayCounterCalculator() {
  const [tab, setTab] = useState("between");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate]     = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [includeEnd, setIncludeEnd] = useState(false);

  const result = useMemo(() => {
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate   + "T00:00:00");
    if (isNaN(s) || isNaN(e)) return null;
    const msPerDay = 86400000;
    let totalDays = Math.round((e - s) / msPerDay);
    const sign = totalDays < 0 ? -1 : 1;
    const absDays = Math.abs(totalDays) + (includeEnd ? 1 : 0);
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;
    const businessDays = countBusinessDays(s, e);
    const absBiz = Math.abs(businessDays) + (includeEnd ? (e.getDay() !== 0 && e.getDay() !== 6 ? 1 : 0) : 0);
    const future = e > s;
    return { absDays, weeks, remDays, absBiz, future, startFmt: fmtDate(s), endFmt: fmtDate(e) };
  }, [startDate, endDate, includeEnd]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Day Counter</h1>
        <p className="muted">
          Count the number of days between two dates, including or excluding the end date,
          with business day calculation.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Date Range</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "between" ? " active" : ""}`} onClick={() => setTab("between")}>Between Two Dates</button>
            <button className={`tab-btn${tab === "fromtoday" ? " active" : ""}`} onClick={() => setTab("fromtoday")}>From Today</button>
          </div>

          {tab === "between" && (
            <>
              <div className="row two">
                <div className="field"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div className="field"><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>
            </>
          )}

          {tab === "fromtoday" && (
            <>
              <div className="row">
                <div className="field"><label>Target Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>
            </>
          )}

          <div className="row" style={{ marginTop: 8 }}>
            <div className="field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="includeEnd" checked={includeEnd} onChange={e => setIncludeEnd(e.target.checked)} style={{ width: "auto" }} />
              <label htmlFor="includeEnd" style={{ marginBottom: 0 }}>Include end date in count</label>
            </div>
          </div>

          {result && (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                {result.future ? "Days Until" : "Days Since"}
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#4f46e5" }}>{result.absDays.toLocaleString()}</div>
              <div style={{ fontSize: 14, color: "#6b7a9e", marginTop: 4 }}>
                {result.weeks} week{result.weeks !== 1 ? "s" : ""} and {result.remDays} day{result.remDays !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result ? (
            <>
              <table className="table" style={{ marginBottom: 14 }}>
                <thead><tr><th>Property</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Start date</td><td style={{ fontFamily: "monospace", fontSize: 13 }}>{result.startFmt}</td></tr>
                  <tr><td>End date</td><td style={{ fontFamily: "monospace", fontSize: 13 }}>{result.endFmt}</td></tr>
                  <tr><td>Include end date</td><td style={{ fontFamily: "monospace" }}>{includeEnd ? "Yes" : "No"}</td></tr>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Total days</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{result.absDays.toLocaleString()}</td></tr>
                  <tr><td>Weeks and days</td><td style={{ fontFamily: "monospace" }}>{result.weeks}w {result.remDays}d</td></tr>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Business days</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{result.absBiz.toLocaleString()}</td></tr>
                  <tr><td>Weekend days</td><td style={{ fontFamily: "monospace" }}>{(result.absDays - result.absBiz).toLocaleString()}</td></tr>
                </tbody>
              </table>

              <h3 className="card-title" style={{ marginTop: 16 }}>Quick Reference</h3>
              <table className="table">
                <thead><tr><th>Period</th><th>Days</th></tr></thead>
                <tbody>
                  <tr><td>1 week</td><td style={{ fontFamily: "monospace" }}>7</td></tr>
                  <tr><td>1 month (avg)</td><td style={{ fontFamily: "monospace" }}>30.44</td></tr>
                  <tr><td>1 quarter</td><td style={{ fontFamily: "monospace" }}>91.25</td></tr>
                  <tr><td>1 year</td><td style={{ fontFamily: "monospace" }}>365</td></tr>
                  <tr><td>1 leap year</td><td style={{ fontFamily: "monospace" }}>366</td></tr>
                  <tr><td>1 decade</td><td style={{ fontFamily: "monospace" }}>3,652</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Select valid dates to count days.</p>
          )}
        </section>
      </div>
    </div>
  );
}
