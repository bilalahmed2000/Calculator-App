import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d=4) => isFinite(v) && v !== null ? (Math.round(v*10**d)/10**d).toString() : "—";
const fmtSI = (v) => {
  if (!isFinite(v) || v === null) return "—";
  if (v >= 1e9)  return (v/1e9).toFixed(4)  + " G";
  if (v >= 1e6)  return (v/1e6).toFixed(4)  + " M";
  if (v >= 1e3)  return (v/1e3).toFixed(4)  + " k";
  if (v >= 1)    return v.toFixed(4);
  if (v >= 1e-3) return (v*1e3).toFixed(4)  + " m";
  if (v >= 1e-6) return (v*1e6).toFixed(4)  + " μ";
  return v.toExponential(4);
};

const SOLVE_OPTIONS = [
  { label:"Voltage (V) — given I and R",  solve:"V",  inputs:["I","R"] },
  { label:"Current (I) — given V and R",  solve:"I",  inputs:["V","R"] },
  { label:"Resistance (R) — given V and I",solve:"R", inputs:["V","I"] },
  { label:"Power (P) — given V and I",    solve:"P",  inputs:["V","I"] },
  { label:"Power (P) — given V and R",    solve:"P2", inputs:["V","R"] },
  { label:"Power (P) — given I and R",    solve:"P3", inputs:["I","R"] },
];

const LABELS = { V:"Voltage (V)", I:"Current (A)", R:"Resistance (Ω)", P:"Power (W)" };

export default function OhmsLawCalculator() {
  const [mode, setMode] = useState(0);
  const [vals, setVals] = useState({ V:"12", I:"2", R:"6", P:"24" });

  const opt = SOLVE_OPTIONS[mode];

  const result = useMemo(() => {
    const v = parseFloat(vals.V), i = parseFloat(vals.I), r = parseFloat(vals.R);
    switch (opt.solve) {
      case "V":  if (isNaN(i)||isNaN(r)||r<0) return null; return { label:"Voltage",    unit:"V",  val: i*r,      all:{ V:i*r,  I:i,     R:r,      P:i*r*i } };
      case "I":  if (isNaN(v)||isNaN(r)||r<=0) return null; return { label:"Current",    unit:"A",  val: v/r,      all:{ V:v,    I:v/r,   R:r,      P:v*v/r } };
      case "R":  if (isNaN(v)||isNaN(i)||i===0) return null; return { label:"Resistance", unit:"Ω",  val: v/i,      all:{ V:v,    I:i,     R:v/i,    P:v*i   } };
      case "P":  if (isNaN(v)||isNaN(i)) return null;        return { label:"Power",      unit:"W",  val: v*i,      all:{ V:v,    I:i,     R:i?v/i:null, P:v*i } };
      case "P2": if (isNaN(v)||isNaN(r)||r<=0) return null;  return { label:"Power",      unit:"W",  val: v*v/r,    all:{ V:v,    I:v/r,   R:r,      P:v*v/r } };
      case "P3": if (isNaN(i)||isNaN(r)||r<0) return null;   return { label:"Power",      unit:"W",  val: i*i*r,    all:{ V:i*r,  I:i,     R:r,      P:i*i*r } };
      default: return null;
    }
  }, [mode, vals, opt.solve]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Ohm's Law Calculator</h1>
        <p className="muted">Calculate voltage, current, resistance, and power using Ohm's Law (V = IR) and the power formula (P = VI).</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Solve For</h2>
          <div className="row"><div className="field"><label>Calculate</label>
            <select value={mode} onChange={e => setMode(parseInt(e.target.value))}>
              {SOLVE_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
          </div></div>
          <div className="row two">
            {opt.inputs.map(k => (
              <div key={k} className="field">
                <label>{LABELS[k]}</label>
                <input type="number" value={vals[k]} onChange={e => setVals(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          {result && (
            <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>{result.label}</div>
              <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5", fontFamily:"monospace" }}>{fmtSI(result.val)} {result.unit}</div>
            </div>
          )}
          <h3 className="card-title" style={{ marginTop:18 }}>Formulas</h3>
          <table className="table">
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Voltage</td><td style={{ fontFamily:"monospace" }}>V = I × R</td></tr>
              <tr><td>Current</td><td style={{ fontFamily:"monospace" }}>I = V / R</td></tr>
              <tr><td>Resistance</td><td style={{ fontFamily:"monospace" }}>R = V / I</td></tr>
              <tr><td>Power (1)</td><td style={{ fontFamily:"monospace" }}>P = V × I</td></tr>
              <tr><td>Power (2)</td><td style={{ fontFamily:"monospace" }}>P = V² / R</td></tr>
              <tr><td>Power (3)</td><td style={{ fontFamily:"monospace" }}>P = I² × R</td></tr>
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2 className="card-title">All Values</h2>
          {result ? (
            <>
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-label">Voltage (V)</div><div className="kpi-value">{fmtSI(result.all.V)} V</div></div>
                <div className="kpi"><div className="kpi-label">Current (I)</div><div className="kpi-value">{fmtSI(result.all.I)} A</div></div>
                <div className="kpi"><div className="kpi-label">Resistance (R)</div><div className="kpi-value">{result.all.R !== null ? fmtSI(result.all.R)+" Ω" : "—"}</div></div>
                <div className="kpi"><div className="kpi-label">Power (P)</div><div className="kpi-value">{fmtSI(result.all.P)} W</div></div>
              </div>
              <table className="table" style={{ marginTop:14 }}>
                <thead><tr><th>Quantity</th><th>Value</th></tr></thead>
                <tbody>
                  <tr style={{ background:"#f0eeff" }}><td><strong>Voltage (V)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmtSI(result.all.V)} V</td></tr>
                  <tr style={{ background:"#f0eeff" }}><td><strong>Current (I)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmtSI(result.all.I)} A</td></tr>
                  <tr style={{ background:"#f0eeff" }}><td><strong>Resistance (R)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{result.all.R !== null ? fmtSI(result.all.R)+" Ω" : "—"}</td></tr>
                  <tr style={{ background:"#f0eeff" }}><td><strong>Power (P)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmtSI(result.all.P)} W</td></tr>
                  <tr><td>Power (kW)</td><td style={{ fontFamily:"monospace" }}>{fmt(result.all.P/1000)} kW</td></tr>
                  <tr><td>Energy (kWh/hr)</td><td style={{ fontFamily:"monospace" }}>{fmt(result.all.P/1000)} kWh</td></tr>
                </tbody>
              </table>
            </>
          ) : <p className="small">Enter values to calculate.</p>}
        </section>
      </div>
    </div>
  );
}
