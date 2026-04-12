import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=4) => isFinite(v)&&v!==null ? (Math.round(v*10**d)/10**d).toString() : "—";

const VOL_UNITS = [
  { label:"Liters (L)",       factor:1 },
  { label:"Milliliters (mL)", factor:0.001 },
  { label:"Cubic cm (cm³)",   factor:0.001 },
];
const MASS_UNITS = [
  { label:"Grams (g)",      factor:1 },
  { label:"Milligrams (mg)",factor:0.001 },
  { label:"Kilograms (kg)", factor:1000 },
];

export default function MolarityCalculator() {
  const [tab, setTab] = useState("molarity");

  // Molarity: C = n/V
  const [moles,   setMoles]   = useState("0.5");
  const [vol,     setVol]     = useState("1");
  const [volUnit, setVolUnit] = useState(0);

  // Moles from mass: n = m/MW
  const [mass,    setMass]    = useState("18");
  const [massUnit,setMassUnit]= useState(0);
  const [mw,      setMw]      = useState("18.015");

  // Dilution: C1V1 = C2V2
  const [c1, setC1] = useState("1"); const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("0.1");

  const molarityResult = useMemo(() => {
    const n = parseFloat(moles), v = parseFloat(vol) * VOL_UNITS[volUnit].factor;
    if (isNaN(n)||isNaN(v)||v<=0) return null;
    const C = n / v;
    return { C, n, v, mmol: n * 1000 };
  }, [moles, vol, volUnit]);

  const molesResult = useMemo(() => {
    const m = parseFloat(mass) * MASS_UNITS[massUnit].factor;
    const mwv = parseFloat(mw);
    if (isNaN(m)||isNaN(mwv)||mwv<=0) return null;
    const n = m / mwv;
    return { n, m, mwv };
  }, [mass, massUnit, mw]);

  const dilutionResult = useMemo(() => {
    const C1=parseFloat(c1), V1=parseFloat(v1), C2=parseFloat(c2);
    if (isNaN(C1)||isNaN(V1)||isNaN(C2)||C2<=0) return null;
    const V2 = C1 * V1 / C2;
    return { V2, added: V2 - V1 };
  }, [c1, v1, c2]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Molarity Calculator</h1>
        <p className="muted">Calculate solution molarity (C = n/V), convert mass to moles, and solve dilution problems using C₁V₁ = C₂V₂.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="molarity"?"active":""}`} onClick={()=>setTab("molarity")}>Molarity (C = n/V)</button>
            <button className={`tab-btn${tab==="moles"?"active":""}`} onClick={()=>setTab("moles")}>Mass → Moles</button>
            <button className={`tab-btn${tab==="dilution"?"active":""}`} onClick={()=>setTab("dilution")}>Dilution (C₁V₁=C₂V₂)</button>
          </div>

          {tab === "molarity" && (
            <>
              <p className="small">Molarity (C) = moles of solute (n) / volume of solution (V)</p>
              <div className="row two">
                <div className="field"><label>Moles of Solute (mol)</label><input type="number" min="0" step="0.01" value={moles} onChange={e=>setMoles(e.target.value)} /></div>
                <div className="field"><label>Volume of Solution</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" min="0" value={vol} onChange={e=>setVol(e.target.value)} style={{ flex:1 }} />
                    <select value={volUnit} onChange={e=>setVolUnit(parseInt(e.target.value))} style={{ width:110 }}>{VOL_UNITS.map((u,i)=><option key={i} value={i}>{u.label}</option>)}</select>
                  </div>
                </div>
              </div>
              {molarityResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Molarity</div>
                  <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>{fmt(molarityResult.C, 4)} <span style={{ fontSize:18 }}>mol/L (M)</span></div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>{fmt(molarityResult.mmol, 2)} mmol/L = {fmt(molarityResult.mmol,2)} mM</div>
                </div>
              )}
            </>
          )}

          {tab === "moles" && (
            <>
              <p className="small">n = mass / molar mass (MW). Find MW using the Molecular Weight Calculator.</p>
              <div className="row two">
                <div className="field"><label>Mass</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" min="0" value={mass} onChange={e=>setMass(e.target.value)} style={{ flex:1 }} />
                    <select value={massUnit} onChange={e=>setMassUnit(parseInt(e.target.value))} style={{ width:120 }}>{MASS_UNITS.map((u,i)=><option key={i} value={i}>{u.label}</option>)}</select>
                  </div>
                </div>
                <div className="field"><label>Molar Mass / MW (g/mol)</label><input type="number" min="0" step="0.001" value={mw} onChange={e=>setMw(e.target.value)} /></div>
              </div>
              {molesResult && (
                <div className="kpi-grid" style={{ marginTop:14 }}>
                  <div className="kpi"><div className="kpi-label">Moles (mol)</div><div className="kpi-value">{fmt(molesResult.n,6)}</div></div>
                  <div className="kpi"><div className="kpi-label">Millimoles (mmol)</div><div className="kpi-value">{fmt(molesResult.n*1000,4)}</div></div>
                  <div className="kpi"><div className="kpi-label">Molecules</div><div className="kpi-value" style={{ fontSize:14 }}>{(molesResult.n*6.022e23).toExponential(3)}</div></div>
                </div>
              )}
            </>
          )}

          {tab === "dilution" && (
            <>
              <p className="small">C₁V₁ = C₂V₂ — Find the final volume needed to achieve the target concentration.</p>
              <div className="row two">
                <div className="field"><label>Stock Concentration C₁ (M)</label><input type="number" min="0" step="0.01" value={c1} onChange={e=>setC1(e.target.value)} /></div>
                <div className="field"><label>Stock Volume V₁ (mL)</label><input type="number" min="0" value={v1} onChange={e=>setV1(e.target.value)} /></div>
              </div>
              <div className="row"><div className="field"><label>Target Concentration C₂ (M)</label><input type="number" min="0" step="0.001" value={c2} onChange={e=>setC2(e.target.value)} /></div></div>
              {dilutionResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Final Volume V₂</div>
                  <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>{fmt(dilutionResult.V2, 2)} <span style={{ fontSize:18 }}>mL</span></div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>Add {fmt(dilutionResult.added, 2)} mL of solvent to the {v1} mL stock solution.</div>
                </div>
              )}
            </>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Results</h2>
          {tab==="molarity" && molarityResult && (
            <table className="table">
              <thead><tr><th>Quantity</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Moles (n)</td><td style={{ fontFamily:"monospace" }}>{moles} mol</td></tr>
                <tr><td>Volume (V)</td><td style={{ fontFamily:"monospace" }}>{vol} {VOL_UNITS[volUnit].label}</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Molarity (C)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(molarityResult.C,4)} M</td></tr>
                <tr><td>Millimolar (mM)</td><td style={{ fontFamily:"monospace" }}>{fmt(molarityResult.mmol,4)} mM</td></tr>
              </tbody>
            </table>
          )}
          {tab==="moles" && molesResult && (
            <table className="table">
              <thead><tr><th>Quantity</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Mass</td><td style={{ fontFamily:"monospace" }}>{mass} {MASS_UNITS[massUnit].label}</td></tr>
                <tr><td>Molar Mass (MW)</td><td style={{ fontFamily:"monospace" }}>{mw} g/mol</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Moles</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(molesResult.n,6)} mol</td></tr>
                <tr><td>Molecules (×10²³)</td><td style={{ fontFamily:"monospace" }}>{(molesResult.n*6.022e23/1e23).toFixed(4)} × 10²³</td></tr>
              </tbody>
            </table>
          )}
          {tab==="dilution" && dilutionResult && (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Stock (C₁)</td><td style={{ fontFamily:"monospace" }}>{c1} M</td></tr>
                <tr><td>Stock volume (V₁)</td><td style={{ fontFamily:"monospace" }}>{v1} mL</td></tr>
                <tr><td>Target (C₂)</td><td style={{ fontFamily:"monospace" }}>{c2} M</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Final volume (V₂)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(dilutionResult.V2,2)} mL</td></tr>
                <tr><td>Solvent to add</td><td style={{ fontFamily:"monospace", fontWeight:700 }}>{fmt(dilutionResult.added,2)} mL</td></tr>
              </tbody>
            </table>
          )}
          {!molarityResult && !molesResult && !dilutionResult && <p className="small">Enter values to calculate.</p>}
          <h3 className="card-title" style={{ marginTop:16 }}>Key Formulas</h3>
          <table className="table">
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Molarity</td><td style={{ fontFamily:"monospace",fontSize:12 }}>C = n / V</td></tr>
              <tr><td>Moles</td><td style={{ fontFamily:"monospace",fontSize:12 }}>n = mass / MW</td></tr>
              <tr><td>Dilution</td><td style={{ fontFamily:"monospace",fontSize:12 }}>C₁V₁ = C₂V₂</td></tr>
              <tr><td>Avogadro</td><td style={{ fontFamily:"monospace",fontSize:12 }}>N = n × 6.022×10²³</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
