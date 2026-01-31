import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date();

  const results = useMemo(() => {
    if (!birthDate) return null;

    const start = new Date(birthDate);
    const end = endDate ? new Date(endDate) : today;

    if (end < start) return null;

    let y1 = start.getFullYear();
    let m1 = start.getMonth();
    let d1 = start.getDate();

    let y2 = end.getFullYear();
    let m2 = end.getMonth();
    let d2 = end.getDate();

    let years = y2 - y1;
    let months = m2 - m1;
    let days = d2 - d1;

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(y2, m2, 0).getDate();
      days += prevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays: diffDays,
    };
  }, [birthDate, endDate]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Age Calculator</h1>
        <p className="muted">
          Calculate age in years, months & days.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT */}
        <section className="card">
          <h2 className="card-title">Enter Dates</h2>

          <div className="row two">
            <div className="field">
              <label>Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="card">
          <h2 className="card-title">Results</h2>
          {results ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Years</div>
                  <div className="kpi-value">{results.years}</div>
                </div>

                <div className="kpi">
                  <div className="kpi-label">Months</div>
                  <div class="kpi-value">{results.months}</div>
                </div>

                <div className="kpi">
                  <div class="kpi-label">Days</div>
                  <div class="kpi-value">{results.days}</div>
                </div>
              </div>

              <p className="small" style={{ marginTop: 12 }}>
                Total Days: {results.totalDays}
              </p>
            </>
          ) : (
            <p className="small">Enter a valid birth date.</p>
          )}
        </section>
      </div>
    </div>
  );
}
