import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toString() : "—";

const MASS_UNITS = [{l:"kg",f:1},{l:"g",f:0.001},{l:"lb",f:0.453592},{l:"oz",f:0.02835},{l:"metric ton",f:1000},{l:"slug",f:14.5939}];

const PLANETS = [
  { name:"Mercury",    g:3.7 },
  { name:"Venus",      g:8.87 },
  { name:"Earth",      g:9.807 },
  { name:"Moon",       g:1.62 },
  { name:"Mars",       g:3.72 },
  { name:"Jupiter",    g:24.79 },
  { name:"Saturn",     g:10.44 },
  { name:"Uranus",     g:8.87 },
  { name:"Neptune",    g:11.15 },
  { name:"Pluto",      g:0.62 },
  { name:"Sun",        g:274 },
];

const WEIGHT_UNITS = [{l:"N",f:1},{l:"kN",f:1000},{l:"lbf",f:4.44822},{l:"kgf",f:9.80665},{l:"dyne",f:1e-5}];

export default function WeightCalculator() {
  const [tab, setTab] = useState("planets");
  const [mass,   setMass]   = useState("70");
  const [massU,  setMassU]  = useState(0); // kg
  const [planet, setPlanet] = useState(2); // Earth
  const [weightU,setWeightU]= useState(0); // N

  // Weight ↔ Mass converter
  const [cvMode, setCvMode] = useState("toWeight");
  const [cvMass, setCvMass] = useState("70");
  const [cvMassU,setCvMassU]= useState(0);
  const [cvWt,   setCvWt]   = useState("686.49");
  const [cvWtU,  setCvWtU]  = useState(0);
  const [cvG,    setCvG]    = useState("9.807");

  const planetResult = useMemo(() => {
    const mKg = parseFloat(mass) * MASS_UNITS[massU].factor;
    if (isNaN(mKg)||mKg<=0) return null;
    return PLANETS.map(p => ({ ...p, weight_N: mKg * p.g, weight_lbf: mKg * p.g / 4.44822 }));
  }, [mass, massU]);

  const cvResult = useMemo(() => {
    const gv = parseFloat(cvG);
    if (isNaN(gv)||gv<=0) return null;
    if (cvMode === "toWeight") {
      const mKg = parseFloat(cvMass) * MASS_UNITS[cvMassU].factor;
      if (isNaN(mKg)) return null;
      const wN = mKg * gv;
      return { wN, mKg };
    } else {
      const wN = parseFloat(cvWt) * WEIGHT_UNITS[cvWtU].factor;
      if (isNaN(wN)) return null;
      const mKg = wN / gv;
      return { wN, mKg };
    }
  }, [cvMode, cvMass, cvMassU, cvWt, cvWtU, cvG]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Weight Calculator</h1>
        <p className="muted">Calculate your weight on different planets and celestial bodies, or convert between mass and weight using W = m × g.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="planets"?"active":""}`} onClick={()=>setTab("planets")}>Weight on Planets</button>
            <button className={`tab-btn${tab==="convert"?"active":""}`} onClick={()=>setTab("convert")}>Mass ↔ Weight</button>
          </div>

          {tab === "planets" && (
            <>
              <div className="row two">
                <div className="field"><label>Mass</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" min="0" value={mass} onChange={e=>setMass(e.target.value)} style={{ flex:1 }} />
                    <select value={massU} onChange={e=>setMassU(parseInt(e.target.value))} style={{ width:80 }}>{MASS_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                  </div>
                </div>
                <div className="field"><label>Show weight in</label>
                  <select value={weightU} onChange={e=>setWeightU(parseInt(e.target.value))}>
                    {WEIGHT_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}
                  </select>
                </div>
              </div>
              {planetResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Weight on Earth</div>
                  <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>{fmt(planetResult[2].weight_N / WEIGHT_UNITS[weightU].factor, 3)} {WEIGHT_UNITS[weightU].l}</div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>{fmt(planetResult[2].weight_lbf, 3)} lbf = {fmt(planetResult[2].weight_N/9.807, 3)} kgf</div>
                </div>
              )}
            </>
          )}

          {tab === "convert" && (
            <>
              <p className="small">W = m × g &nbsp;·&nbsp; W (weight in N), m (mass in kg), g (gravitational acceleration m/s²)</p>
              <div className="row"><div className="field"><label>Gravitational Acceleration g (m/s²)</label>
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" min="0" step="0.001" value={cvG} onChange={e=>setCvG(e.target.value)} style={{ flex:1 }} />
                  <select onChange={e=>setCvG(e.target.value)} style={{ width:120 }}>
                    {PLANETS.map(p=><option key={p.name} value={p.g}>{p.name} ({p.g})</option>)}
                  </select>
                </div>
              </div></div>
              <div className="row"><div className="field"><label>Direction</label>
                <select value={cvMode} onChange={e=>setCvMode(e.target.value)}>
                  <option value="toWeight">Mass → Weight</option>
                  <option value="toMass">Weight → Mass</option>
                </select>
              </div></div>
              {cvMode === "toWeight" && (
                <div className="row two"><div className="field"><label>Mass</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" min="0" value={cvMass} onChange={e=>setCvMass(e.target.value)} style={{ flex:1 }} />
                    <select value={cvMassU} onChange={e=>setCvMassU(parseInt(e.target.value))} style={{ width:80 }}>{MASS_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                  </div>
                </div></div>
              )}
              {cvMode === "toMass" && (
                <div className="row two"><div className="field"><label>Weight</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" min="0" value={cvWt} onChange={e=>setCvWt(e.target.value)} style={{ flex:1 }} />
                    <select value={cvWtU} onChange={e=>setCvWtU(parseInt(e.target.value))} style={{ width:80 }}>{WEIGHT_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                  </div>
                </div></div>
              )}
              {cvResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>
                    {cvMode === "toWeight" ? "Weight" : "Mass"}
                  </div>
                  {cvMode === "toWeight" && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(cvResult.wN, 4)} N &nbsp; <span style={{ fontSize:18 }}>{fmt(cvResult.wN/4.44822, 4)} lbf</span></div>}
                  {cvMode === "toMass"   && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(cvResult.mKg, 4)} kg &nbsp; <span style={{ fontSize:18 }}>{fmt(cvResult.mKg/0.453592, 4)} lb</span></div>}
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">{tab==="planets" ? "Weight Across Planets" : "Mass/Weight Conversions"}</h2>
          {tab === "planets" && planetResult ? (
            <table className="table">
              <thead><tr><th>Body</th><th>g (m/s²)</th><th>Weight ({WEIGHT_UNITS[weightU].l})</th><th>vs Earth</th></tr></thead>
              <tbody>
                {planetResult.map((p,i) => (
                  <tr key={p.name} style={i===2?{background:"#f0eeff"}:{}}>
                    <td style={{ fontWeight:i===2?800:400 }}>{p.name}</td>
                    <td style={{ fontFamily:"monospace" }}>{p.g}</td>
                    <td style={{ fontFamily:"monospace", fontWeight:i===2?800:400, color:i===2?"#4f46e5":undefined }}>{fmt(p.weight_N/WEIGHT_UNITS[weightU].factor, 2)}</td>
                    <td style={{ fontFamily:"monospace" }}>{fmt(p.g/9.807, 3)}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab==="convert" && cvResult ? (
            <>
              <h3 className="card-title">Mass equivalents</h3>
              <table className="table" style={{ marginBottom:10 }}>
                {MASS_UNITS.map((u,i)=><tr key={i} style={i===0?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace" }}>{fmt(cvResult.mKg/u.factor,5)}</td></tr>)}
              </table>
              <h3 className="card-title">Weight equivalents</h3>
              <table className="table">
                {WEIGHT_UNITS.map((u,i)=><tr key={i} style={i===0?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace" }}>{fmt(cvResult.wN/u.factor,5)}</td></tr>)}
              </table>
            </>
          ) : <p className="small">Enter a mass to see results.</p>}
        </section>
      </div>
    </div>
  );
}
