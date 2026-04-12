import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toString() : "—";

const DIST_UNITS = [{l:"m",f:1},{l:"km",f:1000},{l:"miles",f:1609.34},{l:"ft",f:0.3048},{l:"yards",f:0.9144},{l:"nautical mi",f:1852}];
const TIME_UNITS = [{l:"seconds",f:1},{l:"minutes",f:60},{l:"hours",f:3600},{l:"days",f:86400}];
const SPEED_UNITS= [{l:"m/s",f:1},{l:"km/h",f:1/3.6},{l:"mph",f:0.44704},{l:"ft/s",f:0.3048},{l:"knots",f:0.514444}];

function fmtTime(sec) {
  const d = Math.floor(sec/86400), h = Math.floor(sec%86400/3600), m = Math.floor(sec%3600/60), s = Math.floor(sec%60);
  const parts = [];
  if(d) parts.push(`${d}d`); if(h) parts.push(`${h}h`); if(m) parts.push(`${m}m`);
  if(s || parts.length===0) parts.push(`${s}s`);
  return parts.join(" ");
}

export default function SpeedCalculator() {
  const [solve, setSolve] = useState("speed");
  const [dist,   setDist]   = useState("100"); const [distU,  setDistU]  = useState(1); // km
  const [time,   setTime]   = useState("1");   const [timeU,  setTimeU]  = useState(2); // hours
  const [speed,  setSpeed]  = useState("100"); const [speedU, setSpeedU] = useState(1); // km/h

  const result = useMemo(() => {
    const dM  = parseFloat(dist)  * DIST_UNITS[distU].factor;
    const tS  = parseFloat(time)  * TIME_UNITS[timeU].factor;
    const sMs = parseFloat(speed) * SPEED_UNITS[speedU].factor;
    switch(solve) {
      case "speed":    if (isNaN(dM)||isNaN(tS)||tS<=0) return null; return { speed_ms: dM/tS,  dist_m: dM,   time_s: tS };
      case "distance": if (isNaN(sMs)||isNaN(tS)||tS<=0||sMs<=0) return null; return { speed_ms: sMs, dist_m: sMs*tS, time_s: tS };
      case "time":     if (isNaN(dM)||isNaN(sMs)||sMs<=0) return null; return { speed_ms: sMs, dist_m: dM,   time_s: dM/sMs };
      default: return null;
    }
  }, [solve, dist, distU, time, timeU, speed, speedU]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Speed Calculator</h1>
        <p className="muted">Calculate speed, distance, or time using the formula: Speed = Distance / Time. Supports multiple units.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Solve For</h2>
          <div className="row"><div className="field"><label>Calculate</label>
            <select value={solve} onChange={e=>setSolve(e.target.value)}>
              <option value="speed">Speed (v = d / t)</option>
              <option value="distance">Distance (d = v × t)</option>
              <option value="time">Time (t = d / v)</option>
            </select>
          </div></div>

          {solve !== "distance" && (
            <div className="row two"><div className="field"><label>Distance</label>
              <div style={{ display:"flex", gap:6 }}>
                <input type="number" min="0" value={dist} onChange={e=>setDist(e.target.value)} style={{ flex:1 }} />
                <select value={distU} onChange={e=>setDistU(parseInt(e.target.value))} style={{ width:100 }}>{DIST_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
              </div>
            </div></div>
          )}
          {solve !== "time" && (
            <div className="row two"><div className="field"><label>Time</label>
              <div style={{ display:"flex", gap:6 }}>
                <input type="number" min="0" value={time} onChange={e=>setTime(e.target.value)} style={{ flex:1 }} />
                <select value={timeU} onChange={e=>setTimeU(parseInt(e.target.value))} style={{ width:100 }}>{TIME_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
              </div>
            </div></div>
          )}
          {solve !== "speed" && (
            <div className="row two"><div className="field"><label>Speed</label>
              <div style={{ display:"flex", gap:6 }}>
                <input type="number" min="0" value={speed} onChange={e=>setSpeed(e.target.value)} style={{ flex:1 }} />
                <select value={speedU} onChange={e=>setSpeedU(parseInt(e.target.value))} style={{ width:100 }}>{SPEED_UNITS.map((u,i)=><option key={i} value={i}>{u.l}</option>)}</select>
              </div>
            </div></div>
          )}

          {result && (
            <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>
                {solve === "speed" ? "Speed" : solve === "distance" ? "Distance" : "Time"}
              </div>
              {solve === "speed"    && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(result.speed_ms * 3.6, 4)} km/h &nbsp; <span style={{ fontSize:18 }}>{fmt(result.speed_ms * 2.23694, 4)} mph</span></div>}
              {solve === "distance" && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmt(result.dist_m / 1000, 4)} km &nbsp; <span style={{ fontSize:18 }}>{fmt(result.dist_m / 1609.34, 4)} miles</span></div>}
              {solve === "time"     && <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5" }}>{fmtTime(result.time_s)} &nbsp; <span style={{ fontSize:18 }}>({fmt(result.time_s/3600, 4)} hrs)</span></div>}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">All Unit Results</h2>
          {result ? (
            <>
              <h3 className="card-title">Speed</h3>
              <table className="table" style={{ marginBottom:10 }}>
                <thead><tr><th>Unit</th><th>Value</th></tr></thead>
                <tbody>
                  {SPEED_UNITS.map((u,i)=>(
                    <tr key={i} style={i===1?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===1?800:400, color:i===1?"#4f46e5":undefined }}>{fmt(result.speed_ms/u.factor, 4)}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 className="card-title">Distance</h3>
              <table className="table" style={{ marginBottom:10 }}>
                <thead><tr><th>Unit</th><th>Value</th></tr></thead>
                <tbody>
                  {DIST_UNITS.map((u,i)=>(
                    <tr key={i} style={i===1?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===1?800:400, color:i===1?"#4f46e5":undefined }}>{fmt(result.dist_m/u.factor, 4)}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 className="card-title">Time</h3>
              <table className="table">
                <thead><tr><th>Unit</th><th>Value</th></tr></thead>
                <tbody>
                  {TIME_UNITS.map((u,i)=>(
                    <tr key={i} style={i===2?{background:"#f0eeff"}:{}}><td>{u.l}</td><td style={{ fontFamily:"monospace", fontWeight:i===2?800:400, color:i===2?"#4f46e5":undefined }}>{fmt(result.time_s/u.factor, 4)}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : <p className="small">Enter values to calculate.</p>}

          <h3 className="card-title" style={{ marginTop:16 }}>Speed Reference</h3>
          <table className="table">
            <thead><tr><th>Object</th><th>Speed</th></tr></thead>
            <tbody>
              {[["Walking","5 km/h"],["Cycling","15 km/h"],["City car","50 km/h"],["Highway car","100 km/h"],["Bullet train","320 km/h"],["Speed of sound","1234 km/h"],["Commercial jet","900 km/h"],["Speed of light","1.08×10⁹ km/h"]].map(([o,s])=>(
                <tr key={o}><td style={{ fontSize:13 }}>{o}</td><td style={{ fontFamily:"monospace" }}>{s}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
