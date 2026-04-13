import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 1) => isFinite(v) ? v.toFixed(d) : "—";

// NWS Wind Chill formula (valid for T ≤ 50°F and wind > 3 mph)
function windChill(T, V) {
  return 35.74 + 0.6215*T - 35.75*Math.pow(V, 0.16) + 0.4275*T*Math.pow(V, 0.16);
}

function getDanger(wc) {
  if (wc > 32)  return { label: "Cool",             color: "#3b82f6" };
  if (wc > 0)   return { label: "Cold",             color: "#2563eb" };
  if (wc > -20) return { label: "Very Cold",        color: "#7c3aed" };
  if (wc > -40) return { label: "Bitter Cold",      color: "#dc2626" };
  if (wc > -60) return { label: "Extreme Cold",     color: "#b91c1c" };
  return          { label: "Dangerous / Frostbite", color: "#7f1d1d" };
}

function frostbiteTime(wc) {
  if (wc > 0)    return "No risk";
  if (wc > -20)  return "> 30 min";
  if (wc > -40)  return "10–30 min";
  if (wc > -60)  return "5–10 min";
  return           "< 5 min";
}

export default function WindChillCalculator() {
  const [temp,  setTemp]  = useState("20");
  const [wind,  setWind]  = useState("20");
  const [tUnit, setTUnit] = useState("F");
  const [wUnit, setWUnit] = useState("mph");

  const result = useMemo(() => {
    let T = parseFloat(temp), V = parseFloat(wind);
    if (isNaN(T) || isNaN(V)) return null;
    if (tUnit === "C") T = T * 9/5 + 32;
    if (wUnit === "kph") V = V * 0.621371;
    if (wUnit === "ms")  V = V * 2.23694;
    if (T > 50 || V < 3) return { T, V, wc: null, danger: null };
    const wc  = windChill(T, V);
    const wcC = (wc - 32) * 5/9;
    return { T, V, wc, wcC, danger: getDanger(wc), frostbite: frostbiteTime(wc) };
  }, [temp, wind, tUnit, wUnit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Wind Chill Calculator</h1>
        <p className="muted">Calculate the "feels like" temperature using the NWS wind chill formula — valid for temperatures at or below 50°F and wind speeds above 3 mph.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Air Temperature</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" value={temp} onChange={e => setTemp(e.target.value)} style={{ flex: 1 }} />
                <select value={tUnit} onChange={e => setTUnit(e.target.value)} style={{ width: 70 }}>
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Wind Speed</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" min="0" value={wind} onChange={e => setWind(e.target.value)} style={{ flex: 1 }} />
                <select value={wUnit} onChange={e => setWUnit(e.target.value)} style={{ width: 80 }}>
                  <option value="mph">mph</option>
                  <option value="kph">km/h</option>
                  <option value="ms">m/s</option>
                </select>
              </div>
            </div>
          </div>

          {result && (
            result.wc !== null ? (
              <>
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 6 }}>Wind Chill (Feels Like)</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.wc)}°F &nbsp; <span style={{ fontSize: 20 }}>{fmt(result.wcC)}°C</span></div>
                </div>
                <div className="kpi-grid" style={{ marginTop: 10 }}>
                  <div className="kpi"><div className="kpi-label">Condition</div><div className="kpi-value" style={{ color: result.danger.color }}>{result.danger.label}</div></div>
                  <div className="kpi"><div className="kpi-label">Frostbite Risk</div><div className="kpi-value">{result.frostbite}</div></div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 14, padding: "12px 16px", background: "#f0fdf4", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, color: "#16a34a" }}>Outside formula range</div>
                <div style={{ fontSize: 13, color: "#6b7a9e" }}>Wind chill applies when T ≤ 50°F and wind speed ≥ 3 mph.</div>
              </div>
            )
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Wind Chill Chart (°F)</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ fontSize: 12, minWidth: 500 }}>
              <thead>
                <tr>
                  <th>Temp \ Wind</th>
                  {[5,10,15,20,30,40].map(w => <th key={w}>{w} mph</th>)}
                </tr>
              </thead>
              <tbody>
                {[40,30,20,10,0,-10,-20,-30].map(t => (
                  <tr key={t}>
                    <td style={{ fontWeight: 700 }}>{t}°F</td>
                    {[5,10,15,20,30,40].map(w => {
                      const wc = windChill(t, w);
                      const d  = getDanger(wc);
                      return <td key={w} style={{ fontFamily: "monospace", color: d.color }}>{Math.round(wc)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="card-title" style={{ marginTop: 14 }}>Danger Levels</h3>
          <table className="table">
            {[["&gt; 32°F","Cool","#3b82f6"],["0–32°F","Cold","#2563eb"],["-20–0°F","Very Cold","#7c3aed"],["-40 to -20°F","Bitter Cold","#dc2626"],["-60 to -40°F","Extreme Cold","#b91c1c"],["&lt; -60°F","Dangerous / Frostbite","#7f1d1d"]].map(([r,l,c]) =>
              <tr key={l}><td style={{ fontFamily: "monospace" }} dangerouslySetInnerHTML={{ __html: r }} /><td style={{ fontWeight: 700, color: c }}>{l}</td></tr>
            )}
          </table>
        </section>
      </div>
    </div>
  );
}
