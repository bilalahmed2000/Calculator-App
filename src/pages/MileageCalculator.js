import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

// IRS standard mileage rates (2024)
const IRS_RATES = [
  { year: 2024, business: 0.67, medical: 0.21, charity: 0.14 },
  { year: 2023, business: 0.655, medical: 0.22, charity: 0.14 },
  { year: 2022, business: 0.585, medical: 0.18, charity: 0.14 },
];

export default function MileageCalculator() {
  const [tab, setTab] = useState("reimbursement");
  // Reimbursement
  const [miles,    setMiles]    = useState("1000");
  const [rateType, setRateType] = useState("business");
  const [customRate,setCustomRate]=useState("");
  const [year,     setYear]     = useState(0);
  // Distance
  const [solve,   setSolve]   = useState("distance");
  const [speed,   setSpeed]   = useState("60");
  const [time,    setTime]    = useState("2");
  const [distVal, setDistVal] = useState("120");
  const [speedU,  setSpeedU]  = useState("mph");

  const irsRow = IRS_RATES[year];

  const reimbResult = useMemo(() => {
    const m = parseFloat(miles) || 0;
    const r = customRate !== "" ? parseFloat(customRate) : irsRow[rateType];
    if (m <= 0 || !isFinite(r)) return null;
    return { miles: m, rate: r, total: m * r };
  }, [miles, rateType, customRate, year]);

  const distResult = useMemo(() => {
    const s = parseFloat(speed), t = parseFloat(time), d = parseFloat(distVal);
    const toMph = speedU === "mph" ? 1 : 0.621371;
    switch (solve) {
      case "distance": if (isNaN(s)||isNaN(t)) return null; return { dist: s*toMph*t, speed: s*toMph, time: t };
      case "time":     if (isNaN(d)||isNaN(s)||s===0) return null; return { dist: d, speed: s*toMph, time: d/(s*toMph) };
      case "speed":    if (isNaN(d)||isNaN(t)||t===0) return null; return { dist: d, speed: d/t, time: t };
      default: return null;
    }
  }, [solve, speed, time, distVal, speedU]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mileage Calculator</h1>
        <p className="muted">Calculate mileage reimbursement using IRS rates, or solve for distance, time, and speed.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "reimbursement" ? " active" : ""}`} onClick={() => setTab("reimbursement")}>Reimbursement</button>
            <button className={`tab-btn${tab === "distance" ? " active" : ""}`} onClick={() => setTab("distance")}>Distance / Time / Speed</button>
          </div>

          {tab === "reimbursement" && <>
            <div className="row two" style={{ marginTop: 12 }}>
              <div className="field"><label>Miles Driven</label>
                <input type="number" min="0" step="1" value={miles} onChange={e => setMiles(e.target.value)} /></div>
              <div className="field"><label>Rate Year</label>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
                  {IRS_RATES.map((r, i) => <option key={i} value={i}>{r.year}</option>)}
                </select>
              </div>
            </div>
            <div className="row two">
              <div className="field"><label>Purpose</label>
                <select value={rateType} onChange={e => setRateType(e.target.value)}>
                  <option value="business">Business ({irsRow.business.toFixed(3)} ¢/mi)</option>
                  <option value="medical">Medical/Moving ({irsRow.medical.toFixed(3)} ¢/mi)</option>
                  <option value="charity">Charity ({irsRow.charity.toFixed(3)} ¢/mi)</option>
                </select>
              </div>
              <div className="field"><label>Custom Rate ($/mi, optional)</label>
                <input type="number" min="0" step="0.001" placeholder="Leave blank for IRS rate" value={customRate} onChange={e => setCustomRate(e.target.value)} /></div>
            </div>
            {reimbResult && (
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi"><div className="kpi-label">Miles</div><div className="kpi-value">{fmt(reimbResult.miles, 0)}</div></div>
                <div className="kpi"><div className="kpi-label">Rate</div><div className="kpi-value">${reimbResult.rate.toFixed(3)}/mi</div></div>
                <div className="kpi"><div className="kpi-label">Reimbursement</div><div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt(reimbResult.total)}</div></div>
              </div>
            )}
          </>}

          {tab === "distance" && <>
            <div className="row two" style={{ marginTop: 12 }}>
              <div className="field"><label>Solve for</label>
                <select value={solve} onChange={e => setSolve(e.target.value)}>
                  <option value="distance">Distance</option>
                  <option value="time">Time (hours)</option>
                  <option value="speed">Speed</option>
                </select>
              </div>
              <div className="field"><label>Speed Unit</label>
                <select value={speedU} onChange={e => setSpeedU(e.target.value)}>
                  <option value="mph">mph</option>
                  <option value="kph">km/h</option>
                </select>
              </div>
            </div>
            {solve !== "speed" && <div className="row two">
              <div className="field"><label>Speed ({speedU})</label>
                <input type="number" min="0" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
            </div>}
            {solve !== "time" && <div className="row two">
              <div className="field"><label>Time (hours)</label>
                <input type="number" min="0" step="0.5" value={time} onChange={e => setTime(e.target.value)} /></div>
            </div>}
            {solve !== "distance" && <div className="row two">
              <div className="field"><label>Distance (miles)</label>
                <input type="number" min="0" value={distVal} onChange={e => setDistVal(e.target.value)} /></div>
            </div>}
            {distResult && (
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi"><div className="kpi-label">Distance</div><div className="kpi-value">{fmt(distResult.dist, 1)} mi</div></div>
                <div className="kpi"><div className="kpi-label">Speed</div><div className="kpi-value">{fmt(distResult.speed, 1)} mph</div></div>
                <div className="kpi"><div className="kpi-label">Time</div><div className="kpi-value">{fmt(distResult.time, 2)} hrs</div></div>
              </div>
            )}
          </>}
        </section>

        <section className="card">
          <h2 className="card-title">IRS Mileage Rates</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Year</th><th>Business</th><th>Medical</th><th>Charity</th></tr></thead>
            <tbody>
              {IRS_RATES.map(r => (
                <tr key={r.year}>
                  <td style={{ fontWeight: 700 }}>{r.year}</td>
                  <td style={{ fontFamily: "monospace" }}>${r.business.toFixed(3)}</td>
                  <td style={{ fontFamily: "monospace" }}>${r.medical.toFixed(3)}</td>
                  <td style={{ fontFamily: "monospace" }}>${r.charity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="card-title">Reimbursement Examples</h3>
          <table className="table">
            <thead><tr><th>Miles</th><th>Business (2024)</th></tr></thead>
            <tbody>
              {[100,250,500,1000,2500,5000,10000].map(m => (
                <tr key={m}><td style={{ fontFamily: "monospace" }}>{m.toLocaleString()}</td><td style={{ fontFamily: "monospace", color: "#4f46e5", fontWeight: 600 }}>${(m * 0.67).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
