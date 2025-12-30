import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Mifflin–St Jeor BMR
 * Men:    BMR = 10W + 6.25H - 5A + 5
 * Women:  BMR = 10W + 6.25H - 5A - 161
 *  W in kg, H in cm, A in years
 */

const LB_PER_KG = 2.20462262185;
const IN_PER_CM = 0.3937007874;

const activityLevels = [
  {
    id: "sedentary",
    label: "Sedentary (little or no exercise)",
    factor: 1.2,
  },
  {
    id: "light",
    label: "Lightly active (1–3 days/week)",
    factor: 1.375,
  },
  {
    id: "moderate",
    label: "Moderately active (3–5 days/week)",
    factor: 1.55,
  },
  {
    id: "very",
    label: "Very active (6–7 days/week)",
    factor: 1.725,
  },
  {
    id: "extra",
    label: "Extra active (physical job or 2x/day training)",
    factor: 1.9,
  },
];

export default function BMRCalculator() {
  const [units, setUnits] = useState("metric"); // metric | us
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(30);

  // metric
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  // US
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weightLb, setWeightLb] = useState(154);

  // normalize to metric for formula
  const normHeightCm = useMemo(() => {
    if (units === "metric") return Number(heightCm || 0);
    const totalIn = (Number(heightFt || 0) * 12) + Number(heightIn || 0);
    return totalIn / IN_PER_CM;
  }, [units, heightCm, heightFt, heightIn]);

  const normWeightKg = useMemo(() => {
    if (units === "metric") return Number(weightKg || 0);
    return Number(weightLb || 0) / LB_PER_KG;
  }, [units, weightKg, weightLb]);

  const bmr = useMemo(() => {
    const W = normWeightKg;
    const H = normHeightCm;
    const A = Number(age || 0);
    if (!W || !H || !A) return 0;

    const base = 10 * W + 6.25 * H - 5 * A;
    const raw = sex === "male" ? base + 5 : base - 161;
    return Math.round(raw);
  }, [normWeightKg, normHeightCm, age, sex]);

  const tdee = useMemo(
    () =>
      activityLevels.map((lvl) => ({
        ...lvl,
        calories: bmr ? Math.round(bmr * lvl.factor) : 0,
      })),
    [bmr]
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>BMR Calculator</h1>
        <p className="muted">
          Estimate your Basal Metabolic Rate (BMR) and daily calorie needs using
          the Mifflin–St Jeor equation. Choose your units, enter your details,
          and see how many calories you burn at rest and with activity.
        </p>
      </header>

      <div className="calc-grid">
        {/* Inputs */}
        <section className="card">
          <h2 className="card-title">Your Details</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value)}>
                <option value="metric">Metric (cm / kg)</option>
                <option value="us">US (ft / in / lb)</option>
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

          <div className="row two">
            <div className="field">
              <label>Age (years)</label>
              <input
                type="number"
                min={10}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Weight ({units === "metric" ? "kg" : "lb"})</label>
              {units === "metric" ? (
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                />
              ) : (
                <input
                  type="number"
                  min={44}
                  max={660}
                  value={weightLb}
                  onChange={(e) => setWeightLb(Number(e.target.value))}
                />
              )}
            </div>
          </div>

          {units === "metric" ? (
            <div className="row one">
              <div className="field">
                <label>Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
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
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Height (in)</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <p className="small">
            BMR is the number of calories your body needs to maintain basic
            functions (breathing, circulation, etc.) at complete rest.
          </p>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Basal Metabolic Rate</div>
              <div className="kpi-value">
                {bmr ? `${bmr.toLocaleString()} kcal/day` : "-"}
              </div>
              <div className="kpi-sub">Mifflin–St Jeor equation</div>
            </div>
          </div>

          <h3 className="card-title" style={{ marginTop: 18 }}>
            Daily Calorie Needs
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Activity Level</th>
                <th>Factor</th>
                <th>Calories / day</th>
              </tr>
            </thead>
            <tbody>
              {tdee.map((lvl) => (
                <tr key={lvl.id}>
                  <td>{lvl.label}</td>
                  <td>{lvl.factor.toFixed(3)}</td>
                  <td>
                    {lvl.calories
                      ? lvl.calories.toLocaleString() + " kcal"
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            To lose weight, many people eat below their maintenance calories.
            To gain weight or build muscle, they eat slightly above.
            Individual needs vary—use these values as a starting point and
            adjust based on progress.
          </p>
        </section>
      </div>
    </div>
  );
}
