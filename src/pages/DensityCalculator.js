import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toString() : "—";

const MASS_UNITS   = [{l:"kg",f:1},{l:"g",f:0.001},{l:"mg",f:1e-6},{l:"lb",f:0.453592},{l:"oz",f:0.02835}];
const VOL_UNITS    = [{l:"m³",f:1},{l:"cm³",f:1e-6},{l:"mL",f:1e-6},{l:"L",f:0.001},{l:"ft³",f:0.0283168},{l:"in³",f:1.6387e-5}];
const DENSITY_UNITS= [{l:"kg/m³",f:1},{l:"g/cm³",f:1000},{l:"g/mL",f:1000},{l:"kg/L",f:1000},{l:"lb/ft³",f:16.0185},{l:"lb/in³",f:27679.9}];

const COMMON_DENSITIES = [
  ["Water (4°C)",       1.000], ["Seawater",           1.025],
  ["Ice",               0.917], ["Air (20°C)",         0.00120],
  ["Aluminum",          2.710], ["Iron / Steel",       7.874],
  ["Copper",            8.960], ["Gold",               19.32],
  ["Silver",            10.49], ["Lead",               11.34],
  ["Mercury",           13.53], ["Wood (oak)",         0.600],
  ["Concrete",          2.300], ["Glass",              2.500],
  ["Gasoline",          0.720], ["Ethanol",            0.789],
  ["Olive Oil",         0.900], ["Milk",               1.030],
];

export default function DensityCalculator() {
  const [solve, setSolve] = useState("density");
  const [mass,    setMass]    = useState("1"); const [massU,    setMassU]    = useState(1); // g
  const [vol,     setVol]     = useState("1"); const [volU,     setVolU]     = useState(2); // mL
  const [density, setDensity] = useState("1"); const [densityU, setDensityU] = useState(1); // g/cm³

  const result = useMemo(() => {
    const mKg  = parseFloat(mass)    * MASS_UNITS[massU].factor;
    const vM3  = parseFloat(vol)     * VOL_UNITS[volU].factor;
    const dKm3 = parseFloat(density) * DENSITY_UNITS[densityU].factor;

    switch(solve) {
      case "density": {
        if (isNaN(mKg)||isNaN(vM3)||vM3<=0) return null;
        const d = mKg / vM3; // kg/m³
        return { density_kgm3: d, mass_kg: mKg, vol_m3: vM3 };
      }
      case "mass": {
        if (isNaN(dKm3)||isNaN(vM3)||vM3<=0) return null;
        const m = dKm3 * vM3; // kg
        return { density_kgm3: dKm3, mass_kg: m, vol_m3: vM3 };
      }
      case "volume": {
        if (isNaN(mKg)||isNaN(dKm3)||dKm3<=0) return null;
        const v = mKg / dKm3; // m³
        return { density_kgm3: dKm3, mass_kg: mKg, vol_m3: v };
      }
      default: return null;
    }
  }, [solve, mass, massU, vol, volU, density, densityU]);

  const toUnit = (val_si, units, idx) => isFinite(val_si) ? fmt(val_si / units[idx].factor, 5) + " " + units[idx].l : "—";

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Density Calculator</h1>
        <p className="muted">Calculate density (ρ = m/V), or solve for mass or volume given any two of the three variables.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Solve For</h2>
          <div className="row"><div className="field"><label>Calculate</label>
            <select value={solve} onChange={e=>setSolve(e.target.value)}>
              <option value="density">Density (ρ = m / V)</option>
              <option value="mass">Mass (m = ρ × V)</option>
              <option value="volume">Volume (V = m / ρ)</option>
            </select>
          </div></div>

          {solve !== "density" && (
            <div className="row two">
              <div className="field"><label>Density</label>
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" min="0" value={density} onChange={e=>setDensity(e.target.value)} style={{ flex:1 }} />
                  <select value={densityU} onChange={e=>setDensityU(parseInt(e.target.value))} style={{ width:100 }}>{DENSITY_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                </div>
              </div>
            </div>
          )}
          {solve !== "mass" && (
            <div className="row two">
              <div className="field"><label>Mass</label>
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" min="0" value={mass} onChange={e=>setMass(e.target.value)} style={{ flex:1 }} />
                  <select value={massU} onChange={e=>setMassU(parseInt(e.target.value))} style={{ width:80 }}>{MASS_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                </div>
              </div>
            </div>
          )}
          {solve !== "volume" && (
            <div className="row two">
              <div className="field"><label>Volume</label>
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" min="0" value={vol} onChange={e=>setVol(e.target.value)} style={{ flex:1 }} />
                  <select value={volU} onChange={e=>setVolU(parseInt(e.target.value))} style={{ width:80 }}>{VOL_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>
                {solve === "density" ? "Density" : solve === "mass" ? "Mass" : "Volume"}
              </div>
              <div style={{ fontSize:30, fontWeight:900, color:"#4f46e5", fontFamily:"monospace" }}>
                {solve === "density" && `${fmt(result.density_kgm3/1000, 5)} g/cm³`}
                {solve === "mass"    && toUnit(result.mass_kg, MASS_UNITS, massU)}
                {solve === "volume"  && toUnit(result.vol_m3, VOL_UNITS, volU)}
              </div>
            </div>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Results (all units)</h2>
          {result ? (
            <>
              <table className="table" style={{ marginBottom:14 }}>
                <thead><tr><th>Quantity</th><th>Value</th></tr></thead>
                <tbody>
                  {DENSITY_UNITS.map((u,i)=>(
                    <tr key={i} style={i===1?{background:"#f0eeff"}:{}}><td>Density ({u.l})</td><td style={{ fontFamily:"monospace", fontWeight:i===1?800:400, color:i===1?"#4f46e5":undefined }}>{fmt(result.density_kgm3/u.factor, 6)}</td></tr>
                  ))}
                  <tr><td colSpan={2} style={{ background:"#f8f9ff", fontWeight:600, paddingTop:8 }}>Mass</td></tr>
                  {MASS_UNITS.map((u,i)=>(
                    <tr key={i}><td style={{ paddingLeft:16 }}>({u.l})</td><td style={{ fontFamily:"monospace" }}>{fmt(result.mass_kg/u.factor, 5)}</td></tr>
                  ))}
                  <tr><td colSpan={2} style={{ background:"#f8f9ff", fontWeight:600, paddingTop:8 }}>Volume</td></tr>
                  {VOL_UNITS.map((u,i)=>(
                    <tr key={i}><td style={{ paddingLeft:16 }}>({u.l})</td><td style={{ fontFamily:"monospace" }}>{fmt(result.vol_m3/u.factor, 5)}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : <p className="small">Enter values to calculate density.</p>}
          <h3 className="card-title" style={{ marginTop:16 }}>Common Densities (g/cm³)</h3>
          <table className="table">
            <thead><tr><th>Material</th><th>Density (g/cm³)</th></tr></thead>
            <tbody>
              {COMMON_DENSITIES.map(([name, d]) => (
                <tr key={name}><td style={{ fontSize:13 }}>{name}</td><td style={{ fontFamily:"monospace" }}>{d}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
