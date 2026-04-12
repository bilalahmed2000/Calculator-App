import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

const ACTIVITY = [
  { label: "Sedentary (little/no exercise)",            factor: 1.2,   multiplier: { lose: 1.6, maintain: 1.6, gain: 1.8 } },
  { label: "Lightly active (1–3 days/week)",            factor: 1.375, multiplier: { lose: 1.8, maintain: 1.8, gain: 2.0 } },
  { label: "Moderately active (3–5 days/week)",         factor: 1.55,  multiplier: { lose: 2.0, maintain: 2.0, gain: 2.2 } },
  { label: "Very active (6–7 days/week)",               factor: 1.725, multiplier: { lose: 2.2, maintain: 2.2, gain: 2.4 } },
  { label: "Extra active (very hard exercise/physical job)", factor: 1.9, multiplier: { lose: 2.4, maintain: 2.4, gain: 2.6 } },
];

const GOALS = [
  { key: "lose",     label: "Lose Weight / Fat Loss" },
  { key: "maintain", label: "Maintain Weight" },
  { key: "gain",     label: "Build Muscle / Gain Weight" },
];

export default function ProteinCalculator() {
  const [units, setUnits]   = useState("metric");
  const [sex, setSex]       = useState("male");
  const [age, setAge]       = useState(25);
  const [kg, setKg]         = useState(75);
  const [lb, setLb]         = useState(165);
  const [cm, setCm]         = useState(175);
  const [ft, setFt]         = useState(5);
  const [inch, setInch]     = useState(9);
  const [actIdx, setActIdx] = useState(1);
  const [goal, setGoal]     = useState("maintain");

  const weightKg = useMemo(
    () => units === "metric" ? Number(kg) : Number(lb) * 0.453592,
    [units, kg, lb]
  );
  const heightCm = useMemo(
    () => units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54,
    [units, cm, ft, inch]
  );

  // BMR (Mifflin-St Jeor)
  const bmr = useMemo(() => {
    if (!weightKg || !heightCm || !age) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * Number(age);
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }, [weightKg, heightCm, age, sex]);

  const tdee = useMemo(() => Math.round(bmr * ACTIVITY[actIdx].factor), [bmr, actIdx]);

  // Protein recommendations (g/kg of bodyweight)
  const mult = ACTIVITY[actIdx].multiplier[goal];
  const proteinGrams = useMemo(() => Math.round(weightKg * mult), [weightKg, mult]);
  const proteinCals  = useMemo(() => proteinGrams * 4, [proteinGrams]);
  const proteinPct   = useMemo(() => tdee ? Math.round((proteinCals / tdee) * 100) : 0, [proteinCals, tdee]);

  // Range: RDA minimum to upper recommended
  const rdaMin  = useMemo(() => Math.round(weightKg * 0.8),  [weightKg]);
  const rdaMax  = useMemo(() => Math.round(weightKg * 2.2),  [weightKg]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Protein Calculator</h1>
        <p className="muted">
          Calculate your recommended daily protein intake based on your body weight,
          activity level, and fitness goal — from fat loss to muscle building.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Profile</h2>

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
              <input type="number" min={15} max={80} value={age} onChange={e => setAge(e.target.value)} />
            </div>
            {units === "metric" ? (
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" min={30} max={300} value={kg} onChange={e => setKg(e.target.value)} />
              </div>
            ) : (
              <div className="field">
                <label>Weight (lb)</label>
                <input type="number" min={66} max={660} value={lb} onChange={e => setLb(e.target.value)} />
              </div>
            )}
          </div>

          {units === "metric" ? (
            <div className="row">
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" min={100} max={250} value={cm} onChange={e => setCm(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="row two">
              <div className="field">
                <label>Height (ft)</label>
                <input type="number" min={3} max={8} value={ft} onChange={e => setFt(e.target.value)} />
              </div>
              <div className="field">
                <label>Height (in)</label>
                <input type="number" min={0} max={11} value={inch} onChange={e => setInch(e.target.value)} />
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

          <div className="row">
            <div className="field">
              <label>Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)}>
                {GOALS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Daily Protein</div>
              <div className="kpi-value">{proteinGrams}g</div>
              <div className="kpi-sub">{(weightKg ? (proteinGrams / weightKg).toFixed(1) : 0)} g/kg bodyweight</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Protein Calories</div>
              <div className="kpi-value">{proteinCals}</div>
              <div className="kpi-sub">{proteinPct}% of TDEE ({tdee} kcal)</div>
            </div>
          </div>

          <div className="bar-title" style={{ marginTop: 14 }}>
            Protein Range: <strong>{rdaMin}g – {rdaMax}g / day</strong>
            <span className="small" style={{ marginLeft: 8 }}>({(rdaMin / (weightKg || 1)).toFixed(1)}–{(rdaMax / (weightKg || 1)).toFixed(1)} g/kg)</span>
          </div>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Goal</th><th>g / kg BW</th><th>Daily (g)</th></tr>
            </thead>
            <tbody>
              <tr><td>Minimum (RDA)</td><td>0.8</td><td>{Math.round(weightKg * 0.8)}</td></tr>
              <tr><td>General fitness</td><td>1.2–1.6</td><td>{Math.round(weightKg * 1.2)}–{Math.round(weightKg * 1.6)}</td></tr>
              <tr><td>Endurance athlete</td><td>1.4–1.7</td><td>{Math.round(weightKg * 1.4)}–{Math.round(weightKg * 1.7)}</td></tr>
              <tr><td>Strength / muscle gain</td><td>1.6–2.2</td><td>{Math.round(weightKg * 1.6)}–{Math.round(weightKg * 2.2)}</td></tr>
              <tr><td>Weight loss (preserve muscle)</td><td>1.8–2.4</td><td>{Math.round(weightKg * 1.8)}–{Math.round(weightKg * 2.4)}</td></tr>
              <tr style={{ background:"#f0eeff" }}>
                <td><strong>Your recommendation</strong></td>
                <td><strong>{mult} g/kg</strong></td>
                <td><strong>{proteinGrams}g</strong></td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            Protein needs vary based on age, training intensity, and individual physiology. These
            values are based on current sports nutrition guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
