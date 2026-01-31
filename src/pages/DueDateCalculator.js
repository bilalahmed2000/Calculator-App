import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function DueDateCalculator() {
  const [dueDate, setDueDate] = useState("");

  const today = new Date();

  const results = useMemo(() => {
    if (!dueDate) return null;
    const dd = new Date(dueDate);

    // Conception estimate: 266 days before due date
    const conceptionDate = new Date(dd);
    conceptionDate.setDate(conceptionDate.getDate() - 266);

    // LMP estimate: 280 days before due date
    const lmpDate = new Date(dd);
    lmpDate.setDate(lmpDate.getDate() - 280);

    // Gestational age as of today
    const gestationalDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(gestationalDays / 7);
    const days = gestationalDays % 7;

    return { conceptionDate, lmpDate, weeks, days };
  }, [dueDate]);

  const formatDate = (d) =>
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Due Date Calculator</h1>
        <p className="muted">
          Enter your expected due date to find estimated conception and LMP dates.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Select Due Date</h2>
          <div className="row">
            <div className="field">
              <label>Expected Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {results ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Estimated Conception Date</div>
                  <div className="kpi-value">
                    {formatDate(results.conceptionDate)}
                  </div>
                </div>

                <div className="kpi">
                  <div class="kpi-label">Estimated LMP (Start of Pregnancy)</div>
                  <div class="kpi-value">{formatDate(results.lmpDate)}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <b>Gestational Age as of Today:</b> {results.weeks} weeks,{" "}
                {results.days} days
              </div>
            </>
          ) : (
            <p className="small">Select a due date to calculate results.</p>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            These are estimates based on average pregnancy length. Actual dates
            may vary.
          </p>
        </section>
      </div>
    </div>
  );
}
