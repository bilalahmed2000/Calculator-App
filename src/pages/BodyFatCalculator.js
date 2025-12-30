// src/pages/BodyFatCalculator.jsx
import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * U.S. Navy body fat formula
 * Men:   BF% = 86.010*log10(waist - neck) - 70.041*log10(height) + 36.76
 * Women: BF% = 163.205*log10(waist + hip - neck) - 97.684*log10(height) - 78.387
 * All inputs in inches. We convert metric → inches as needed.
 * ACE categories: https://www.acefitness.org/
 */

const IN_PER_CM = 1 / 2.54;
const LB_PER_KG = 2.20462262185;

function aceCategory(sex, bf) {
  if (!bf && bf !== 0) return "-";
  if (sex === "male") {
    if (bf < 2) return "Below essential";
    if (bf <= 5) return "Essential fat";
    if (bf <= 13) return "Athletes";
    if (bf <= 17) return "Fitness";
    if (bf <= 24) return "Acceptable";
    return "Obese";
  }
  // female
  if (bf < 10) return "Below essential";
  if (bf <= 13) return "Essential fat";
  if (bf <= 20) return "Athletes";
  if (bf <= 24) return "Fitness";
  if (bf <= 31) return "Acceptable";
  return "Obese";
}

export default function BodyFatCalculator() {
  const [units, setUnits] = useState("metric"); // 'metric' | 'us'
  const [sex, setSex] = useState("male"); // 'male' | 'female'
  const [age, setAge] = useState(30);

  // metric inputs
  const [heightCm, setHeightCm] = useState(175);
  const [neckCm, setNeckCm] = useState(38);
  const [waistCm, setWaistCm] = useState(82);
  const [hipCm, setHipCm] = useState(96); // used for female
  const [weightKg, setWeightKg] = useState(70);

  // us inputs
  const [heightIn, setHeightIn] = useState(69); // 5'9"
  const [neckIn, setNeckIn] = useState(15);
  const [waistIn, setWaistIn] = useState(32.3);
  const [hipIn, setHipIn] = useState(37.8);
  const [weightLb, setWeightLb] = useState(154);

  // Normalize to inches for formula
  const hIn = useMemo(
    () => (units === "metric" ? Number(heightCm || 0) * IN_PER_CM : Number(heightIn || 0)),
    [units, heightCm, heightIn]
  );
  const nIn = useMemo(
    () => (units === "metric" ? Number(neckCm || 0) * IN_PER_CM : Number(neckIn || 0)),
    [units, neckCm, neckIn]
  );
  const wIn = useMemo(
    () => (units === "metric" ? Number(waistCm || 0) * IN_PER_CM : Number(waistIn || 0)),
    [units, waistCm, waistIn]
  );
  const hipIN = useMemo(
    () => (units === "metric" ? Number(hipCm || 0) * IN_PER_CM : Number(hipIn || 0)),
    [units, hipCm, hipIn]
  );

  // Optional mass outputs
  const weightKG = useMemo(
    () => (units === "metric" ? Number(weightKg || 0) : Number(weightLb || 0) / LB_PER_KG),
    [units, weightKg, weightLb]
  );

  const bodyFatPct = useMemo(() => {
    const height = hIn;
    const neck = nIn;
    const waist = wIn;
    const hip = hipIN;

    if (!height || !neck || !waist || height <= 0 || neck <= 0 || waist <= 0) return 0;

    // Guard invalid geometry
    if (sex === "male" && waist <= neck) return 0;
    if (sex === "female" && waist + hip <= neck) return 0;

    const log10 = (x) => Math.log(x) / Math.LN10;
    let bf;
    if (sex === "male") {
      bf = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76;
    } else {
      bf = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387;
    }
    // clamp to sensible range 2–60
    return Math.max(0, Math.min(60, Math.round(bf * 10) / 10));
  }, [sex, hIn, nIn, wIn, hipIN]);

  const category = useMemo(() => aceCategory(sex, bodyFatPct), [sex, bodyFatPct]);

  // fat / lean mass (optional if weight present)
  const fatMassKg = useMemo(() => (weightKG ? Math.round((weightKG * bodyFatPct) / 100) : 0), [
    weightKG,
    bodyFatPct,
  ]);
  const leanMassKg = useMemo(() => (weightKG ? Math.round(weightKG - fatMassKg) : 0), [weightKG, fatMassKg]);

  // pin on scale (2–45%)
  const pinLeft = useMemo(() => {
    const min = 2, max = 45;
    const v = bodyFatPct || min;
    const clamped = Math.max(min, Math.min(max, v));
    return ((clamped - min) / (max - min)) * 100;
  }, [bodyFatPct]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Body Fat Calculator</h1>
        <p className="muted">
          Estimate body fat percentage using the U.S. Navy method. Enter neck, waist, and height
          (plus hip for women). Choose US or metric units.
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
                <option value="metric">Metric (cm / kg)</option>
                <option value="us">US (in / lb)</option>
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
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Weight ({units === "metric" ? "kg" : "lb"}) (optional for mass breakdown)</label>
              {units === "metric" ? (
                <input type="number" min={20} max={300} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
              ) : (
                <input type="number" min={44} max={660} value={weightLb} onChange={(e) => setWeightLb(Number(e.target.value))} />
              )}
            </div>
          </div>

          {/* height/neck/waist/hip */}
          {units === "metric" ? (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (cm)</label>
                  <input type="number" min={120} max={230} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Neck (cm)</label>
                  <input type="number" min={20} max={60} value={neckCm} onChange={(e) => setNeckCm(Number(e.target.value))} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Waist (cm)</label>
                  <input type="number" min={40} max={200} value={waistCm} onChange={(e) => setWaistCm(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Hip (cm) {sex === "female" ? "(required for women)" : "(ignored for men)"}</label>
                  <input type="number" min={60} max={200} value={hipCm} onChange={(e) => setHipCm(Number(e.target.value))} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (in)</label>
                  <input type="number" min={48} max={90} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Neck (in)</label>
                  <input type="number" min={8} max={25} value={neckIn} onChange={(e) => setNeckIn(Number(e.target.value))} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Waist (in)</label>
                  <input type="number" min={18} max={80} value={waistIn} onChange={(e) => setWaistIn(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Hip (in) {sex === "female" ? "(required for women)" : "(ignored for men)"}</label>
                  <input type="number" min={20} max={80} value={hipIn} onChange={(e) => setHipIn(Number(e.target.value))} />
                </div>
              </div>
            </>
          )}
          <div className="small">
            Tips: measure at the **narrowest neck**, **widest waist** (at navel), and **widest hip** (women).
          </div>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Body Fat</div>
              <div className="kpi-value">{bodyFatPct ? `${bodyFatPct.toFixed(1)}%` : "-"}</div>
              <div className="kpi-sub">U.S. Navy method</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Category</div>
              <div className="kpi-value">{category}</div>
              <div className="kpi-sub">ACE standard</div>
            </div>
          </div>

          {/* Visual scale */}
          <div className="scale">
            <span /> {/* under/essential */}
            <span /> {/* athletes */}
            <span /> {/* fitness */}
            <span /> {/* acceptable */}
            <span /> {/* obese */}
          </div>
          <div className="pin" style={{ left: `${pinLeft}%` }} />
          <div className="small">Scale shown ~2–45% body fat.</div>

          {/* Mass breakdown (optional if weight provided) */}
          <h3 className="card-title" style={{ marginTop: 14 }}>Mass Breakdown</h3>
          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Fat Mass</div>
              <div className="kpi-value">{weightKG ? `${fatMassKg} kg` : "-"}</div>
              <div className="kpi-sub">{weightKG ? `${Math.round(fatMassKg * LB_PER_KG)} lb` : "—"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Lean Mass</div>
              <div className="kpi-value">{weightKG ? `${leanMassKg} kg` : "-"}</div>
              <div className="kpi-sub">{weightKG ? `${Math.round(leanMassKg * LB_PER_KG)} lb` : "—"}</div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>ACE Category</th>
                <th>Men</th>
                <th>Women</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Essential fat</td><td>2–5%</td><td>10–13%</td></tr>
              <tr><td>Athletes</td><td>6–13%</td><td>14–20%</td></tr>
              <tr><td>Fitness</td><td>14–17%</td><td>21–24%</td></tr>
              <tr><td>Acceptable</td><td>18–24%</td><td>25–31%</td></tr>
              <tr><td>Obese</td><td>≥ 25%</td><td>≥ 32%</td></tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            This method estimates body fat from circumferences and height. Results may differ from
            DEXA, hydrostatic weighing, or calipers. Use consistent measuring technique for best comparisons.
          </p>
        </section>
      </div>
    </div>
  );
}
