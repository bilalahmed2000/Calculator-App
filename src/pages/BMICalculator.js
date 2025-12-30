import React, { useMemo, useState } from "react";
import "../css/CalcBase.css"; // generic styles for all calculators

export default function BMICalculator() {
  const [units, setUnits] = useState("metric");  // 'metric' | 'us'
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(70);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(9);
  const [lb, setLb] = useState(154);

  // Normalize to metric for math
  const heightM = useMemo(() => {
    const cmVal =
      units === "metric"
        ? Number(cm || 0)
        : (ft * 12 + Number(inch || 0)) * 2.54;
    return cmVal > 0 ? cmVal / 100 : 0;
  }, [units, cm, ft, inch]);

  const weightKg = useMemo(
    () => (units === "metric" ? Number(kg || 0) : Number(lb || 0) * 0.45359237),
    [units, kg, lb]
  );

  const bmi = useMemo(() => {
    if (!heightM || !weightKg) return 0;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }, [heightM, weightKg]);

  // Category (WHO adults)
  const category = useMemo(() => {
    if (!bmi) return "-";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obesity class I";
    if (bmi < 40) return "Obesity class II";
    return "Obesity class III";
  }, [bmi]);

  // Healthy weight range for BMI 18.5–24.9
  const healthyRange = useMemo(() => {
    if (!heightM) return { kgMin: 0, kgMax: 0, lbMin: 0, lbMax: 0 };
    const kgMin = 18.5 * heightM * heightM;
    const kgMax = 24.9 * heightM * heightM;
    const lbMin = kgMin / 0.45359237;
    const lbMax = kgMax / 0.45359237;
    return {
      kgMin: Math.round(kgMin),
      kgMax: Math.round(kgMax),
      lbMin: Math.round(lbMin),
      lbMax: Math.round(lbMax),
    };
  }, [heightM]);

  // Position of the “pin” on scale (BMI 12–40)
  const pinLeft = useMemo(() => {
    const min = 12, max = 40;
    const clamped = Math.max(min, Math.min(max, bmi || min));
    return ((clamped - min) / (max - min)) * 100; // %
  }, [bmi]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>BMI Calculator</h1>
        <p className="muted">
          Compute your Body Mass Index and see the WHO category with a healthy
          weight range for your height.
        </p>
      </header>

      <div className="calc-grid">
        {/* Form */}
        <section className="card">
          <h2 className="card-title">Your Measurements</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value)}>
                <option value="metric">Metric (kg / cm)</option>
                <option value="us">US (lb / ft-in)</option>
              </select>
            </div>
            <div className="field">
              <label>BMI (auto)</label>
              <input value={bmi || ""} readOnly />
            </div>
          </div>

          {units === "metric" ? (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={cm}
                    onChange={(e) => setCm(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={kg}
                    onChange={(e) => setKg(Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (ft)</label>
                  <input
                    type="number"
                    min={3}
                    max={7}
                    value={ft}
                    onChange={(e) => setFt(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Height (in)</label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={inch}
                    onChange={(e) => setInch(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Weight (lb)</label>
                  <input
                    type="number"
                    min={66}
                    max={660}
                    value={lb}
                    onChange={(e) => setLb(Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="small">
            Height (m): {heightM ? heightM.toFixed(2) : "-"} &nbsp;•&nbsp; Weight (kg):{" "}
            {weightKg ? Math.round(weightKg) : "-"}
          </div>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">BMI</div>
              <div className="kpi-value">{bmi ? bmi.toFixed(1) : "-"}</div>
              <div className="kpi-sub">kg/m²</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Category</div>
              <div className="kpi-value">{category}</div>
              <div className="kpi-sub">WHO Adult</div>
            </div>
          </div>

          {/* Visual scale */}
          <div className="scale">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="pin" style={{ left: `${pinLeft}%` }} />
          <div className="small">Range shown: 12 ➜ 40 BMI</div>

          <h3 className="card-title" style={{ marginTop: 12 }}>Healthy Weight Range</h3>
          <div className="small">
            For your height, a “normal” BMI (18.5–24.9) corresponds to:
          </div>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>
              <b>{healthyRange.kgMin}–{healthyRange.kgMax} kg</b>
            </li>
            <li>
              <b>{healthyRange.lbMin}–{healthyRange.lbMax} lb</b>
            </li>
          </ul>

          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>BMI (kg/m²)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Underweight</td><td>&lt; 18.5</td></tr>
              <tr><td>Normal weight</td><td>18.5 – 24.9</td></tr>
              <tr><td>Overweight</td><td>25.0 – 29.9</td></tr>
              <tr><td>Obesity class I</td><td>30.0 – 34.9</td></tr>
              <tr><td>Obesity class II</td><td>35.0 – 39.9</td></tr>
              <tr><td>Obesity class III</td><td>≥ 40.0</td></tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            BMI is a screening tool for adults and does not directly measure body fat or account for
            muscle mass, age, or ethnicity.
          </p>
        </section>
      </div>
    </div>
  );
}
