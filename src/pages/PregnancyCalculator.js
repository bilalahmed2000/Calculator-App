import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function PregnancyCalculator() {
  const [mode, setMode] = useState("lmp"); // lmp | conception
  const [lmpDate, setLmpDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");

  const today = new Date();

  const results = useMemo(() => {
    let baseDate;

    if (mode === "lmp" && lmpDate) {
      baseDate = new Date(lmpDate);
    } else if (mode === "conception" && conceptionDate) {
      baseDate = new Date(conceptionDate);
    } else {
      return null;
    }

    // Calculate due date
    const dueDate = new Date(baseDate);
    if (mode === "lmp") {
      dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
    } else {
      dueDate.setDate(dueDate.getDate() + 266); // 38 weeks
    }

    // Gestational age
    const diffMs = today - baseDate;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    // Estimated conception date (if LMP)
    const estimatedConception =
      mode === "lmp"
        ? new Date(new Date(lmpDate).setDate(new Date(lmpDate).getDate() + 14))
        : baseDate;

    // Days remaining
    const daysRemaining = Math.ceil(
      (dueDate - today) / (1000 * 60 * 60 * 24)
    );

    return {
      dueDate,
      weeks,
      days,
      estimatedConception,
      daysRemaining,
    };
  }, [mode, lmpDate, conceptionDate]);

  const formatDate = (date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pregnancy Calculator</h1>
        <p className="muted">
          Estimate your due date and pregnancy timeline based on LMP or
          conception date.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Your Information</h2>

          <div className="row">
            <div className="field">
              <label>Calculation Method</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="lmp">Last Menstrual Period (LMP)</option>
                <option value="conception">Conception Date</option>
              </select>
            </div>
          </div>

          {mode === "lmp" ? (
            <div className="row">
              <div className="field">
                <label>First Day of Last Menstrual Period</label>
                <input
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="field">
                <label>Conception Date</label>
                <input
                  type="date"
                  value={conceptionDate}
                  onChange={(e) => setConceptionDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </section>

        {/* RESULT CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {results ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Estimated Due Date</div>
                  <div className="kpi-value">
                    {formatDate(results.dueDate)}
                  </div>
                  <div className="kpi-sub">40 weeks</div>
                </div>

                <div className="kpi">
                  <div className="kpi-label">Gestational Age</div>
                  <div className="kpi-value">
                    {results.weeks}w {results.days}d
                  </div>
                  <div className="kpi-sub">as of today</div>
                </div>
              </div>

              <ul style={{ margin: "12px 0 0 18px" }}>
                <li>
                  <b>Estimated conception date:</b>{" "}
                  {formatDate(results.estimatedConception)}
                </li>
                <li>
                  <b>Days remaining:</b> {results.daysRemaining}
                </li>
              </ul>
            </>
          ) : (
            <p className="small">Select a date to calculate results.</p>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            Results are estimates based on average cycle length. Actual delivery
            date may vary.
          </p>
        </section>
      </div>
    </div>
  );
}
