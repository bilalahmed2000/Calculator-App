import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) && v > 0 ? v.toFixed(d) : "—";

export default function GasMileageCalculator() {
  const [tab,   setTab]   = useState("calc");
  const [miles, setMiles] = useState("300");
  const [gal,   setGal]   = useState("10");
  const [unit,  setUnit]  = useState("us"); // us | uk | metric

  // Converter
  const [cvVal, setCvVal] = useState("30");
  const [cvFrom,setCvFrom]= useState("mpg_us");

  const result = useMemo(() => {
    const m = parseFloat(miles), g = parseFloat(gal);
    if (isNaN(m) || isNaN(g) || g <= 0) return null;
    const mpgUS = m / g;
    const mpgUK = mpgUS * 1.20095;
    const kmL   = mpgUS * 0.425144;
    const l100  = 235.215 / mpgUS;
    return { mpgUS, mpgUK, kmL, l100 };
  }, [miles, gal]);

  const convResult = useMemo(() => {
    const v = parseFloat(cvVal);
    if (isNaN(v) || v <= 0) return null;
    let mpgUS;
    switch (cvFrom) {
      case "mpg_us": mpgUS = v; break;
      case "mpg_uk": mpgUS = v / 1.20095; break;
      case "kml":    mpgUS = v / 0.425144; break;
      case "l100k":  mpgUS = 235.215 / v; break;
      default: mpgUS = v;
    }
    return {
      mpg_us: mpgUS,
      mpg_uk: mpgUS * 1.20095,
      kml:    mpgUS * 0.425144,
      l100k:  235.215 / mpgUS,
    };
  }, [cvVal, cvFrom]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Gas Mileage Calculator</h1>
        <p className="muted">Calculate fuel economy (MPG, km/L, L/100km) and convert between different fuel efficiency units.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "calc" ? " active" : ""}`} onClick={() => setTab("calc")}>Calculate MPG</button>
            <button className={`tab-btn${tab === "convert" ? " active" : ""}`} onClick={() => setTab("convert")}>Unit Converter</button>
          </div>

          {tab === "calc" && <>
            <div className="row two" style={{ marginTop: 12 }}>
              <div className="field"><label>Distance Driven (miles)</label>
                <input type="number" min="0" step="1" value={miles} onChange={e => setMiles(e.target.value)} /></div>
              <div className="field"><label>Fuel Used (gallons)</label>
                <input type="number" min="0" step="0.1" value={gal} onChange={e => setGal(e.target.value)} /></div>
            </div>
            {result && (
              <>
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 6 }}>Fuel Economy</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.mpgUS)} MPG</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmt(result.kmL)} km/L &nbsp;|&nbsp; {fmt(result.l100)} L/100km</div>
                </div>
                <div className="kpi-grid" style={{ marginTop: 10 }}>
                  <div className="kpi"><div className="kpi-label">US MPG</div><div className="kpi-value">{fmt(result.mpgUS)}</div></div>
                  <div className="kpi"><div className="kpi-label">UK MPG</div><div className="kpi-value">{fmt(result.mpgUK)}</div></div>
                  <div className="kpi"><div className="kpi-label">km/L</div><div className="kpi-value">{fmt(result.kmL)}</div></div>
                  <div className="kpi"><div className="kpi-label">L/100km</div><div className="kpi-value">{fmt(result.l100)}</div></div>
                </div>
              </>
            )}
          </>}

          {tab === "convert" && <>
            <div className="row two" style={{ marginTop: 12 }}>
              <div className="field"><label>Value</label>
                <input type="number" min="0" step="0.1" value={cvVal} onChange={e => setCvVal(e.target.value)} /></div>
              <div className="field"><label>From Unit</label>
                <select value={cvFrom} onChange={e => setCvFrom(e.target.value)}>
                  <option value="mpg_us">MPG (US)</option>
                  <option value="mpg_uk">MPG (UK)</option>
                  <option value="kml">km/L</option>
                  <option value="l100k">L/100km</option>
                </select>
              </div>
            </div>
            {convResult && (
              <table className="table" style={{ marginTop: 14 }}>
                <thead><tr><th>Unit</th><th>Value</th></tr></thead>
                <tbody>
                  {[["MPG (US)", convResult.mpg_us], ["MPG (UK)", convResult.mpg_uk], ["km/L", convResult.kml], ["L/100km", convResult.l100k]].map(([u, v]) => (
                    <tr key={u} style={u.includes(cvFrom.includes("us") ? "US" : cvFrom.includes("uk") ? "UK" : cvFrom === "kml" ? "km/L" : "L/100") ? { background: "#f0eeff" } : {}}>
                      <td>{u}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#4f46e5" }}>{fmt(v, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>}
        </section>

        <section className="card">
          <h2 className="card-title">Fuel Economy by Vehicle Class (US EPA)</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Vehicle</th><th>MPG</th><th>km/L</th><th>L/100km</th></tr></thead>
            <tbody>
              {[["Compact car",35],["Midsize sedan",28],["Full-size sedan",22],["Compact SUV",28],["Midsize SUV",23],["Full-size SUV",17],["Pickup (V6)",22],["Pickup (V8)",18],["Minivan",24],["Hybrid",52],["Electric (MPGe)",120]].map(([v, m]) =>
                <tr key={v}><td style={{ fontSize: 13 }}>{v}</td><td style={{ fontFamily: "monospace" }}>{m}</td><td style={{ fontFamily: "monospace" }}>{(m * 0.425144).toFixed(1)}</td><td style={{ fontFamily: "monospace" }}>{(235.215 / m).toFixed(1)}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
