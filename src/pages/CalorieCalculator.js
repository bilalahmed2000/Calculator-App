import React, { useMemo, useState } from "react";
import "../css/Calorie.css";

const ACTIVITY = [
  { key: "sedentary", label: "Sedentary (little or no exercise)", factor: 1.2 },
  { key: "light", label: "Light (1–3 days/week)", factor: 1.375 },
  { key: "moderate", label: "Moderate (3–5 days/week)", factor: 1.55 },
  { key: "very", label: "Very Active (6–7 days/week)", factor: 1.725 },
  { key: "extra", label: "Extra Active (hard job & daily training)", factor: 1.9 },
];

export default function CalorieCalculator() {
  const [units, setUnits] = useState("metric"); // 'metric' | 'us'
  const [sex, setSex] = useState("male"); // 'male' | 'female'
  const [age, setAge] = useState(30);

  // height
  const [cm, setCm] = useState(175);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(9);

  // weight
  const [kg, setKg] = useState(70);
  const [lb, setLb] = useState(154);

  const [activityKey, setActivityKey] = useState("moderate");

  // helpers
  const heightCm = useMemo(
    () => (units === "metric" ? cm : Math.round(((ft * 12 + Number(inch || 0)) * 2.54) * 10) / 10),
    [units, cm, ft, inch]
  );
  const weightKg = useMemo(
    () => (units === "metric" ? kg : Math.round((lb * 0.45359237) * 10) / 10),
    [units, kg, lb]
  );

  const activityFactor = ACTIVITY.find(a => a.key === activityKey)?.factor ?? 1.55;

  // Mifflin–St Jeor BMR
  const bmr = useMemo(() => {
    if (!age || !heightCm || !weightKg) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round((sex === "male" ? base + 5 : base - 161));
  }, [sex, age, heightCm, weightKg]);

  const tdee = useMemo(() => Math.round(bmr * activityFactor), [bmr, activityFactor]);

  // targets
  const targets = useMemo(() => {
    const mk = (n) => Math.max(0, Math.round(n));
    return {
      maintain: tdee,
      mildLoss: mk(tdee * 0.9),  // ~10% deficit
      loss: mk(tdee * 0.8),      // ~20% deficit
      mildGain: mk(tdee * 1.1),  // ~10% surplus
      gain: mk(tdee * 1.2),      // ~20% surplus
    };
  }, [tdee]);

  // simple macro split (Protein 30% / Fat 25% / Carbs 45%)
  const macro = useMemo(() => {
    const cals = tdee;
    const pct = { p: 0.3, f: 0.25, c: 0.45 };
    const grams = {
      p: Math.round((cals * pct.p) / 4),
      f: Math.round((cals * pct.f) / 9),
      c: Math.round((cals * pct.c) / 4),
    };
    return grams;
  }, [tdee]);

  return (
    <div className="calorie-wrap">
      {/* Header / Hero */}
      <header className="calorie-hero">
        <h1>Calorie Calculator</h1>
        <p className="muted">
          Estimate your daily calorie needs to maintain, lose, or gain weight. Uses the Mifflin–St Jeor equation with activity factors.
        </p>
      </header>

      <div className="calorie-grid">
        {/* Form Card */}
        <section className="card">
          <h2 className="card-title">Your Details</h2>

          {/* Units & Sex */}
          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value)}>
                <option value="metric">Metric (kg / cm)</option>
                <option value="us">US (lb / ft-in)</option>
              </select>
            </div>
            <div className="field">
              <label>Sex</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Age */}
          <div className="row">
            <div className="field">
              <label>Age</label>
              <input
                type="number"
                min={10}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Height */}
          {units === "metric" ? (
            <div className="row">
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
            </div>
          ) : (
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
          )}

          {/* Weight */}
          {units === "metric" ? (
            <div className="row">
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
          ) : (
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
          )}

          {/* Activity */}
          <div className="row">
            <div className="field">
              <label>Activity Level</label>
              <select value={activityKey} onChange={(e) => setActivityKey(e.target.value)}>
                {ACTIVITY.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline facts */}
          <div className="facts">
            <div><span className="hint">Height (cm):</span> {heightCm}</div>
            <div><span className="hint">Weight (kg):</span> {weightKg}</div>
          </div>
        </section>

        {/* Results Card */}
        <section className="card results">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">BMR</div>
              <div className="kpi-value">{bmr.toLocaleString()} kcal/day</div>
              <div className="kpi-sub">Basal Metabolic Rate</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Maintenance</div>
              <div className="kpi-value">{tdee.toLocaleString()} kcal/day</div>
              <div className="kpi-sub">TDEE (activity-adjusted)</div>
            </div>
          </div>

          <h3 className="subhead">Suggested Daily Targets</h3>
          <ul className="targets">
            <li><b>Maintain:</b> {targets.maintain.toLocaleString()} kcal</li>
            <li><b>Lose (-10%):</b> {targets.mildLoss.toLocaleString()} kcal</li>
            <li><b>Lose (-20%):</b> {targets.loss.toLocaleString()} kcal</li>
            <li><b>Gain (+10%):</b> {targets.mildGain.toLocaleString()} kcal</li>
            <li><b>Gain (+20%):</b> {targets.gain.toLocaleString()} kcal</li>
          </ul>

          <h3 className="subhead">Macro Split (Maintain)</h3>
          <div className="macro">
            <div><span>Protein</span><b>{macro.p} g</b></div>
            <div><span>Fat</span><b>{macro.f} g</b></div>
            <div><span>Carbs</span><b>{macro.c} g</b></div>
          </div>

          <p className="disclaimer">
            This tool provides estimates for healthy adults. Consult a professional for personalized advice.
          </p>
        </section>
      </div>
    </div>
  );
}
