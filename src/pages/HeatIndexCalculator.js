import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 1) => isFinite(v) ? v.toFixed(d) : "—";

// Rothfusz regression equation (NWS)
function heatIndex(T, RH) {
  if (T < 80) return null; // formula not valid below 80°F
  const HI = -42.379 + 2.04901523*T + 10.14333127*RH
    - 0.22475541*T*RH - 0.00683783*T*T
    - 0.05481717*RH*RH + 0.00122874*T*T*RH
    + 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH;
  return HI;
}

function getCategory(hi) {
  if (hi === null) return null;
  if (hi < 80)  return { label: "Safe",          color: "#16a34a", desc: "No heat advisory" };
  if (hi < 91)  return { label: "Caution",        color: "#d97706", desc: "Fatigue possible with prolonged exposure" };
  if (hi < 103) return { label: "Extreme Caution",color: "#ea580c", desc: "Heat cramps or heat exhaustion possible" };
  if (hi < 125) return { label: "Danger",         color: "#dc2626", desc: "Heat cramps or exhaustion likely, heat stroke possible" };
  return { label: "Extreme Danger", color: "#7f1d1d", desc: "Heat stroke highly likely" };
}

export default function HeatIndexCalculator() {
  const [temp,    setTemp]    = useState("95");
  const [rh,      setRh]      = useState("60");
  const [unit,    setUnit]    = useState("F");

  const result = useMemo(() => {
    let T = parseFloat(temp), H = parseFloat(rh);
    if (isNaN(T) || isNaN(H)) return null;
    if (unit === "C") T = T * 9/5 + 32;
    H = Math.max(0, Math.min(100, H));
    const hi = heatIndex(T, H);
    const hiC = hi !== null ? (hi - 32) * 5 / 9 : null;
    return { T, H, hi, hiC, category: getCategory(hi) };
  }, [temp, rh, unit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Heat Index Calculator</h1>
        <p className="muted">Calculate the "feels like" temperature combining air temperature and relative humidity using the NWS Rothfusz equation.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Temperature</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" value={temp} onChange={e => setTemp(e.target.value)} style={{ flex: 1 }} />
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: 70 }}>
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Relative Humidity (%)</label>
              <input type="number" min="0" max="100" step="1" value={rh} onChange={e => setRh(e.target.value)} /></div>
          </div>

          {result ? (
            result.hi !== null ? (
              <>
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 6 }}>Heat Index (Feels Like)</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.hi)}°F &nbsp; <span style={{ fontSize: 20 }}>{fmt(result.hiC)}°C</span></div>
                </div>
                {result.category && (
                  <div style={{ marginTop: 10, padding: "12px 16px", background: "#fff7ed", borderRadius: 10, border: `1px solid ${result.category.color}40` }}>
                    <div style={{ fontWeight: 800, color: result.category.color, fontSize: 15 }}>{result.category.label}</div>
                    <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{result.category.desc}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 14, padding: "12px 16px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <div style={{ fontWeight: 700, color: "#16a34a" }}>Temperature below 80°F</div>
                <div style={{ fontSize: 13, color: "#6b7a9e" }}>Heat index calculation applies at 80°F (27°C) and above.</div>
              </div>
            )
          ) : null}
        </section>

        <section className="card">
          <h2 className="card-title">Heat Index Chart (°F)</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ fontSize: 12, minWidth: 500 }}>
              <thead>
                <tr>
                  <th>Temp \ RH</th>
                  {[40,50,60,70,80,90].map(h => <th key={h}>{h}%</th>)}
                </tr>
              </thead>
              <tbody>
                {[80,85,90,95,100,105,110].map(t => (
                  <tr key={t} style={Math.abs(parseFloat(temp) - t) < 3 ? { background: "#f0eeff" } : {}}>
                    <td style={{ fontWeight: 700 }}>{t}°F</td>
                    {[40,50,60,70,80,90].map(h => {
                      const hi = heatIndex(t, h);
                      const cat = getCategory(hi);
                      return <td key={h} style={{ fontFamily: "monospace", color: cat ? cat.color : undefined }}>{hi !== null ? Math.round(hi) : "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="card-title" style={{ marginTop: 14 }}>Danger Categories</h3>
          <table className="table">
            {[["< 80°F","Safe","#16a34a"],["80–90°F","Caution","#d97706"],["91–103°F","Extreme Caution","#ea580c"],["103–124°F","Danger","#dc2626"],["≥ 125°F","Extreme Danger","#7f1d1d"]].map(([r,l,c]) =>
              <tr key={l}><td style={{ fontFamily: "monospace" }}>{r}</td><td style={{ fontWeight: 700, color: c }}>{l}</td></tr>
            )}
          </table>
        </section>
      </div>
    </div>
  );
}
