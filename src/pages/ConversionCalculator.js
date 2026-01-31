import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

function diffDates(start, end, includeEnd) {
  const s = new Date(start);
  const e = new Date(end);
  let diff = Math.abs(e - s) / (1000 * 60 * 60 * 24);
  if (includeEnd) diff += 1;
  return Math.floor(diff);
}

export default function DateCalculator() {
  /* =======================
     DAYS BETWEEN TWO DATES
  ======================= */
  const [start1, setStart1] = useState("");
  const [end1, setEnd1] = useState("");
  const [includeEnd, setIncludeEnd] = useState(false);

  const daysBetween = useMemo(() => {
    if (!start1 || !end1) return null;
    return diffDates(start1, end1, includeEnd);
  }, [start1, end1, includeEnd]);

  /* =======================
     ADD / SUBTRACT DATE
  ======================= */
  const [start2, setStart2] = useState("");
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [weeks, setWeeks] = useState(0);
  const [days, setDays] = useState(0);
  const [mode, setMode] = useState("add");

  const finalDate = useMemo(() => {
    if (!start2) return null;

    const d = new Date(start2);
    const factor = mode === "add" ? 1 : -1;

    d.setFullYear(d.getFullYear() + factor * Number(years));
    d.setMonth(d.getMonth() + factor * Number(months));
    d.setDate(d.getDate() + factor * (Number(weeks) * 7 + Number(days)));

    return d.toDateString();
  }, [start2, years, months, weeks, days, mode]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Date Calculator</h1>
        <p className="muted">
          Calculate the number of days between dates or add/subtract time from a date.
        </p>
      </header>

      {/* ================= DAYS BETWEEN ================= */}
      <section className="card">
        <h2 className="card-title">Days Between Two Dates</h2>

        <div className="row two">
          <div className="field">
            <label>Start Date</label>
            <input type="date" value={start1} onChange={(e) => setStart1(e.target.value)} />
          </div>

          <div className="field">
            <label>End Date</label>
            <input type="date" value={end1} onChange={(e) => setEnd1(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={includeEnd}
              onChange={(e) => setIncludeEnd(e.target.checked)}
            />{" "}
            Include end day (+1)
          </label>
        </div>

        {daysBetween !== null && (
          <div className="kpi">
            <div className="kpi-label">Total Days</div>
            <div className="kpi-value">{daysBetween}</div>
            <div className="kpi-sub">days</div>
          </div>
        )}
      </section>

      {/* ================= ADD / SUBTRACT ================= */}
      <section className="card">
        <h2 className="card-title">Add or Subtract From a Date</h2>

        <div className="field">
          <label>Start Date</label>
          <input type="date" value={start2} onChange={(e) => setStart2(e.target.value)} />
        </div>

        <div className="row four">
          <div className="field">
            <label>Years</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>

          <div className="field">
            <label>Months</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>

          <div className="field">
            <label>Weeks</label>
            <input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
          </div>

          <div className="field">
            <label>Days</label>
            <input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
          </select>
        </div>

        {finalDate && (
          <div className="kpi">
            <div className="kpi-label">Resulting Date</div>
            <div className="kpi-value">{finalDate}</div>
            <div className="kpi-sub">final date</div>
          </div>
        )}
      </section>
    </div>
  );
}
