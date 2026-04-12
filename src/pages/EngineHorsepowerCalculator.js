import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d=2) => isFinite(v) ? (Math.round(v*10**d)/10**d).toLocaleString("en-US") : "—";

export default function EngineHorsepowerCalculator() {
  const [tab, setTab] = useState("trap");

  // Trap speed method
  const [trapWeight, setTrapWeight] = useState("3000");
  const [trapSpeed,  setTrapSpeed]  = useState("100");
  const [trapUnit,   setTrapUnit]   = useState("mph");

  // ET (elapsed time) method
  const [etWeight, setEtWeight] = useState("3000");
  const [et,       setEt]       = useState("12.5");

  // Dyno correction
  const [dynoBhp,    setDynoBhp]    = useState("300");
  const [altitude,   setAltitude]   = useState("0");
  const [tempF,      setTempF]      = useState("77");
  const [humidity,   setHumidity]   = useState("50");

  // Brake-specific fuel consumption
  const [bsfc,       setBsfc]       = useState("0.5");
  const [fuelRate,   setFuelRate]   = useState("30");

  const trapResult = useMemo(() => {
    const w = parseFloat(trapWeight), s = parseFloat(trapSpeed);
    if (isNaN(w)||isNaN(s)||w<=0||s<=0) return null;
    // Convert mph to m/s if needed; formula uses mph
    const mph = trapUnit === "kmh" ? s * 0.621371 : s;
    const hp = w * Math.pow(mph / 234, 3);
    return { hp, mph };
  }, [trapWeight, trapSpeed, trapUnit]);

  const etResult = useMemo(() => {
    const w = parseFloat(etWeight), t = parseFloat(et);
    if (isNaN(w)||isNaN(t)||w<=0||t<=0) return null;
    const hp = w * Math.pow(1 / t * 6.29, 3) * 0.2304;
    // Simpler: hp = w / (et/6.29)^3 — from Hale's formula
    const hp2 = w * Math.pow(6.29/t, 3);
    return { hp: hp2 };
  }, [etWeight, et]);

  const dynoResult = useMemo(() => {
    const bhp = parseFloat(dynoBhp), alt = parseFloat(altitude), t = parseFloat(tempF), rh = parseFloat(humidity);
    if (isNaN(bhp)||isNaN(alt)||isNaN(t)||isNaN(rh)) return null;
    // SAE J1349 correction factor (simplified)
    const Psat = Math.exp(23.8 - 5218 / ((t-32)*5/9+273.15)); // rough saturation pressure
    const PdryKPa = 101.325 * Math.exp(-alt * 0.0000000226318) - rh/100 * Psat / 10;
    const Tkelvin = (t-32)*5/9 + 273.15;
    const cf = Math.pow(990/PdryKPa, 0.5) * Math.pow(Tkelvin/298.15, 0.5);
    const corrected = bhp * cf;
    return { corrected, cf };
  }, [dynoBhp, altitude, tempF, humidity]);

  const bsfcResult = useMemo(() => {
    const b = parseFloat(bsfc), f = parseFloat(fuelRate);
    if (isNaN(b)||isNaN(f)||b<=0||f<=0) return null;
    // HP = fuel_flow_lb_per_hr / BSFC
    const hp = f / b;
    return { hp };
  }, [bsfc, fuelRate]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Engine Horsepower Calculator</h1>
        <p className="muted">Estimate engine horsepower using quarter-mile trap speed, elapsed time, dyno correction factors, or fuel consumption (BSFC).</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Method</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="trap"?"active":""}`} onClick={()=>setTab("trap")}>Trap Speed</button>
            <button className={`tab-btn${tab==="et"?"active":""}`} onClick={()=>setTab("et")}>Elapsed Time</button>
            <button className={`tab-btn${tab==="dyno"?"active":""}`} onClick={()=>setTab("dyno")}>Dyno Correction</button>
            <button className={`tab-btn${tab==="bsfc"?"active":""}`} onClick={()=>setTab("bsfc")}>BSFC</button>
          </div>

          {tab === "trap" && (
            <>
              <p className="small">Uses quarter-mile trap speed to estimate peak horsepower. Formula: HP = Weight × (Trap Speed / 234)³</p>
              <div className="row two">
                <div className="field"><label>Vehicle Weight (lbs)</label><input type="number" min="0" value={trapWeight} onChange={e=>setTrapWeight(e.target.value)} /></div>
                <div className="field"><label style={{ display:"flex", justifyContent:"space-between" }}>Trap Speed
                  <select value={trapUnit} onChange={e=>setTrapUnit(e.target.value)} style={{ fontSize:12, padding:"2px 4px" }}>
                    <option value="mph">mph</option><option value="kmh">km/h</option>
                  </select></label>
                  <input type="number" min="0" value={trapSpeed} onChange={e=>setTrapSpeed(e.target.value)} />
                </div>
              </div>
              {trapResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Estimated Horsepower</div>
                  <div style={{ fontSize:42, fontWeight:900, color:"#4f46e5" }}>{fmt(trapResult.hp)} HP</div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>{fmt(trapResult.hp * 0.7457, 2)} kW</div>
                </div>
              )}
            </>
          )}

          {tab === "et" && (
            <>
              <p className="small">Uses quarter-mile elapsed time. Formula: HP = Weight × (6.29 / ET)³</p>
              <div className="row two">
                <div className="field"><label>Vehicle Weight (lbs)</label><input type="number" min="0" value={etWeight} onChange={e=>setEtWeight(e.target.value)} /></div>
                <div className="field"><label>Elapsed Time – ET (seconds)</label><input type="number" min="0" step="0.01" value={et} onChange={e=>setEt(e.target.value)} /></div>
              </div>
              {etResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Estimated Horsepower</div>
                  <div style={{ fontSize:42, fontWeight:900, color:"#4f46e5" }}>{fmt(etResult.hp)} HP</div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>{fmt(etResult.hp * 0.7457, 2)} kW</div>
                </div>
              )}
            </>
          )}

          {tab === "dyno" && (
            <>
              <p className="small">Corrects dyno-measured BHP to standard SAE J1349 conditions (sea level, 77°F, dry air).</p>
              <div className="row two">
                <div className="field"><label>Dyno BHP (uncorrected)</label><input type="number" min="0" value={dynoBhp} onChange={e=>setDynoBhp(e.target.value)} /></div>
                <div className="field"><label>Altitude (ft)</label><input type="number" min="0" value={altitude} onChange={e=>setAltitude(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Air Temperature (°F)</label><input type="number" value={tempF} onChange={e=>setTempF(e.target.value)} /></div>
                <div className="field"><label>Relative Humidity (%)</label><input type="number" min="0" max="100" value={humidity} onChange={e=>setHumidity(e.target.value)} /></div>
              </div>
              {dynoResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Corrected BHP</div>
                  <div style={{ fontSize:42, fontWeight:900, color:"#4f46e5" }}>{fmt(dynoResult.corrected)} HP</div>
                  <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>Correction factor: {dynoResult.cf.toFixed(4)}</div>
                </div>
              )}
            </>
          )}

          {tab === "bsfc" && (
            <>
              <p className="small">Estimate HP from fuel flow rate and Brake-Specific Fuel Consumption (BSFC). Formula: HP = Fuel Flow (lb/hr) / BSFC</p>
              <div className="row two">
                <div className="field"><label>BSFC (lb/hp·hr)</label><input type="number" min="0" step="0.01" value={bsfc} onChange={e=>setBsfc(e.target.value)} /><span className="small">Typical: 0.40–0.55 gasoline, 0.35–0.45 diesel</span></div>
                <div className="field"><label>Fuel Flow Rate (lb/hr)</label><input type="number" min="0" step="0.1" value={fuelRate} onChange={e=>setFuelRate(e.target.value)} /></div>
              </div>
              {bsfcResult && (
                <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Estimated Horsepower</div>
                  <div style={{ fontSize:42, fontWeight:900, color:"#4f46e5" }}>{fmt(bsfcResult.hp)} HP</div>
                </div>
              )}
            </>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Results Summary</h2>
          <table className="table">
            <thead><tr><th>Method</th><th>HP</th><th>kW</th></tr></thead>
            <tbody>
              <tr style={tab==="trap"?{background:"#f0eeff"}:{}}><td>Trap Speed</td><td style={{ fontFamily:"monospace", fontWeight: tab==="trap"?800:400, color:tab==="trap"?"#4f46e5":undefined }}>{trapResult ? fmt(trapResult.hp) : "—"}</td><td style={{ fontFamily:"monospace" }}>{trapResult ? fmt(trapResult.hp*0.7457,2) : "—"}</td></tr>
              <tr style={tab==="et"?{background:"#f0eeff"}:{}}><td>Elapsed Time</td><td style={{ fontFamily:"monospace", fontWeight: tab==="et"?800:400, color:tab==="et"?"#4f46e5":undefined }}>{etResult ? fmt(etResult.hp) : "—"}</td><td style={{ fontFamily:"monospace" }}>{etResult ? fmt(etResult.hp*0.7457,2) : "—"}</td></tr>
              <tr style={tab==="dyno"?{background:"#f0eeff"}:{}}><td>Dyno (corrected)</td><td style={{ fontFamily:"monospace", fontWeight: tab==="dyno"?800:400, color:tab==="dyno"?"#4f46e5":undefined }}>{dynoResult ? fmt(dynoResult.corrected) : "—"}</td><td style={{ fontFamily:"monospace" }}>{dynoResult ? fmt(dynoResult.corrected*0.7457,2) : "—"}</td></tr>
              <tr style={tab==="bsfc"?{background:"#f0eeff"}:{}}><td>BSFC</td><td style={{ fontFamily:"monospace", fontWeight: tab==="bsfc"?800:400, color:tab==="bsfc"?"#4f46e5":undefined }}>{bsfcResult ? fmt(bsfcResult.hp) : "—"}</td><td style={{ fontFamily:"monospace" }}>{bsfcResult ? fmt(bsfcResult.hp*0.7457,2) : "—"}</td></tr>
            </tbody>
          </table>
          <h3 className="card-title" style={{ marginTop:16 }}>HP → kW Reference</h3>
          <table className="table">
            <thead><tr><th>HP</th><th>kW</th></tr></thead>
            <tbody>
              {[100,150,200,250,300,350,400,500,600,700,800,1000].map(hp=>(
                <tr key={hp}><td style={{ fontFamily:"monospace" }}>{hp}</td><td style={{ fontFamily:"monospace" }}>{fmt(hp*0.74570,2)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
