import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

const ACTIVITY = [
  { label: "Sedentary (desk job, no exercise)",            factor: 1.2  },
  { label: "Lightly active (light exercise 1–3 days/wk)", factor: 1.375 },
  { label: "Moderately active (3–5 days/wk)",             factor: 1.55 },
  { label: "Very active (hard exercise 6–7 days/wk)",     factor: 1.725 },
  { label: "Extra active (very hard / physical job)",     factor: 1.9  },
];

const GOALS = [
  { key: "lose",     label: "Lose Weight",    adj: -500, carbPct: 0.30, tag: "Low-carb/deficit" },
  { key: "maintain", label: "Maintain Weight", adj: 0,   carbPct: 0.45, tag: "Balanced" },
  { key: "gain",     label: "Build Muscle",   adj: +300, carbPct: 0.50, tag: "Higher-carb/surplus" },
  { key: "endurance",label: "Endurance Sport",adj: 0,    carbPct: 0.60, tag: "High-carb / performance" },
];

export default function CarbohydrateCalculator() {
  const [units, setUnits]   = useState("metric");
  const [sex, setSex]       = useState("male");
  const [age, setAge]       = useState(25);
  const [kg, setKg]         = useState(75);
  const [lb, setLb]         = useState(165);
  const [cm, setCm]         = useState(175);
  const [ft, setFt]         = useState(5);
  const [inch, setInch]     = useState(9);
  const [actIdx, setActIdx] = useState(1);
  const [goalKey, setGoalKey] = useState("maintain");

  const weightKg = useMemo(
    () => units === "metric" ? Number(kg) : Number(lb) * 0.453592,
    [units, kg, lb]
  );
  const heightCm = useMemo(
    () => units === "metric" ? Number(cm) : (Number(ft) * 12 + Number(inch)) * 2.54,
    [units, cm, ft, inch]
  );

  const bmr = useMemo(() => {
    if (!weightKg || !heightCm || !age) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * Number(age);
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }, [weightKg, heightCm, age, sex]);

  const tdee = useMemo(() => Math.round(bmr * ACTIVITY[actIdx].factor), [bmr, actIdx]);

  const goal = GOALS.find(g => g.key === goalKey) || GOALS[1];
  const targetCal  = useMemo(() => Math.max(1200, tdee + goal.adj), [tdee, goal]);
  const carbCal    = useMemo(() => Math.round(targetCal * goal.carbPct), [targetCal, goal]);
  const carbGrams  = useMemo(() => Math.round(carbCal / 4), [carbCal]);
  const carbPerKg  = useMemo(() => (weightKg ? (carbGrams / weightKg).toFixed(1) : 0), [carbGrams, weightKg]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Carbohydrate Calculator</h1>
        <p className="muted">
          Find your daily carbohydrate intake recommendation based on your calorie needs,
          activity level, and fitness goal — from weight loss to endurance performance.
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
              <select value={goalKey} onChange={e => setGoalKey(e.target.value)}>
                {GOALS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Daily Carbs</div>
              <div className="kpi-value">{carbGrams}g</div>
              <div className="kpi-sub">{carbPerKg} g/kg · {carbCal} kcal</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">% of Calories</div>
              <div className="kpi-value">{Math.round(goal.carbPct * 100)}%</div>
              <div className="kpi-sub">{goal.tag}</div>
            </div>
          </div>

          <div className="kpi-grid" style={{ marginTop: 10 }}>
            <div className="kpi">
              <div className="kpi-label">BMR</div>
              <div className="kpi-value">{bmr}</div>
              <div className="kpi-sub">kcal / day</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Target Calories</div>
              <div className="kpi-value">{targetCal}</div>
              <div className="kpi-sub">kcal / day</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Goal</th><th>Carb %</th><th>Daily (g)</th></tr>
            </thead>
            <tbody>
              <tr><td>Weight loss (low carb)</td><td>20–30%</td><td>{Math.round(targetCal * 0.25 / 4)}g</td></tr>
              <tr><td>General health</td><td>40–50%</td><td>{Math.round(targetCal * 0.45 / 4)}g</td></tr>
              <tr><td>Muscle gain</td><td>45–55%</td><td>{Math.round(targetCal * 0.50 / 4)}g</td></tr>
              <tr><td>Endurance sports</td><td>55–65%</td><td>{Math.round(targetCal * 0.60 / 4)}g</td></tr>
              <tr style={{ background:"#f0eeff" }}>
                <td><strong>Your recommendation</strong></td>
                <td><strong>{Math.round(goal.carbPct * 100)}%</strong></td>
                <td><strong>{carbGrams}g</strong></td>
              </tr>
            </tbody>
          </table>

          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr><th>Macro</th><th>Grams</th><th>Calories</th><th>%</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Carbohydrates</td>
                <td><strong>{carbGrams}g</strong></td>
                <td>{carbCal}</td>
                <td>{Math.round(goal.carbPct * 100)}%</td>
              </tr>
              <tr>
                <td>Remaining (protein + fat)</td>
                <td>—</td>
                <td>{targetCal - carbCal}</td>
                <td>{100 - Math.round(goal.carbPct * 100)}%</td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            Carbohydrates provide 4 kcal per gram. The DRI recommends a minimum of 130g/day for
            adequate brain function. Athletes may need significantly more.
          </p>
        </section>
      </div>
    </div>
  );
}
