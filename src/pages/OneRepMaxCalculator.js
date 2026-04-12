import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* ── 1RM formulas (weight in any unit, reps integer) ── */
const FORMULAS = [
  { name: "Epley",      fn: (w, r) => r === 1 ? w : w * (1 + r / 30) },
  { name: "Brzycki",    fn: (w, r) => r === 1 ? w : w * (36 / (37 - r)) },
  { name: "Lander",     fn: (w, r) => r === 1 ? w : (100 * w) / (101.3 - 2.67123 * r) },
  { name: "Lombardi",   fn: (w, r) => r === 1 ? w : w * Math.pow(r, 0.10) },
  { name: "Mayhew",     fn: (w, r) => r === 1 ? w : (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)) },
  { name: "O'Conner",   fn: (w, r) => r === 1 ? w : w * (1 + 0.025 * r) },
  { name: "Wathan",     fn: (w, r) => r === 1 ? w : (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)) },
];

const PERCENT_ROWS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

export default function OneRepMaxCalculator() {
  const [units, setUnits] = useState("lb");
  const [weight, setWeight] = useState(225);
  const [reps, setReps] = useState(5);

  const w = Number(weight);
  const r = Math.max(1, Math.min(20, Number(reps)));

  const results = useMemo(() => {
    if (!w || w <= 0) return null;
    return FORMULAS.map(f => ({
      name: f.name,
      orm: Math.round(f.fn(w, r) * 10) / 10,
    }));
  }, [w, r]);

  const avgORM = useMemo(() => {
    if (!results) return 0;
    const sum = results.reduce((a, b) => a + b.orm, 0);
    return Math.round(sum / results.length);
  }, [results]);

  const percentTable = useMemo(() => {
    if (!avgORM) return [];
    return PERCENT_ROWS.map(pct => ({
      pct,
      weight: Math.round(avgORM * pct / 100),
      repsGuide: pct >= 95 ? "1–2" : pct >= 90 ? "3" : pct >= 85 ? "4–5" : pct >= 80 ? "6" : pct >= 75 ? "8" : pct >= 70 ? "10" : pct >= 65 ? "12" : pct >= 60 ? "15" : pct >= 55 ? "18" : "20+",
    }));
  }, [avgORM]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>One Rep Max Calculator</h1>
        <p className="muted">
          Estimate your one-repetition maximum (1RM) using 7 different formulas. Enter the
          weight you lifted and the number of reps completed to see your estimated max.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Lift</h2>

          <div className="row">
            <div className="field">
              <label>Weight Unit</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="lb">Pounds (lb)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Weight Lifted ({units})</label>
              <input type="number" min={1} max={2000} value={weight}
                onChange={e => setWeight(e.target.value)} />
            </div>
            <div className="field">
              <label>Reps Completed (1–20)</label>
              <input type="number" min={1} max={20} value={reps}
                onChange={e => setReps(e.target.value)} />
            </div>
          </div>

          <p className="small" style={{ marginTop: 4 }}>
            For best accuracy, use a weight you can lift for 1–10 reps. Results become less
            reliable above 10 reps.
          </p>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Formula</th><th>Estimated 1RM ({units})</th></tr>
            </thead>
            <tbody>
              {results ? results.map(r => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td><strong>{r.orm}</strong></td>
                </tr>
              )) : <tr><td colSpan={2} style={{ color:"#9ca3c8" }}>Enter a weight to calculate</td></tr>}
            </tbody>
            {avgORM > 0 && (
              <tfoot>
                <tr style={{ background:"#f0eeff" }}>
                  <td><strong>Average</strong></td>
                  <td><strong>{avgORM} {units}</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Training Weight Table</h2>
          <p className="small" style={{ marginBottom: 12 }}>
            Based on your estimated 1RM of <strong>{avgORM} {units}</strong>. Use these percentages to
            plan your training loads.
          </p>

          {avgORM > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>% of 1RM</th>
                  <th>Weight ({units})</th>
                  <th>Rep Range</th>
                  <th>Goal</th>
                </tr>
              </thead>
              <tbody>
                {percentTable.map(row => (
                  <tr key={row.pct} style={row.pct === 100 ? { background:"#f0eeff" } : {}}>
                    <td><strong>{row.pct}%</strong></td>
                    <td><strong>{row.weight}</strong></td>
                    <td>{row.repsGuide}</td>
                    <td style={{ fontSize:12, color:"#6b7a9e" }}>
                      {row.pct >= 90 ? "Max strength" : row.pct >= 80 ? "Strength" : row.pct >= 70 ? "Hypertrophy" : row.pct >= 60 ? "Endurance" : "Warm-up / active recovery"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="small">Enter your lift details to see the training table.</p>
          )}
        </section>
      </div>
    </div>
  );
}
