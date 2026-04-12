import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const DAY_NAMES  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_DAYS  = [31,28,31,30,31,30,31,31,30,31,30,31];

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff  = d - start;
  return Math.floor(diff / 86400000);
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function ordinal(n) {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const todayStr = new Date().toISOString().slice(0, 10);

export default function DayOfWeekCalculator() {
  const [dateStr, setDateStr] = useState(todayStr);
  const [findTab, setFindTab] = useState("specific"); // specific | next | nth
  const [targetDay, setTargetDay] = useState("1"); // 0=Sun...6=Sat for "next occurrence"
  const [nthN, setNthN] = useState("2");
  const [nthYear, setNthYear] = useState(new Date().getFullYear().toString());
  const [nthMonth, setNthMonth] = useState((new Date().getMonth() + 1).toString());
  const [nthDay, setNthDay] = useState("1");

  const specificResult = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return null;
    const dayName  = DAY_NAMES[d.getDay()];
    const monthName = MONTH_NAMES[d.getMonth()];
    const doy      = getDayOfYear(d);
    const week     = getWeekNumber(d);
    const leap     = isLeapYear(d.getFullYear());
    const daysInMonth = MONTH_DAYS[d.getMonth()] + (d.getMonth() === 1 && leap ? 1 : 0);
    const daysLeft = 365 + (leap ? 1 : 0) - doy;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // nth occurrence of this weekday in this month
    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const offset = (d.getDay() - firstOfMonth.getDay() + 7) % 7;
    const nthInMonth = Math.floor((d.getDate() - 1 - offset) / 7) + 1;

    return { d, dayName, monthName, doy, week, leap, daysInMonth, daysLeft, isWeekend, nthInMonth };
  }, [dateStr]);

  const nextOccurrence = useMemo(() => {
    const target = parseInt(targetDay);
    const base = specificResult?.d ?? new Date();
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== target) d.setDate(d.getDate() + 1);
    const daysUntil = Math.round((d - base) / 86400000);
    return { date: d, daysUntil };
  }, [targetDay, specificResult]);

  const nthResult = useMemo(() => {
    const y = parseInt(nthYear), mo = parseInt(nthMonth) - 1, day = parseInt(nthDay), nth = parseInt(nthN);
    if (isNaN(y) || isNaN(mo) || isNaN(day) || isNaN(nth) || mo < 0 || mo > 11 || day < 0 || day > 6 || nth < 1 || nth > 5) return null;
    const first = new Date(y, mo, 1);
    let count = 0;
    const cur = new Date(first);
    while (cur.getMonth() === mo) {
      if (cur.getDay() === day) {
        count++;
        if (count === nth) return { date: new Date(cur), found: true };
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { found: false };
  }, [nthYear, nthMonth, nthDay, nthN]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Day of the Week Calculator</h1>
        <p className="muted">
          Find what day of the week any date falls on, look up the next occurrence of a weekday,
          or find the nth weekday of any month.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${findTab === "specific" ? " active" : ""}`} onClick={() => setFindTab("specific")}>Date → Day</button>
            <button className={`tab-btn${findTab === "next"     ? " active" : ""}`} onClick={() => setFindTab("next")}>Next Weekday</button>
            <button className={`tab-btn${findTab === "nth"      ? " active" : ""}`} onClick={() => setFindTab("nth")}>Nth Weekday</button>
          </div>

          {findTab === "specific" && (
            <>
              <div className="row">
                <div className="field"><label>Date</label><input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} /></div>
              </div>
              {specificResult && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                    {specificResult.monthName} {specificResult.d.getDate()}, {specificResult.d.getFullYear()}
                  </div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: "#4f46e5" }}>{specificResult.dayName}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                    {ordinal(specificResult.nthInMonth)} {specificResult.dayName} of {specificResult.monthName}
                    &nbsp;·&nbsp; {specificResult.isWeekend ? "Weekend" : "Weekday"}
                  </div>
                </div>
              )}
            </>
          )}

          {findTab === "next" && (
            <>
              <div className="row two">
                <div className="field">
                  <label>Starting from date</label>
                  <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
                </div>
                <div className="field">
                  <label>Find next</label>
                  <select value={targetDay} onChange={e => setTargetDay(e.target.value)}>
                    {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              {nextOccurrence && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Next {DAY_NAMES[parseInt(targetDay)]}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5" }}>
                    {MONTH_NAMES[nextOccurrence.date.getMonth()]} {nextOccurrence.date.getDate()}, {nextOccurrence.date.getFullYear()}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>In {nextOccurrence.daysUntil} day{nextOccurrence.daysUntil !== 1 ? "s" : ""}</div>
                </div>
              )}
            </>
          )}

          {findTab === "nth" && (
            <>
              <p className="small">e.g. "2nd Monday of March 2025"</p>
              <div className="row two">
                <div className="field">
                  <label>Occurrence</label>
                  <select value={nthN} onChange={e => setNthN(e.target.value)}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{ordinal(n)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Day of week</label>
                  <select value={nthDay} onChange={e => setNthDay(e.target.value)}>
                    {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Month</label>
                  <select value={nthMonth} onChange={e => setNthMonth(e.target.value)}>
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Year</label>
                  <input type="number" value={nthYear} onChange={e => setNthYear(e.target.value)} />
                </div>
              </div>
              {nthResult && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: nthResult.found ? "#f0eeff" : "#fef2f2", borderRadius: 14, border: `1px solid ${nthResult.found ? "rgba(99,102,241,0.2)" : "#fca5a5"}` }}>
                  {nthResult.found ? (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                        {ordinal(parseInt(nthN))} {DAY_NAMES[parseInt(nthDay)]} of {MONTH_NAMES[parseInt(nthMonth)-1]} {nthYear}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5" }}>
                        {MONTH_NAMES[nthResult.date.getMonth()]} {nthResult.date.getDate()}, {nthResult.date.getFullYear()}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#b91c1c", fontWeight: 700 }}>That occurrence does not exist in this month.</div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Date Details</h2>

          {specificResult ? (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}><td><strong>Day of week</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{specificResult.dayName}</td></tr>
                <tr><td>Full date</td><td style={{ fontFamily: "monospace" }}>{specificResult.monthName} {specificResult.d.getDate()}, {specificResult.d.getFullYear()}</td></tr>
                <tr><td>Day of year</td><td style={{ fontFamily: "monospace" }}>{ordinal(specificResult.doy)}</td></tr>
                <tr><td>Week number (ISO)</td><td style={{ fontFamily: "monospace" }}>Week {specificResult.week}</td></tr>
                <tr><td>Days in month</td><td style={{ fontFamily: "monospace" }}>{specificResult.daysInMonth}</td></tr>
                <tr><td>Days left in year</td><td style={{ fontFamily: "monospace" }}>{specificResult.daysLeft}</td></tr>
                <tr><td>Leap year?</td><td style={{ fontFamily: "monospace" }}>{specificResult.leap ? "Yes" : "No"}</td></tr>
                <tr><td>Weekday / Weekend</td><td style={{ fontFamily: "monospace" }}>{specificResult.isWeekend ? "Weekend" : "Weekday"}</td></tr>
                <tr><td>In month</td><td style={{ fontFamily: "monospace" }}>{ordinal(specificResult.nthInMonth)} {specificResult.dayName} of {specificResult.monthName}</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Select a date to see details.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Day Number Reference</h3>
          <table className="table">
            <thead><tr><th>Day</th><th>Abbrev.</th><th>Weekend?</th></tr></thead>
            <tbody>
              {DAY_NAMES.map((d, i) => (
                <tr key={i} style={specificResult?.d.getDay() === i ? { background: "#f0eeff" } : {}}>
                  <td style={{ fontFamily: "monospace" }}>{d}</td>
                  <td style={{ fontFamily: "monospace" }}>{d.slice(0,3)}</td>
                  <td style={{ fontFamily: "monospace" }}>{i === 0 || i === 6 ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
