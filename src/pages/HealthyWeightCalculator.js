import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// Healthy weight range based on BMI 18.5–24.9
// Also includes Robinson, Miller, Devine ideal weight formulas
function idealWeightFormulas(sex, heightCm) {
  const hIn = heightCm / 2.54;
  const inchesOver5ft = Math.max(0, hIn - 60);
  const robinson = sex === "male"
    ? 52 + 1.9 * inchesOver5ft
    : 49 + 1.7 * inchesOver5ft;
  const miller = sex === "male"
    ? 56.2 + 1.41 * inchesOver5ft
    : 53.1 + 1.36 * inchesOver5ft;
  const devine = sex === "male"
    ? 50 + 2.3 * inchesOver5ft
    : 45.5 + 2.3 * inchesOver5ft;
  const hamwi = sex === "male"
    ? 48 + 2.7 * inchesOver5ft
    : 45.4 + 2.27 * inchesOver5ft;
  return { robinson, miller, devine, hamwi };
}

export default function HealthyWeightCalculator() {
  const [units, setUnits] = useState("metric");
  const [sex, setSex]     = useState("male");
  const [cm, setCm]       = useState(175);
  const [ft, setFt]       = useState(5);
  const [inch, setInch]   = useState(9);

  const heightCm = useMemo(
    () => (units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54),
    [units, cm, ft, inch]
  );
  const heightM = useMemo(() => heightCm / 100, [heightCm]);

  // BMI-based healthy range
  const bmiRange = useMemo(() => {
    if (!heightM) return null;
    return {
      minKg: Math.round(18.5 * heightM * heightM * 10) / 10,
      maxKg: Math.round(24.9 * heightM * heightM * 10) / 10,
      minLb: Math.round(18.5 * heightM * heightM * 2.20462 * 10) / 10,
      maxLb: Math.round(24.9 * heightM * heightM * 2.20462 * 10) / 10,
    };
  }, [heightM]);

  const idealForms = useMemo(() => {
    if (!heightCm) return null;
    const f = idealWeightFormulas(sex, heightCm);
    const fmt = (kg) => ({
      kg: Math.round(kg * 10) / 10,
      lb: Math.round(kg * 2.20462 * 10) / 10,
    });
    return {
      robinson: fmt(f.robinson),
      miller:   fmt(f.miller),
      devine:   fmt(f.devine),
      hamwi:    fmt(f.hamwi),
    };
  }, [sex, heightCm]);

  const avg = useMemo(() => {
    if (!idealForms) return null;
    const vals = Object.values(idealForms).map(v => v.kg);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { kg: Math.round(mean * 10) / 10, lb: Math.round(mean * 2.20462 * 10) / 10 };
  }, [idealForms]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Healthy Weight Calculator</h1>
        <p className="muted">
          Find your healthy weight range based on your height using BMI guidelines and four
          ideal body weight formulas: Robinson, Miller, Devine, and Hamwi.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Height</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (cm)</option>
                <option value="us">US (ft / in)</option>
              </select>
            </div>
            <div className="field">
              <label>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {units === "metric" ? (
            <div className="row">
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" min={100} max={250} value={cm}
                  onChange={e => setCm(e.target.value)} />
              </div>
            </div>
          ) : (
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
          )}

          <p className="small" style={{ marginTop: 12 }}>
            This calculator uses only your height to estimate a healthy weight range.
            Body composition, age, and muscle mass are not factored in.
          </p>

          <table className="table" style={{ marginTop: 14 }}>
            <thead>
              <tr><th>BMI Range</th><th>Category</th></tr>
            </thead>
            <tbody>
              <tr><td>&lt; 18.5</td><td>Underweight</td></tr>
              <tr style={{ background: "#f0eeff" }}><td>18.5 – 24.9</td><td><strong>Healthy (Normal)</strong></td></tr>
              <tr><td>25.0 – 29.9</td><td>Overweight</td></tr>
              <tr><td>≥ 30.0</td><td>Obese</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {bmiRange && avg ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">BMI Healthy Range</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>
                    {bmiRange.minKg}–{bmiRange.maxKg} kg
                  </div>
                  <div className="kpi-sub">{bmiRange.minLb}–{bmiRange.maxLb} lb</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Ideal Weight (Avg)</div>
                  <div className="kpi-value">{avg.kg} kg</div>
                  <div className="kpi-sub">{avg.lb} lb</div>
                </div>
              </div>

              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Formula</th>
                    <th>Ideal Weight (kg)</th>
                    <th>Ideal Weight (lb)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Robinson (1983)</td>
                    <td>{idealForms.robinson.kg}</td>
                    <td>{idealForms.robinson.lb}</td>
                  </tr>
                  <tr>
                    <td>Miller (1983)</td>
                    <td>{idealForms.miller.kg}</td>
                    <td>{idealForms.miller.lb}</td>
                  </tr>
                  <tr>
                    <td>Devine (1974)</td>
                    <td>{idealForms.devine.kg}</td>
                    <td>{idealForms.devine.lb}</td>
                  </tr>
                  <tr>
                    <td>Hamwi (1964)</td>
                    <td>{idealForms.hamwi.kg}</td>
                    <td>{idealForms.hamwi.lb}</td>
                  </tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Average</strong></td>
                    <td><strong>{avg.kg}</strong></td>
                    <td><strong>{avg.lb}</strong></td>
                  </tr>
                </tbody>
              </table>

              <p className="small" style={{ marginTop: 10 }}>
                The "healthy weight" range (BMI 18.5–24.9) is a general guideline for adults.
                Athletes and individuals with high muscle mass may have a higher BMI while still
                being healthy.
              </p>
            </>
          ) : (
            <p className="small">Enter your height to see your healthy weight range.</p>
          )}
        </section>
      </div>
    </div>
  );
}
