import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

const ACTIVITY = [
  { label: "Sedentary (desk job, little exercise)",        factor: 1.2,   tag: "Sedentary" },
  { label: "Lightly active (light exercise 1–3 days/wk)", factor: 1.375, tag: "Lightly Active" },
  { label: "Moderately active (moderate exercise 3–5/wk)",factor: 1.55,  tag: "Moderately Active" },
  { label: "Very active (hard exercise 6–7 days/wk)",     factor: 1.725, tag: "Very Active" },
  { label: "Extra active (very hard exercise, physical job)", factor: 1.9, tag: "Extra Active" },
];

export default function TDEECalculator() {
  const [units, setUnits]   = useState("metric");
  const [sex, setSex]       = useState("male");
  const [age, setAge]       = useState(25);
  const [cm, setCm]         = useState(175);
  const [kg, setKg]         = useState(70);
  const [ft, setFt]         = useState(5);
  const [inch, setInch]     = useState(9);
  const [lb, setLb]         = useState(154);
  const [actIdx, setActIdx] = useState(1);

  const weightKg = useMemo(
    () => (units === "metric" ? Number(kg) : Number(lb) * 0.453592),
    [units, kg, lb]
  );
  const heightCm = useMemo(
    () => (units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54),
    [units, cm, ft, inch]
  );

  // Mifflin-St Jeor
  const bmr = useMemo(() => {
    if (!weightKg || !heightCm || !age) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * Number(age);
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }, [weightKg, heightCm, age, sex]);

  const tdee = useMemo(() => Math.round(bmr * ACTIVITY[actIdx].factor), [bmr, actIdx]);

  const goals = useMemo(() => ({
    extremeLoss:  Math.max(1000, tdee - 1000),
    mildLoss:     Math.max(1200, tdee - 500),
    maintain:     tdee,
    mildGain:     tdee + 250,
    gain:         tdee + 500,
  }), [tdee]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>TDEE Calculator</h1>
        <p className="muted">
          Calculate your Total Daily Energy Expenditure — the total calories you burn each day —
          and see recommended intake for weight loss, maintenance, and gain.
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

          <div className="row two">
            <div className="field">
              <label>Age (years)</label>
              <input type="number" min={15} max={80} value={age}
                onChange={e => setAge(e.target.value)} />
            </div>
            {units === "metric" ? (
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" min={30} max={300} value={kg}
                  onChange={e => setKg(e.target.value)} />
              </div>
            ) : (
              <div className="field">
                <label>Weight (lb)</label>
                <input type="number" min={66} max={660} value={lb}
                  onChange={e => setLb(e.target.value)} />
              </div>
            )}
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

          <div className="row">
            <div className="field">
              <label>Activity Level</label>
              <select value={actIdx} onChange={e => setActIdx(Number(e.target.value))}>
                {ACTIVITY.map((a, i) => <option key={i} value={i}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <p className="small">
            BMR is calculated using the Mifflin-St Jeor equation. TDEE = BMR × activity multiplier.
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">BMR</div>
              <div className="kpi-value">{bmr ? bmr.toLocaleString() : "—"}</div>
              <div className="kpi-sub">Basal metabolic rate</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">TDEE</div>
              <div className="kpi-value">{tdee ? tdee.toLocaleString() : "—"}</div>
              <div className="kpi-sub">{ACTIVITY[actIdx].tag}</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Goal</th>
                <th>Calories / day</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Extreme weight loss</td>
                <td><strong>{goals.extremeLoss.toLocaleString()} kcal</strong></td>
                <td>−1000 kcal</td>
              </tr>
              <tr>
                <td>Mild weight loss</td>
                <td><strong>{goals.mildLoss.toLocaleString()} kcal</strong></td>
                <td>−500 kcal</td>
              </tr>
              <tr style={{ background: "#f0eeff" }}>
                <td><strong>Maintain weight</strong></td>
                <td><strong>{goals.maintain.toLocaleString()} kcal</strong></td>
                <td>0 kcal</td>
              </tr>
              <tr>
                <td>Mild weight gain</td>
                <td><strong>{goals.mildGain.toLocaleString()} kcal</strong></td>
                <td>+250 kcal</td>
              </tr>
              <tr>
                <td>Weight gain</td>
                <td><strong>{goals.gain.toLocaleString()} kcal</strong></td>
                <td>+500 kcal</td>
              </tr>
            </tbody>
          </table>

          <h3 className="card-title" style={{ marginTop: 18 }}>TDEE by Activity Level</h3>
          <table className="table">
            <thead>
              <tr><th>Activity Level</th><th>TDEE (kcal)</th></tr>
            </thead>
            <tbody>
              {ACTIVITY.map((a, i) => (
                <tr key={i} style={i === actIdx ? { background: "#f0eeff" } : {}}>
                  <td>{a.tag}</td>
                  <td><strong>{bmr ? Math.round(bmr * a.factor).toLocaleString() : "—"}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            These are estimates. Individual metabolism can vary by 15–20%. Consult a healthcare
            professional for personalized dietary advice.
          </p>
        </section>
      </div>
    </div>
  );
}
