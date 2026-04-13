import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 1) => isFinite(v) ? v.toFixed(d) : "—";

// Magnus formula
function dewPoint(T_C, RH) {
  const a = 17.625, b = 243.04;
  const alpha = Math.log(RH / 100) + (a * T_C) / (b + T_C);
  return (b * alpha) / (a - alpha);
}

function comfort(dp_C) {
  if (dp_C < 10)  return { label: "Dry / Comfortable",     color: "#16a34a" };
  if (dp_C < 16)  return { label: "Comfortable",            color: "#4f46e5" };
  if (dp_C < 18)  return { label: "Slightly Humid",         color: "#d97706" };
  if (dp_C < 21)  return { label: "Humid / Uncomfortable",  color: "#ea580c" };
  if (dp_C < 24)  return { label: "Very Humid / Oppressive",color: "#dc2626" };
  return            { label: "Extremely Oppressive",         color: "#7f1d1d" };
}

export default function DewPointCalculator() {
  const [temp, setTemp] = useState("30");
  const [rh,   setRh]   = useState("65");
  const [unit, setUnit] = useState("C");

  const result = useMemo(() => {
    let T = parseFloat(temp), H = parseFloat(rh);
    if (isNaN(T) || isNaN(H)) return null;
    H = Math.max(1, Math.min(100, H));
    const T_C = unit === "C" ? T : (T - 32) * 5/9;
    const dp_C = dewPoint(T_C, H);
    const dp_F = dp_C * 9/5 + 32;
    // Absolute humidity (g/m³): AH = 216.7 × (RH/100 × 6.112 × e^(17.62T/(243.12+T))) / (273.15+T)
    const es  = 6.112 * Math.exp(17.62 * T_C / (243.12 + T_C));
    const ah  = 216.7 * (H / 100 * es) / (273.15 + T_C);
    return { T, T_C, dp_C, dp_F, ah, comfort: comfort(dp_C) };
  }, [temp, rh, unit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Dew Point Calculator</h1>
        <p className="muted">Calculate the dew point temperature from air temperature and relative humidity using the Magnus formula.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Air Temperature</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" value={temp} onChange={e => setTemp(e.target.value)} style={{ flex: 1 }} />
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: 70 }}>
                  <option value="C">°C</option>
                  <option value="F">°F</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Relative Humidity (%)</label>
              <input type="number" min="1" max="100" step="1" value={rh} onChange={e => setRh(e.target.value)} /></div>
          </div>

          {result && (
            <>
              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 6 }}>Dew Point</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.dp_C)}°C &nbsp; <span style={{ fontSize: 20 }}>{fmt(result.dp_F)}°F</span></div>
              </div>
              <div className="kpi-grid" style={{ marginTop: 10 }}>
                <div className="kpi"><div className="kpi-label">Comfort Level</div><div className="kpi-value" style={{ color: result.comfort.color, fontSize: 14 }}>{result.comfort.label}</div></div>
                <div className="kpi"><div className="kpi-label">Abs. Humidity</div><div className="kpi-value">{fmt(result.ah, 2)} g/m³</div></div>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Dew Point Comfort Scale</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Dew Point</th><th>Comfort Level</th></tr></thead>
            <tbody>
              {[["< 10°C (50°F)","Dry / Comfortable","#16a34a"],["10–15°C (50–60°F)","Comfortable","#4f46e5"],["16–18°C (60–65°F)","Slightly Humid","#d97706"],["18–21°C (65–70°F)","Humid","#ea580c"],["21–24°C (70–75°F)","Very Humid","#dc2626"],["≥ 24°C (75°F)","Extremely Oppressive","#7f1d1d"]].map(([dp,l,c]) =>
                <tr key={dp}><td style={{ fontFamily: "monospace", fontSize: 12 }}>{dp}</td><td style={{ fontWeight: 700, color: c }}>{l}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Dew Point by Temperature (°C)</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Temp \ RH</th>
                  {[30,40,50,60,70,80,90].map(h => <th key={h}>{h}%</th>)}
                </tr>
              </thead>
              <tbody>
                {[10,15,20,25,30,35,40].map(t => (
                  <tr key={t}>
                    <td style={{ fontWeight: 700 }}>{t}°C</td>
                    {[30,40,50,60,70,80,90].map(h => {
                      const dp = dewPoint(t, h);
                      const c  = comfort(dp);
                      return <td key={h} style={{ fontFamily: "monospace", color: c.color }}>{dp.toFixed(0)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
