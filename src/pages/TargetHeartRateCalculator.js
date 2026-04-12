import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* Heart rate zones — using Karvonen formula (HRR-based) and % max HR */
const ZONES = [
  { name: "Zone 1 — Very Light",   minPct: 50, maxPct: 60, color: "#a3e635", desc: "Warm-up, recovery, fat burning" },
  { name: "Zone 2 — Light",        minPct: 60, maxPct: 70, color: "#facc15", desc: "Fat burning, aerobic base, endurance" },
  { name: "Zone 3 — Moderate",     minPct: 70, maxPct: 80, color: "#fb923c", desc: "Aerobic fitness, cardiovascular improvement" },
  { name: "Zone 4 — Hard",         minPct: 80, maxPct: 90, color: "#f87171", desc: "Anaerobic threshold, speed & performance" },
  { name: "Zone 5 — Maximum",      minPct: 90, maxPct: 100, color: "#e879f9", desc: "Max effort, sprint, VO₂ max training" },
];

// Max HR formulas
const MAXHR_FORMULAS = [
  { name: "Tanaka (standard)",      fn: (age) => 208 - 0.7 * age },
  { name: "Fox (traditional 220−age)", fn: (age) => 220 - age },
  { name: "Gulati (women)",         fn: (age) => 206 - 0.88 * age },
];

export default function TargetHeartRateCalculator() {
  const [age, setAge]           = useState(30);
  const [restingHR, setRestingHR] = useState(65);
  const [sex, setSex]           = useState("male");
  const [formulaIdx, setFormulaIdx] = useState(0);
  const [method, setMethod]     = useState("karvonen"); // "karvonen" | "maxpct"

  const maxHR = useMemo(() => {
    const idx = sex === "female" ? 2 : formulaIdx;
    return Math.round(MAXHR_FORMULAS[idx].fn(Number(age)));
  }, [age, sex, formulaIdx]);

  const hrr = useMemo(() => Math.max(0, maxHR - Number(restingHR)), [maxHR, restingHR]);

  // Karvonen: Target HR = ((Max HR − Resting HR) × intensity%) + Resting HR
  // % Max HR: Target HR = Max HR × intensity%
  const zones = useMemo(() => {
    return ZONES.map(z => {
      let minHR, maxHR_val;
      if (method === "karvonen") {
        minHR    = Math.round(hrr * (z.minPct / 100) + Number(restingHR));
        maxHR_val = Math.round(hrr * (z.maxPct / 100) + Number(restingHR));
      } else {
        minHR    = Math.round(maxHR * (z.minPct / 100));
        maxHR_val = Math.round(maxHR * (z.maxPct / 100));
      }
      return { ...z, minHR, maxHR: maxHR_val };
    });
  }, [method, maxHR, hrr, restingHR]);

  // Standard target zone: 50–85% of max HR (AHA recommendation)
  const ahaMin = useMemo(() => Math.round(maxHR * 0.5), [maxHR]);
  const ahaMax = useMemo(() => Math.round(maxHR * 0.85), [maxHR]);

  const pinLeft = useMemo(() => {
    const rhr = Number(restingHR);
    const min = rhr, max = maxHR;
    const range = max - min;
    if (!range) return 50;
    return Math.round(((ahaMin - min) / range) * 100);
  }, [restingHR, maxHR, ahaMin]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Target Heart Rate Calculator</h1>
        <p className="muted">
          Calculate your maximum heart rate and target heart rate zones for exercise.
          Use either the Karvonen (heart rate reserve) or % Max HR method.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Information</h2>

          <div className="row two">
            <div className="field">
              <label>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label>Age (years)</label>
              <input type="number" min={10} max={90} value={age}
                onChange={e => setAge(e.target.value)} />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Resting Heart Rate (bpm)</label>
              <input type="number" min={30} max={120} value={restingHR}
                onChange={e => setRestingHR(e.target.value)} />
            </div>
            {sex === "male" && (
              <div className="field">
                <label>Max HR Formula</label>
                <select value={formulaIdx} onChange={e => setFormulaIdx(Number(e.target.value))}>
                  {MAXHR_FORMULAS.slice(0, 2).map((f, i) => <option key={i} value={i}>{f.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="row">
            <div className="field">
              <label>Zone Calculation Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="karvonen">Karvonen (Heart Rate Reserve) — more precise</option>
                <option value="maxpct">% of Max Heart Rate — simpler</option>
              </select>
            </div>
          </div>

          <p className="small" style={{ marginTop: 8 }}>
            Measure your resting HR in the morning before getting out of bed for best accuracy.
            Average resting HR: men 60–70 bpm, women 62–72 bpm.
          </p>

          <div className="kpi-grid" style={{ marginTop: 14 }}>
            <div className="kpi">
              <div className="kpi-label">Max Heart Rate</div>
              <div className="kpi-value">{maxHR}</div>
              <div className="kpi-sub">bpm ({sex === "female" ? "Gulati" : MAXHR_FORMULAS[formulaIdx].name})</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Heart Rate Reserve</div>
              <div className="kpi-value">{hrr}</div>
              <div className="kpi-sub">Max HR − Resting HR</div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Heart Rate Zones</h2>

          <div style={{ marginBottom: 14, padding: "12px 16px", background: "#f0eeff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
              AHA Target Heart Rate Zone (50–85%)
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#312e81" }}>
              {ahaMin} – {ahaMax} <span style={{ fontSize: 14, fontWeight: 600 }}>bpm</span>
            </div>
          </div>

          {/* Visual zone bar */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", gap: 2 }}>
              {ZONES.map(z => (
                <div key={z.name} style={{ flex: 1, background: z.color, opacity: 0.85 }} title={z.name} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {ZONES.map(z => (
                <div key={z.name} style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", flex: 1 }}>
                  {z.minPct}%
                </div>
              ))}
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>% Max HR</th>
                <th>BPM Range</th>
                <th>Goal</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: z.color, marginRight: 6 }} />
                    <strong style={{ fontSize: 12 }}>{z.name}</strong>
                  </td>
                  <td>{z.minPct}–{z.maxPct}%</td>
                  <td><strong>{z.minHR}–{z.maxHR}</strong></td>
                  <td style={{ fontSize: 11, color: "#6b7a9e" }}>{z.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            {method === "karvonen"
              ? "Karvonen formula: Target HR = (Max HR − Resting HR) × intensity + Resting HR. Accounts for fitness level."
              : "% Max HR method: Target HR = Max HR × intensity%. Simple but doesn't account for fitness."}
          </p>
        </section>
      </div>
    </div>
  );
}
