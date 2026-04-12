import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// LBM Formulas (all take weight in kg, height in cm)
function lbmBoer(sex, wKg, hCm) {
  return sex === "male"
    ? 0.407 * wKg + 0.267 * hCm - 19.2
    : 0.252 * wKg + 0.473 * hCm - 48.3;
}
function lbmJames(sex, wKg, hCm) {
  return sex === "male"
    ? 1.1 * wKg - 128 * Math.pow(wKg / hCm, 2)
    : 1.07 * wKg - 148 * Math.pow(wKg / hCm, 2);
}
function lbmHume(sex, wKg, hCm) {
  return sex === "male"
    ? 0.3281 * wKg + 0.3393 * hCm - 29.5336
    : 0.2969 * wKg + 0.4165 * hCm - 43.2933;
}

export default function LeanBodyMassCalculator() {
  const [units, setUnits] = useState("metric");
  const [sex, setSex]     = useState("male");
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
    const boer  = lbmBoer(sex, weightKg, heightCm);
    const james = lbmJames(sex, weightKg, heightCm);
    const hume  = lbmHume(sex, weightKg, heightCm);
    const avg   = (boer + james + hume) / 3;
    const fmt = (kg) => ({
      kg: Math.round(kg * 10) / 10,
      lb: Math.round(kg * 2.20462 * 10) / 10,
      pct: Math.round(((kg / weightKg) * 100) * 10) / 10,
    });
    return { boer: fmt(boer), james: fmt(james), hume: fmt(hume), avg: fmt(avg) };
  }, [sex, weightKg, heightCm]);

  const fatMass = useMemo(() => {
    if (!results) return null;
    const fm = weightKg - results.avg.kg;
    return {
      kg: Math.round(fm * 10) / 10,
      lb: Math.round(fm * 2.20462 * 10) / 10,
      pct: Math.round(100 - results.avg.pct),
    };
  }, [results, weightKg]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Lean Body Mass Calculator</h1>
        <p className="muted">
          Estimate your lean body mass (LBM) — your total weight minus body fat — using three
          established formulas: Boer, James, and Hume.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Measurements</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (kg / cm)</option>
                <option value="us">US (lb / ft-in)</option>
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
            <div className="row two">
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" min={100} max={250} value={cm}
                  onChange={e => setCm(e.target.value)} />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" min={30} max={300} value={kg}
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
                  <input type="number" min={66} max={660} value={lb}
                    onChange={e => setLb(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <p className="small" style={{ marginTop: 12 }}>
            LBM = total body weight minus fat mass. It includes muscle, bone, water, and organs.
          </p>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Formula</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Boer</strong></td><td>Most widely cited formula for clinical use</td></tr>
              <tr><td><strong>James</strong></td><td>Derived from a large population study</td></tr>
              <tr><td><strong>Hume</strong></td><td>Based on body density measurements</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {results ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Avg Lean Mass</div>
                  <div className="kpi-value">{results.avg.kg} kg</div>
                  <div className="kpi-sub">{results.avg.lb} lb · {results.avg.pct}% of body</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Avg Fat Mass</div>
                  <div className="kpi-value">{fatMass.kg} kg</div>
                  <div className="kpi-sub">{fatMass.lb} lb · {fatMass.pct}% of body</div>
                </div>
              </div>

              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Formula</th>
                    <th>LBM (kg)</th>
                    <th>LBM (lb)</th>
                    <th>% of body</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Boer</td>
                    <td>{results.boer.kg}</td>
                    <td>{results.boer.lb}</td>
                    <td>{results.boer.pct}%</td>
                  </tr>
                  <tr>
                    <td>James</td>
                    <td>{results.james.kg}</td>
                    <td>{results.james.lb}</td>
                    <td>{results.james.pct}%</td>
                  </tr>
                  <tr>
                    <td>Hume</td>
                    <td>{results.hume.kg}</td>
                    <td>{results.hume.lb}</td>
                    <td>{results.hume.pct}%</td>
                  </tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Average</strong></td>
                    <td><strong>{results.avg.kg}</strong></td>
                    <td><strong>{results.avg.lb}</strong></td>
                    <td><strong>{results.avg.pct}%</strong></td>
                  </tr>
                </tbody>
              </table>

              <p className="small" style={{ marginTop: 10 }}>
                These formulas use height and weight only. For a more accurate measurement of body
                composition, consider DEXA scanning or hydrostatic weighing.
              </p>
            </>
          ) : (
            <p className="small">Enter your measurements to see results.</p>
          )}
        </section>
      </div>
    </div>
  );
}
