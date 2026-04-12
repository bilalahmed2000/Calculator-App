import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

const ACTIVITY = [
  { label: "Sedentary (little or no exercise)",            factor: 1.2 },
  { label: "Lightly active (1–3 days/week)",              factor: 1.375 },
  { label: "Moderately active (3–5 days/week)",           factor: 1.55 },
  { label: "Very active (6–7 days/week)",                 factor: 1.725 },
  { label: "Super active (hard exercise, physical job)",  factor: 1.9 },
];

const GOALS = [
  { label: "Lose weight (mild deficit −250 kcal)",  adj: -250 },
  { label: "Lose weight (moderate deficit −500 kcal)", adj: -500 },
  { label: "Maintain weight",                        adj: 0 },
  { label: "Gain weight (mild surplus +250 kcal)",  adj: 250 },
  { label: "Gain weight (moderate surplus +500 kcal)", adj: 500 },
];

// Macros split presets (protein%, carb%, fat%)
const SPLITS = [
  { label: "Balanced (30 / 40 / 30)",    p: 0.30, c: 0.40, f: 0.30 },
  { label: "Low carb (40 / 20 / 40)",    p: 0.40, c: 0.20, f: 0.40 },
  { label: "High protein (40 / 35 / 25)",p: 0.40, c: 0.35, f: 0.25 },
  { label: "Keto (30 / 5 / 65)",         p: 0.30, c: 0.05, f: 0.65 },
];

export default function MacroCalculator() {
  const [units, setUnits] = useState("metric");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(70);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(9);
  const [lb, setLb] = useState(154);
  const [actIdx, setActIdx] = useState(1);
  const [goalIdx, setGoalIdx] = useState(2);
  const [splitIdx, setSplitIdx] = useState(0);

  const weightKg = useMemo(
    () => (units === "metric" ? Number(kg) : Number(lb) * 0.453592),
    [units, kg, lb]
  );
  const heightCm = useMemo(
    () => (units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54),
    [units, cm, ft, inch]
  );

  // Mifflin-St Jeor BMR
  const bmr = useMemo(() => {
    if (!weightKg || !heightCm || !age) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * Number(age);
    return sex === "male" ? base + 5 : base - 161;
  }, [weightKg, heightCm, age, sex]);

  const tdee = useMemo(() => Math.round(bmr * ACTIVITY[actIdx].factor), [bmr, actIdx]);
  const targetCal = useMemo(() => Math.max(1200, tdee + GOALS[goalIdx].adj), [tdee, goalIdx]);

  const split = SPLITS[splitIdx];
  const protein = useMemo(() => Math.round((targetCal * split.p) / 4), [targetCal, split]);
  const carbs   = useMemo(() => Math.round((targetCal * split.c) / 4), [targetCal, split]);
  const fat     = useMemo(() => Math.round((targetCal * split.f) / 9), [targetCal, split]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Macro Calculator</h1>
        <p className="muted">
          Calculate your daily calorie target and macronutrient breakdown — protein, carbs, and fat —
          based on your body stats, activity level, and goal.
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
          <div className="row">
            <div className="field">
              <label>Goal</label>
              <select value={goalIdx} onChange={e => setGoalIdx(Number(e.target.value))}>
                {GOALS.map((g, i) => <option key={i} value={i}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Macro Split</label>
              <select value={splitIdx} onChange={e => setSplitIdx(Number(e.target.value))}>
                {SPLITS.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">BMR</div>
              <div className="kpi-value">{bmr ? Math.round(bmr).toLocaleString() : "—"}</div>
              <div className="kpi-sub">kcal / day</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">TDEE</div>
              <div className="kpi-value">{tdee ? tdee.toLocaleString() : "—"}</div>
              <div className="kpi-sub">kcal / day</div>
            </div>
          </div>

          <div className="bar-title" style={{ textAlign: "center", fontSize: 16 }}>
            Daily Target: <strong>{targetCal.toLocaleString()} kcal</strong>
          </div>

          <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 14 }}>
            <div className="kpi">
              <div className="kpi-label">Protein</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{protein}g</div>
              <div className="kpi-sub">{Math.round(split.p * 100)}% of cals</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Carbs</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{carbs}g</div>
              <div className="kpi-sub">{Math.round(split.c * 100)}% of cals</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Fat</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{fat}g</div>
              <div className="kpi-sub">{Math.round(split.f * 100)}% of cals</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: 18 }}>
            <thead>
              <tr>
                <th>Macro</th>
                <th>Grams / day</th>
                <th>Calories</th>
                <th>% of total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Protein</td>
                <td>{protein} g</td>
                <td>{protein * 4} kcal</td>
                <td>{Math.round(split.p * 100)}%</td>
              </tr>
              <tr>
                <td>Carbohydrates</td>
                <td>{carbs} g</td>
                <td>{carbs * 4} kcal</td>
                <td>{Math.round(split.c * 100)}%</td>
              </tr>
              <tr>
                <td>Fat</td>
                <td>{fat} g</td>
                <td>{fat * 9} kcal</td>
                <td>{Math.round(split.f * 100)}%</td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            BMR uses the Mifflin-St Jeor equation. TDEE = BMR × activity factor. Macros are
            calculated from your target calories using the selected split.
          </p>
        </section>
      </div>
    </div>
  );
}
