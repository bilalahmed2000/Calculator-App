import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* MET values (Metabolic Equivalent of Task) — ACSM / Compendium of Physical Activities */
const CATEGORIES = [
  {
    label: "Running & Walking",
    activities: [
      { label: "Walking, 2 mph (slow)",          met: 2.5 },
      { label: "Walking, 3 mph (moderate)",       met: 3.5 },
      { label: "Walking, 3.5 mph (brisk)",        met: 4.3 },
      { label: "Walking, 4 mph (fast)",           met: 5.0 },
      { label: "Jogging (general)",               met: 7.0 },
      { label: "Running, 5 mph (12 min/mile)",    met: 8.3 },
      { label: "Running, 6 mph (10 min/mile)",    met: 9.8 },
      { label: "Running, 7 mph (8.5 min/mile)",   met: 11.0 },
      { label: "Running, 8 mph (7.5 min/mile)",   met: 11.8 },
      { label: "Running, 10 mph (6 min/mile)",    met: 14.5 },
    ],
  },
  {
    label: "Cycling",
    activities: [
      { label: "Cycling, < 10 mph (leisure)",     met: 4.0 },
      { label: "Cycling, 10–12 mph (light)",      met: 6.0 },
      { label: "Cycling, 12–14 mph (moderate)",   met: 8.0 },
      { label: "Cycling, 14–16 mph (vigorous)",   met: 10.0 },
      { label: "Cycling, 16–19 mph (very fast)",  met: 12.0 },
      { label: "Cycling, > 20 mph (racing)",      met: 15.8 },
      { label: "Stationary bike (moderate)",      met: 6.8 },
    ],
  },
  {
    label: "Swimming",
    activities: [
      { label: "Swimming (leisurely)",            met: 6.0 },
      { label: "Swimming (moderate)",             met: 8.3 },
      { label: "Swimming (vigorous / laps)",      met: 10.0 },
      { label: "Water aerobics",                  met: 4.0 },
    ],
  },
  {
    label: "Gym & Strength",
    activities: [
      { label: "Weight lifting (general)",        met: 3.5 },
      { label: "Weight lifting (vigorous)",       met: 6.0 },
      { label: "Circuit training",                met: 8.0 },
      { label: "CrossFit / HIIT",                 met: 8.0 },
      { label: "Stretching / Yoga",              met: 2.5 },
      { label: "Pilates",                         met: 3.0 },
      { label: "Aerobics (low impact)",           met: 5.0 },
      { label: "Aerobics (high impact)",          met: 7.3 },
    ],
  },
  {
    label: "Sports",
    activities: [
      { label: "Basketball (game)",               met: 8.0 },
      { label: "Soccer (casual)",                 met: 7.0 },
      { label: "Soccer (competitive)",            met: 10.0 },
      { label: "Tennis (singles)",                met: 8.0 },
      { label: "Volleyball",                      met: 4.0 },
      { label: "Golf (walking with clubs)",       met: 4.3 },
      { label: "Hiking",                          met: 6.0 },
      { label: "Rowing (moderate)",               met: 7.0 },
      { label: "Jump rope (moderate)",            met: 11.8 },
      { label: "Martial arts",                    met: 10.3 },
    ],
  },
  {
    label: "Daily Activities",
    activities: [
      { label: "Sleeping",                        met: 0.95 },
      { label: "Watching TV / resting",           met: 1.0 },
      { label: "Office work (sitting)",           met: 1.5 },
      { label: "Standing (light work)",           met: 2.0 },
      { label: "Cleaning / housework",            met: 3.5 },
      { label: "Gardening",                       met: 3.5 },
      { label: "Dancing",                         met: 5.5 },
      { label: "Mowing lawn (push mower)",        met: 5.5 },
    ],
  },
];

// Flatten for lookup
const ALL_ACTIVITIES = CATEGORIES.flatMap((c, ci) =>
  c.activities.map((a, ai) => ({ ...a, catIdx: ci, actIdx: ai, key: `${ci}-${ai}` }))
);

export default function CaloriesBurnedCalculator() {
  const [units, setUnits]   = useState("metric");
  const [kg, setKg]         = useState(70);
  const [lb, setLb]         = useState(154);
  const [catIdx, setCatIdx] = useState(0);
  const [actKey, setActKey] = useState("0-4"); // jogging
  const [hours, setHours]   = useState(0);
  const [mins, setMins]     = useState(30);

  const weightKg = useMemo(
    () => units === "metric" ? Number(kg) : Number(lb) * 0.453592,
    [units, kg, lb]
  );

  const activity = ALL_ACTIVITIES.find(a => a.key === actKey);
  const durationHrs = useMemo(() => Number(hours) + Number(mins) / 60, [hours, mins]);

  // Calories burned = MET × weight (kg) × duration (hours)
  const caloriesBurned = useMemo(() => {
    if (!activity || !weightKg || !durationHrs) return 0;
    return Math.round(activity.met * weightKg * durationHrs);
  }, [activity, weightKg, durationHrs]);

  const perMinute = useMemo(() => {
    if (!activity || !weightKg) return 0;
    return Math.round((activity.met * weightKg) / 60 * 10) / 10;
  }, [activity, weightKg]);

  // Update activity key when category changes, pick first item
  const handleCatChange = (ci) => {
    setCatIdx(ci);
    setActKey(`${ci}-0`);
  };

  const currentCatActivities = CATEGORIES[catIdx].activities.map((a, ai) => ({ ...a, key: `${catIdx}-${ai}` }));

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Calories Burned Calculator</h1>
        <p className="muted">
          Estimate the calories burned during any physical activity or exercise based on
          your body weight, activity type, and duration using MET values.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Activity Details</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (kg)</option>
                <option value="us">US (lb)</option>
              </select>
            </div>
            {units === "metric" ? (
              <div className="field">
                <label>Body Weight (kg)</label>
                <input type="number" min={30} max={300} value={kg} onChange={e => setKg(e.target.value)} />
              </div>
            ) : (
              <div className="field">
                <label>Body Weight (lb)</label>
                <input type="number" min={66} max={660} value={lb} onChange={e => setLb(e.target.value)} />
              </div>
            )}
          </div>

          <div className="row">
            <div className="field">
              <label>Activity Category</label>
              <select value={catIdx} onChange={e => handleCatChange(Number(e.target.value))}>
                {CATEGORIES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Activity</label>
              <select value={actKey} onChange={e => setActKey(e.target.value)}>
                {currentCatActivities.map(a => (
                  <option key={a.key} value={a.key}>{a.label} (MET {a.met})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Duration (hours)</label>
              <input type="number" min={0} max={24} value={hours} onChange={e => setHours(e.target.value)} />
            </div>
            <div className="field">
              <label>Duration (minutes)</label>
              <input type="number" min={0} max={59} value={mins} onChange={e => setMins(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Calories Burned</div>
              <div className="kpi-value">{caloriesBurned ? caloriesBurned.toLocaleString() : "—"}</div>
              <div className="kpi-sub">kcal total</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Per Minute</div>
              <div className="kpi-value">{perMinute || "—"}</div>
              <div className="kpi-sub">kcal / min</div>
            </div>
          </div>

          {activity && (
            <div className="bar-title" style={{ marginTop: 14 }}>
              Activity: <strong>{activity.label}</strong>
              <span className="small" style={{ marginLeft: 8 }}>MET = {activity.met}</span>
            </div>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Duration</th><th>Calories Burned</th></tr>
            </thead>
            <tbody>
              {activity && weightKg && [15, 30, 45, 60, 90, 120].map(m => (
                <tr key={m} style={m === Number(hours) * 60 + Number(mins) ? { background:"#f0eeff" } : {}}>
                  <td>{m < 60 ? `${m} min` : `${m/60} hr${m > 60 ? "s" : ""}`}</td>
                  <td><strong>{Math.round(activity.met * weightKg * m / 60)} kcal</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            Formula: <strong>Calories = MET × weight (kg) × duration (hours)</strong>.
            MET values are from the Compendium of Physical Activities. Results are estimates —
            actual burn depends on fitness level, age, and individual metabolism.
          </p>
        </section>
      </div>
    </div>
  );
}
