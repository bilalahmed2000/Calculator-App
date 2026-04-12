import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toString() : "—";

const MASS_UNITS  = [{l:"kg",f:1},{l:"g",f:0.001},{l:"mg",f:1e-6},{l:"lb",f:0.453592},{l:"oz",f:0.02835},{l:"metric ton",f:1000},{l:"slug",f:14.5939}];
const FORCE_UNITS = [{l:"N",f:1},{l:"kN",f:1000},{l:"lbf",f:4.44822},{l:"dyne",f:1e-5},{l:"kgf",f:9.80665}];
const ACCEL_UNITS = [{l:"m/s²",f:1},{l:"ft/s²",f:0.3048},{l:"g (9.81 m/s²)",f:9.80665},{l:"Gal (cm/s²)",f:0.01}];

export default function MassCalculator() {
  const [solve, setSolve] = useState("mass");
  const [mass,  setMass]  = useState("10"); const [massU,  setMassU]  = useState(0);
  const [force, setForce] = useState("98.1");const [forceU, setForceU] = useState(0);
  const [accel, setAccel] = useState("9.81");const [accelU, setAccelU] = useState(0);

  const result = useMemo(() => {
    const mKg  = parseFloat(mass)  * MASS_UNITS[massU].factor;
    const fN   = parseFloat(force) * FORCE_UNITS[forceU].factor;
    const aMs2 = parseFloat(accel) * ACCEL_UNITS[accelU].factor;
    switch(solve) {
      case "mass":  if (isNaN(fN)||isNaN(aMs2)||aMs2===0) return null; return { mass_kg: fN/aMs2, force_N: fN,    accel_ms2: aMs2 };
      case "force": if (isNaN(mKg)||isNaN(aMs2)) return null;          return { mass_kg: mKg,    force_N: mKg*aMs2, accel_ms2: aMs2 };
      case "accel": if (isNaN(fN)||isNaN(mKg)||mKg===0) return null;   return { mass_kg: mKg,    force_N: fN,    accel_ms2: fN/mKg };
      default: return null;
    }
  }, [solve, mass, massU, force, forceU, accel, accelU]);

  const ROW = (label, units, selU, setSelU, val, setVal, isSolved) => (
    <div className="row two">
      <div className="field" style={{ opacity: isSolved ? 0.5 : 1 }}>
        <label>{label} {isSolved && <span style={{ fontSize:11, color:"#4f46e5", fontWeight:700 }}>(calculated)</span>}</label>
        <div style={{ display:"flex", gap:6 }}>
          <input type="number" value={val} onChange={e=>setVal(e.target.value)} readOnly={isSolved} style={{ flex:1, background:isSolved?"#f0eeff":undefined }} />
          <select value={selU} onChange={e=>setSelU(parseInt(e.target.value))} style={{ width:130 }}>{units.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mass Calculator</h1>
        <p className="muted">Calculate mass, force, or acceleration using Newton's Second Law: F = m × a.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Solve For</h2>
          <div className="row"><div className="field"><label>Calculate</label>
            <select value={solve} onChange={e=>setSolve(e.target.value)}>
              <option value="mass">Mass (m = F / a)</option>
              <option value="force">Force (F = m × a)</option>
              <option value="accel">Acceleration (a = F / m)</option>
            </select>
          </div></div>

          {solve !== "mass"  && ROW("Mass",         MASS_UNITS,  massU,  setMassU,  mass,  setMass,  false)}
          {solve !== "force" && ROW("Force",         FORCE_UNITS, forceU, setForceU, force, setForce, false)}
          {solve !== "accel" && ROW("Acceleration",  ACCEL_UNITS, accelU, setAccelU, accel, setAccel, false)}

          {result && (
            <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>
                {solve === "mass" ? "Mass" : solve === "force" ? "Force" : "Acceleration"}
              </div>
              {solve === "mass"  && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(result.mass_kg, 4)} kg &nbsp; <span style={{ fontSize:18 }}>{fmt(result.mass_kg/0.453592,4)} lb</span></div>}
              {solve === "force" && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(result.force_N, 4)} N &nbsp; <span style={{ fontSize:18 }}>{fmt(result.force_N/4.44822,4)} lbf</span></div>}
              {solve === "accel" && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(result.accel_ms2, 4)} m/s² &nbsp; <span style={{ fontSize:18 }}>{fmt(result.accel_ms2/9.80665,4)} g</span></div>}
            </div>
          )}

          <h3 className="card-title" style={{ marginTop:18 }}>Newton's Second Law</h3>
          <table className="table">
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Force</td><td style={{ fontFamily:"monospace" }}>F = m × a</td></tr>
              <tr><td>Mass</td><td style={{ fontFamily:"monospace" }}>m = F / a</td></tr>
              <tr><td>Acceleration</td><td style={{ fontFamily:"monospace" }}>a = F / m</td></tr>
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2 className="card-title">All Unit Results</h2>
          {result ? (
            <>
              <h3 className="card-title">Mass</h3>
              <table className="table" style={{ marginBottom:10 }}>
                {MASS_UNITS.map((u,i)=><tr key={i} style={i===0?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===0?800:400, color:i===0?"#4f46e5":undefined }}>{fmt(result.mass_kg/u.factor,5)}</td></tr>)}
              </table>
              <h3 className="card-title">Force</h3>
              <table className="table" style={{ marginBottom:10 }}>
                {FORCE_UNITS.map((u,i)=><tr key={i} style={i===0?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===0?800:400, color:i===0?"#4f46e5":undefined }}>{fmt(result.force_N/u.factor,5)}</td></tr>)}
              </table>
              <h3 className="card-title">Acceleration</h3>
              <table className="table">
                {ACCEL_UNITS.map((u,i)=><tr key={i} style={i===0?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===0?800:400, color:i===0?"#4f46e5":undefined }}>{fmt(result.accel_ms2/u.factor,5)}</td></tr>)}
              </table>
            </>
          ) : <p className="small">Enter values to calculate.</p>}
        </section>
      </div>
    </div>
  );
}
