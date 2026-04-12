import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

const ACTIVITY = [
  { label: "Sedentary (little/no exercise)",              factor: 1.2   },
  { label: "Lightly active (light exercise 1–3 days/wk)", factor: 1.375 },
  { label: "Moderately active (3–5 days/wk)",             factor: 1.55  },
  { label: "Very active (hard exercise 6–7 days/wk)",     factor: 1.725 },
  { label: "Extra active (very hard / physical job)",     factor: 1.9   },
];

const GOALS = [
  { key: "lose",     label: "Lose Weight",    adj: -500, fatPct: 0.25 },
  { key: "maintain", label: "Maintain Weight", adj: 0,   fatPct: 0.30 },
  { key: "gain",     label: "Build Muscle",   adj: +300, fatPct: 0.30 },
  { key: "keto",     label: "Ketogenic Diet", adj: 0,    fatPct: 0.70 },
  { key: "lowfat",   label: "Low-Fat Diet",   adj: 0,    fatPct: 0.15 },
];

/* Fat subtypes as % of total fat intake */
const FAT_TYPES = [
  { name: "Saturated fat",             pct: 0.25, limit: "< 10% of calories", color: "#fca5a5" },
  { name: "Monounsaturated fat (MUFA)", pct: 0.40, limit: "15–20% of calories", color: "#86efac" },
  { name: "Polyunsaturated fat (PUFA)", pct: 0.35, limit: "5–10% of calories", color: "#93c5fd" },
];

export default function FatIntakeCalculator() {
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
  const targetCal = useMemo(() => Math.max(1200, tdee + goal.adj), [tdee, goal]);
  const fatCal    = useMemo(() => Math.round(targetCal * goal.fatPct), [targetCal, goal]);
  const fatGrams  = useMemo(() => Math.round(fatCal / 9), [fatCal]);
  const fatPerKg  = useMemo(() => (weightKg ? (fatGrams / weightKg).toFixed(1) : 0), [fatGrams, weightKg]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Fat Intake Calculator</h1>
        <p className="muted">
          Calculate your recommended daily fat intake in grams based on your calorie needs,
          activity level, and dietary goal — including a breakdown by fat type.
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
              <label>Dietary Goal</label>
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
              <div className="kpi-label">Daily Fat Intake</div>
              <div className="kpi-value">{fatGrams}g</div>
              <div className="kpi-sub">{fatPerKg} g/kg · {fatCal} kcal</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">% of Calories</div>
              <div className="kpi-value">{Math.round(goal.fatPct * 100)}%</div>
              <div className="kpi-sub">Target: {targetCal} kcal/day</div>
            </div>
          </div>

          <div className="kpi-grid" style={{ marginTop: 10 }}>
            <div className="kpi">
              <div className="kpi-label">BMR</div>
              <div className="kpi-value">{bmr}</div>
              <div className="kpi-sub">kcal/day</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">TDEE</div>
              <div className="kpi-value">{tdee}</div>
              <div className="kpi-sub">kcal/day</div>
            </div>
          </div>

          {/* Fat type breakdown */}
          <h3 className="card-title" style={{ marginTop: 18 }}>Fat Type Breakdown</h3>
          {FAT_TYPES.map(ft => (
            <div key={ft.name} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: ft.color + "33", border: `1px solid ${ft.color}88` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e1b4b" }}>{ft.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7a9e", marginTop: 2 }}>{ft.limit}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#312e81" }}>
                  {Math.round(fatGrams * ft.pct)}g
                </div>
              </div>
            </div>
          ))}

          <table className="table" style={{ marginTop: 14 }}>
            <thead>
              <tr><th>Diet Type</th><th>Fat %</th><th>Fat (g)</th></tr>
            </thead>
            <tbody>
              {GOALS.map(g => (
                <tr key={g.key} style={g.key === goalKey ? { background:"#f0eeff" } : {}}>
                  <td>{g.label}</td>
                  <td>{Math.round(g.fatPct * 100)}%</td>
                  <td><strong>{Math.round(targetCal * g.fatPct / 9)}g</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            Fat provides 9 kcal per gram. The DRI recommends 20–35% of calories from fat for adults.
            Trans fats should be avoided entirely. Limit saturated fat to &lt;10% of calories.
          </p>
        </section>
      </div>
    </div>
  );
}
