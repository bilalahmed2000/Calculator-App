import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toLocaleString("en-US",{maximumSignificantDigits:10}) : "—";

// 1 mechanical HP = 550 ft·lbf/s = 745.69987 W
const HP_TO_W = 745.69987;

export default function HorsepowerCalculator() {
  const [tab, setTab] = useState("convert");
  // Convert tab
  const [cvFrom, setCvFrom] = useState("hp_mech");
  const [cvVal,  setCvVal]  = useState("100");
  // Torque-RPM tab
  const [torque, setTorque]   = useState("300");
  const [torqUnit, setTorqUnit] = useState("ftlb");
  const [rpm,    setRpm]      = useState("3000");

  const conversions = useMemo(() => {
    const v = parseFloat(cvVal);
    if (isNaN(v) || v < 0) return null;
    let watts;
    switch(cvFrom) {
      case "hp_mech":   watts = v * 745.69987; break;
      case "hp_metric": watts = v * 735.49875; break;
      case "hp_elec":   watts = v * 746;       break;
      case "kw":        watts = v * 1000;       break;
      case "w":         watts = v;              break;
      case "ftlbfs":    watts = v * 1.3558179;  break;
      default:          watts = v * HP_TO_W;
    }
    return {
      hp_mech:   watts / 745.69987,
      hp_metric: watts / 735.49875,
      hp_elec:   watts / 746,
      kw:        watts / 1000,
      w:         watts,
      ftlbfs:    watts / 1.3558179,
      btu_hr:    watts * 3.41214,
    };
  }, [cvVal, cvFrom]);

  const torqueResult = useMemo(() => {
    const T = parseFloat(torque), N = parseFloat(rpm);
    if (isNaN(T) || isNaN(N) || N <= 0 || T <= 0) return null;
    // HP = Torque(ft·lbf) × RPM / 5252
    const Tftlb = torqUnit === "ftlb" ? T : torqUnit === "inlb" ? T/12 : T * 0.737562; // Nm → ft·lb
    const hp = Tftlb * N / 5252;
    const kw = hp * HP_TO_W / 1000;
    const w  = hp * HP_TO_W;
    return { hp, kw, w, Tftlb, Tnm: Tftlb / 0.737562 };
  }, [torque, torqUnit, rpm]);

  const UNITS = [
    { key:"hp_mech",   label:"Horsepower – Mechanical (hp)" },
    { key:"hp_metric", label:"Horsepower – Metric (PS)" },
    { key:"hp_elec",   label:"Horsepower – Electrical (hp)" },
    { key:"kw",        label:"Kilowatts (kW)" },
    { key:"w",         label:"Watts (W)" },
    { key:"ftlbfs",    label:"ft·lbf/s" },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Horsepower Calculator</h1>
        <p className="muted">Convert between mechanical, metric, and electrical horsepower, watts, and kilowatts. Calculate horsepower from torque and RPM.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="convert"?"active":""}`} onClick={()=>setTab("convert")}>Unit Converter</button>
            <button className={`tab-btn${tab==="torque"?"active":""}`} onClick={()=>setTab("torque")}>Torque & RPM</button>
          </div>

          {tab === "convert" && (
            <>
              <div className="row two">
                <div className="field"><label>From</label>
                  <select value={cvFrom} onChange={e=>setCvFrom(e.target.value)}>
                    {UNITS.map(u=><option key={u.key} value={u.key}>{u.label}</option>)}
                  </select>
                </div>
                <div className="field"><label>Value</label>
                  <input type="number" min="0" value={cvVal} onChange={e=>setCvVal(e.target.value)} />
                </div>
              </div>
              {conversions && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Equivalents</div>
                  <div style={{ fontSize:28, fontWeight:900, color:"#4f46e5" }}>{fmt(conversions.hp_mech, 4)} HP (mech)</div>
                  <div style={{ fontSize:14, color:"#6b7a9e", marginTop:4 }}>{fmt(conversions.kw, 4)} kW &nbsp;·&nbsp; {fmt(conversions.w, 2)} W</div>
                </div>
              )}
            </>
          )}

          {tab === "torque" && (
            <>
              <p className="small">Formula: HP = Torque (ft·lbf) × RPM / 5252</p>
              <div className="row two">
                <div className="field"><label style={{ display:"flex", justifyContent:"space-between" }}>Torque
                  <select value={torqUnit} onChange={e=>setTorqUnit(e.target.value)} style={{ fontSize:12, padding:"2px 4px" }}>
                    <option value="ftlb">ft·lbf</option>
                    <option value="inlb">in·lbf</option>
                    <option value="nm">N·m</option>
                  </select></label>
                  <input type="number" min="0" value={torque} onChange={e=>setTorque(e.target.value)} />
                </div>
                <div className="field"><label>Engine Speed (RPM)</label>
                  <input type="number" min="0" value={rpm} onChange={e=>setRpm(e.target.value)} />
                </div>
              </div>
              {torqueResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Horsepower</div>
                  <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>{fmt(torqueResult.hp, 2)} HP</div>
                  <div style={{ fontSize:14, color:"#6b7a9e", marginTop:4 }}>{fmt(torqueResult.kw, 3)} kW &nbsp;·&nbsp; {fmt(torqueResult.w, 1)} W</div>
                </div>
              )}
            </>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Conversion Table</h2>
          {conversions ? (
            <table className="table">
              <thead><tr><th>Unit</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background:"#f0eeff" }}><td><strong>HP – Mechanical</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(conversions.hp_mech,4)}</td></tr>
                <tr><td>HP – Metric (PS)</td><td style={{ fontFamily:"monospace" }}>{fmt(conversions.hp_metric,4)}</td></tr>
                <tr><td>HP – Electrical</td><td style={{ fontFamily:"monospace" }}>{fmt(conversions.hp_elec,4)}</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Kilowatts (kW)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(conversions.kw,4)}</td></tr>
                <tr><td>Watts (W)</td><td style={{ fontFamily:"monospace" }}>{fmt(conversions.w,2)}</td></tr>
                <tr><td>ft·lbf/s</td><td style={{ fontFamily:"monospace" }}>{fmt(conversions.ftlbfs,2)}</td></tr>
                <tr><td>BTU/hr</td><td style={{ fontFamily:"monospace" }}>{fmt(conversions.btu_hr,2)}</td></tr>
              </tbody>
            </table>
          ) : <p className="small">Enter a value to convert.</p>}
          <h3 className="card-title" style={{ marginTop:16 }}>HP Reference</h3>
          <table className="table">
            <thead><tr><th>Type</th><th>Watts</th><th>Definition</th></tr></thead>
            <tbody>
              <tr><td>Mechanical HP</td><td style={{ fontFamily:"monospace" }}>745.70 W</td><td style={{ fontSize:12 }}>550 ft·lbf/s</td></tr>
              <tr><td>Metric HP (PS)</td><td style={{ fontFamily:"monospace" }}>735.50 W</td><td style={{ fontSize:12 }}>75 kgf·m/s</td></tr>
              <tr><td>Electrical HP</td><td style={{ fontFamily:"monospace" }}>746 W</td><td style={{ fontSize:12 }}>Exact by definition</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
