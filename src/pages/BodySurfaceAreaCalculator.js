import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// BSA formulas — all take height in cm, weight in kg → result in m²
const formulas = {
  mosteller: (h, w) => Math.sqrt((h * w) / 3600),
  dubois:    (h, w) => 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425),
  haycock:   (h, w) => 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378),
  gehanGeorge: (h, w) => 0.0235 * Math.pow(h, 0.42246) * Math.pow(w, 0.51456),
  boyd:      (h, w) => 0.0003207 * Math.pow(h, 0.3) * Math.pow(w * 1000, 0.7285 - 0.0188 * Math.log10(w * 1000)),
};

export default function BodySurfaceAreaCalculator() {
  const [units, setUnits] = useState("metric");
  const [cm, setCm]       = useState(175);
  const [kg, setKg]       = useState(70);
  const [ft, setFt]       = useState(5);
  const [inch, setInch]   = useState(9);
  const [lb, setLb]       = useState(154);

  const weightKg = useMemo(
    () => (units === "metric" ? Number(kg) : Number(lb) * 0.453592),
    [units, kg, lb]
  );
  const heightCm = useMemo(
    () => (units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54),
    [units, cm, ft, inch]
  );

  const results = useMemo(() => {
    if (!weightKg || !heightCm) return null;
    const fmt = (v) => Math.round(v * 1000) / 1000;
    return {
      mosteller:   fmt(formulas.mosteller(heightCm, weightKg)),
      dubois:      fmt(formulas.dubois(heightCm, weightKg)),
      haycock:     fmt(formulas.haycock(heightCm, weightKg)),
      gehanGeorge: fmt(formulas.gehanGeorge(heightCm, weightKg)),
      boyd:        fmt(formulas.boyd(heightCm, weightKg)),
    };
  }, [weightKg, heightCm]);

  const avg = useMemo(() => {
    if (!results) return null;
    const vals = Object.values(results);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1000) / 1000;
  }, [results]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Body Surface Area Calculator</h1>
        <p className="muted">
          Calculate your Body Surface Area (BSA) in m² using five established medical formulas.
          BSA is used in clinical dosing, burn treatment, and cardiac output calculations.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Measurements</h2>

          <div className="row">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (kg / cm)</option>
                <option value="us">US (lb / ft-in)</option>
              </select>
            </div>
          </div>

          {units === "metric" ? (
            <div className="row two">
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" min={100} max={250} value={cm}
                  onChange={e => setCm(e.target.value)} />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" min={10} max={300} value={kg}
                  onChange={e => setKg(e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (ft)</label>
                  <input type="number" min={3} max={8} value={ft}
                    onChange={e => setFt(e.target.value)} />
                </div>
                <div className="field">
                  <label>Height (in)</label>
                  <input type="number" min={0} max={11} value={inch}
                    onChange={e => setInch(e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Weight (lb)</label>
                  <input type="number" min={22} max={660} value={lb}
                    onChange={e => setLb(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <p className="small" style={{ marginTop: 12 }}>
            The average adult BSA is approximately <strong>1.7 m²</strong> (range: 1.5–2.1 m²).
          </p>

          <table className="table" style={{ marginTop: 14 }}>
            <thead>
              <tr><th>Formula</th><th>Common Use</th></tr>
            </thead>
            <tbody>
              <tr><td>Mosteller</td><td>Simplest; widely used in oncology</td></tr>
              <tr><td>DuBois &amp; DuBois</td><td>Most historically referenced</td></tr>
              <tr><td>Haycock</td><td>Preferred for pediatric patients</td></tr>
              <tr><td>Gehan &amp; George</td><td>Large-population derived</td></tr>
              <tr><td>Boyd</td><td>Accurate across wide weight range</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {results ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Average BSA</div>
                  <div className="kpi-value">{avg} m²</div>
                  <div className="kpi-sub">Mean of all 5 formulas</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Mosteller (common)</div>
                  <div className="kpi-value">{results.mosteller} m²</div>
                  <div className="kpi-sub">√(h × w / 3600)</div>
                </div>
              </div>

              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Formula</th>
                    <th>BSA (m²)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Mosteller</td><td><strong>{results.mosteller}</strong></td></tr>
                  <tr><td>DuBois &amp; DuBois</td><td><strong>{results.dubois}</strong></td></tr>
                  <tr><td>Haycock</td><td><strong>{results.haycock}</strong></td></tr>
                  <tr><td>Gehan &amp; George</td><td><strong>{results.gehanGeorge}</strong></td></tr>
                  <tr><td>Boyd</td><td><strong>{results.boyd}</strong></td></tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Average</strong></td>
                    <td><strong>{avg}</strong></td>
                  </tr>
                </tbody>
              </table>

              <h3 className="card-title" style={{ marginTop: 18 }}>Reference Values</h3>
              <table className="table">
                <thead>
                  <tr><th>Group</th><th>Average BSA</th></tr>
                </thead>
                <tbody>
                  <tr><td>Neonate</td><td>0.25 m²</td></tr>
                  <tr><td>Child (2 years)</td><td>0.5 m²</td></tr>
                  <tr><td>Child (10 years)</td><td>1.14 m²</td></tr>
                  <tr><td>Adult female</td><td>1.6 m²</td></tr>
                  <tr><td>Adult male</td><td>1.9 m²</td></tr>
                </tbody>
              </table>

              <p className="small" style={{ marginTop: 10 }}>
                BSA is commonly used for drug dosing, especially chemotherapy, where doses are
                expressed per m² of body surface area.
              </p>
            </>
          ) : (
            <p className="small">Enter your height and weight to see results.</p>
          )}
        </section>
      </div>
    </div>
  );
}
