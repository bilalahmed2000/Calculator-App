import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// US Army Regulation 600-9 body fat percentage limits by age group
const ARMY_STANDARDS = {
  male: [
    { ageMin: 17, ageMax: 20, max: 20 },
    { ageMin: 21, ageMax: 27, max: 22 },
    { ageMin: 28, ageMax: 39, max: 24 },
    { ageMin: 40, ageMax: 999, max: 26 },
  ],
  female: [
    { ageMin: 17, ageMax: 20, max: 30 },
    { ageMin: 21, ageMax: 27, max: 32 },
    { ageMin: 28, ageMax: 39, max: 34 },
    { ageMin: 40, ageMax: 999, max: 36 },
  ],
};

function getMaxBF(sex, age) {
  const stds = ARMY_STANDARDS[sex];
  const a = Number(age);
  const found = stds.find(s => a >= s.ageMin && a <= s.ageMax);
  return found ? found.max : null;
}

// US Army formula (inputs in inches)
function calcArmyBF(sex, heightIn, neckIn, waistIn, hipIn) {
  const log10 = x => Math.log(x) / Math.LN10;
  if (sex === "male") {
    const diff = waistIn - neckIn;
    if (diff <= 0) return 0;
    return 86.010 * log10(diff) - 70.041 * log10(heightIn) + 36.76;
  } else {
    const sum = waistIn + hipIn - neckIn;
    if (sum <= 0) return 0;
    return 163.205 * log10(sum) - 97.684 * log10(heightIn) - 78.387;
  }
}

export default function ArmyBodyFatCalculator() {
  const [units, setUnits]   = useState("metric");
  const [sex, setSex]       = useState("male");
  const [age, setAge]       = useState(22);
  const [cm, setCm]         = useState(175);
  const [ft, setFt]         = useState(5);
  const [inch, setInch]     = useState(9);
  const [neckCm, setNeckCm] = useState(38);
  const [waistCm, setWaistCm] = useState(82);
  const [hipCm, setHipCm]   = useState(96);
  const [neckIn, setNeckIn] = useState(15);
  const [waistIn, setWaistIn] = useState(32);
  const [hipIn, setHipIn]   = useState(38);

  const heightIn = useMemo(() => {
    return units === "metric"
      ? Number(cm) / 2.54
      : Number(ft) * 12 + Number(inch);
  }, [units, cm, ft, inch]);

  const neckInch  = useMemo(() => units === "metric" ? Number(neckCm)  / 2.54 : Number(neckIn),  [units, neckCm, neckIn]);
  const waistInch = useMemo(() => units === "metric" ? Number(waistCm) / 2.54 : Number(waistIn), [units, waistCm, waistIn]);
  const hipInch   = useMemo(() => units === "metric" ? Number(hipCm)   / 2.54 : Number(hipIn),   [units, hipCm, hipIn]);

  const bf = useMemo(() => {
    const raw = calcArmyBF(sex, heightIn, neckInch, waistInch, hipInch);
    return Math.max(0, Math.min(60, Math.round(raw * 10) / 10));
  }, [sex, heightIn, neckInch, waistInch, hipInch]);

  const maxBF = useMemo(() => getMaxBF(sex, age), [sex, age]);
  const passes = useMemo(() => maxBF !== null && bf <= maxBF, [bf, maxBF]);

  const pinLeft = useMemo(() => {
    const min = 5, max = 40;
    return ((Math.max(min, Math.min(max, bf || min)) - min) / (max - min)) * 100;
  }, [bf]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Army Body Fat Calculator</h1>
        <p className="muted">
          Calculate body fat percentage using the U.S. Army (AR 600-9) method and check whether
          the result meets current Army body fat standards for your age group.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Measurements</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (cm)</option>
                <option value="us">US (inches)</option>
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

          <div className="row">
            <div className="field">
              <label>Age (years)</label>
              <input type="number" min={17} max={60} value={age}
                onChange={e => setAge(e.target.value)} />
            </div>
          </div>

          {units === "metric" ? (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (cm)</label>
                  <input type="number" min={140} max={220} value={cm}
                    onChange={e => setCm(e.target.value)} />
                </div>
                <div className="field">
                  <label>Neck (cm)</label>
                  <input type="number" min={25} max={60} value={neckCm}
                    onChange={e => setNeckCm(e.target.value)} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Waist (cm)</label>
                  <input type="number" min={50} max={180} value={waistCm}
                    onChange={e => setWaistCm(e.target.value)} />
                </div>
                {sex === "female" && (
                  <div className="field">
                    <label>Hips (cm)</label>
                    <input type="number" min={60} max={200} value={hipCm}
                      onChange={e => setHipCm(e.target.value)} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="row two">
                <div className="field">
                  <label>Height (ft)</label>
                  <input type="number" min={4} max={7} value={ft}
                    onChange={e => setFt(e.target.value)} />
                </div>
                <div className="field">
                  <label>Height (in)</label>
                  <input type="number" min={0} max={11} value={inch}
                    onChange={e => setInch(e.target.value)} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Neck (in)</label>
                  <input type="number" min={10} max={25} value={neckIn}
                    onChange={e => setNeckIn(e.target.value)} />
                </div>
                <div className="field">
                  <label>Waist (in)</label>
                  <input type="number" min={20} max={70} value={waistIn}
                    onChange={e => setWaistIn(e.target.value)} />
                </div>
              </div>
              {sex === "female" && (
                <div className="row">
                  <div className="field">
                    <label>Hips (in)</label>
                    <input type="number" min={25} max={80} value={hipIn}
                      onChange={e => setHipIn(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}
          <p className="small" style={{ marginTop: 8 }}>
            Measure neck circumference just below the larynx. Waist at the narrowest point (navel level).
            {sex === "female" && " Hips at the widest point."}
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Body Fat %</div>
              <div className="kpi-value">{bf ? `${bf}%` : "—"}</div>
              <div className="kpi-sub">Army (AR 600-9) method</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Army Standard</div>
              <div className="kpi-value" style={{ color: passes ? "#16a34a" : "#dc2626" }}>
                {maxBF !== null ? (passes ? "PASS" : "FAIL") : "—"}
              </div>
              <div className="kpi-sub">Max allowed: {maxBF !== null ? `${maxBF}%` : "—"}</div>
            </div>
          </div>

          <div className="scale">
            <span /><span /><span /><span /><span />
          </div>
          <div className="pin" style={{ left: `${pinLeft}%` }} />
          <div className="small">Scale shown: 5–40% body fat</div>

          {maxBF !== null && (
            <div style={{
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: 12,
              background: passes ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
              border: `1px solid ${passes ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
              color: passes ? "#15803d" : "#b91c1c",
              fontSize: 14,
              fontWeight: 700,
            }}>
              {passes
                ? `✓ Your body fat (${bf}%) is within the Army limit of ${maxBF}% for your age group.`
                : `✗ Your body fat (${bf}%) exceeds the Army limit of ${maxBF}% for your age group.`}
            </div>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Army Body Fat Standards (AR 600-9)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Age Group</th>
                <th>Male Max %</th>
                <th>Female Max %</th>
              </tr>
            </thead>
            <tbody>
              {ARMY_STANDARDS.male.map((s, i) => (
                <tr key={i} style={
                  Number(age) >= s.ageMin && Number(age) <= s.ageMax
                    ? { background: "#f0eeff" } : {}
                }>
                  <td>{s.ageMax === 999 ? `${s.ageMin}+` : `${s.ageMin}–${s.ageMax}`}</td>
                  <td>{s.max}%</td>
                  <td>{ARMY_STANDARDS.female[i].max}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            This uses the same circumference-based formula as the U.S. Army. Results may
            differ slightly from DEXA or hydrostatic methods.
          </p>
        </section>
      </div>
    </div>
  );
}
