import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 0) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

export default function BTUCalculator() {
  const [length,    setLength]    = useState("20");
  const [width,     setWidth]     = useState("15");
  const [height,    setHeight]    = useState("9");
  const [insul,     setInsul]     = useState("average");
  const [climate,   setClimate]   = useState("temperate");
  const [sunlight,  setSunlight]  = useState("average");
  const [occupants, setOccupants] = useState("2");
  const [windows,   setWindows]   = useState("2");
  const [mode,      setMode]      = useState("cooling"); // cooling | heating

  const insulMap   = { poor: 1.3, average: 1.0, good: 0.85, excellent: 0.7 };
  const climateMap = { hot: 1.2, warm: 1.1, temperate: 1.0, cool: 0.9, cold: 0.8 };
  const sunMap     = { high: 1.1, average: 1.0, low: 0.9 };

  const result = useMemo(() => {
    const l = parseFloat(length) || 0, w = parseFloat(width) || 0, h = parseFloat(height) || 0;
    const occ = parseInt(occupants) || 0, win = parseInt(windows) || 0;
    if (l <= 0 || w <= 0) return null;
    const area = l * w;
    // Base: 20 BTU/sq ft for cooling, 30–35 BTU/sq ft for heating
    const base = mode === "cooling" ? area * 20 : area * 30;
    const adjusted = base
      * insulMap[insul]
      * (mode === "cooling" ? climateMap[climate] : (2 - climateMap[climate]))
      * sunMap[sunlight];
    // Add for occupants beyond 2: +600 BTU each
    const occAdj = Math.max(0, occ - 2) * 600;
    // Add for extra windows
    const winAdj = Math.max(0, win - 2) * 1000;
    const total  = adjusted + occAdj + winAdj;
    const tons   = total / 12000;
    const kw     = total * 0.000293071;
    return { area, base: adjusted, occAdj, winAdj, total, tons, kw };
  }, [length, width, height, insul, climate, sunlight, occupants, windows, mode]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>BTU Calculator</h1>
        <p className="muted">Estimate the BTU/hr needed to heat or cool a room based on size, insulation, climate, and occupancy.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Room Details</h2>
          <div className="row two">
            <div className="field"><label>Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)}>
                <option value="cooling">Cooling (AC)</option>
                <option value="heating">Heating</option>
              </select>
            </div>
            <div className="field"><label>Climate Zone</label>
              <select value={climate} onChange={e => setClimate(e.target.value)}>
                <option value="hot">Hot (Florida, Texas summer)</option>
                <option value="warm">Warm (Southeast, California)</option>
                <option value="temperate">Temperate (Mid-Atlantic)</option>
                <option value="cool">Cool (Upper Midwest)</option>
                <option value="cold">Cold (Minnesota, Maine)</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Room Length (ft)</label><input type="number" min="0" value={length} onChange={e => setLength(e.target.value)} /></div>
            <div className="field"><label>Room Width (ft)</label><input type="number" min="0" value={width} onChange={e => setWidth(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Ceiling Height (ft)</label><input type="number" min="0" step="0.5" value={height} onChange={e => setHeight(e.target.value)} /></div>
            <div className="field"><label>Insulation Quality</label>
              <select value={insul} onChange={e => setInsul(e.target.value)}>
                <option value="poor">Poor (old / uninsulated)</option>
                <option value="average">Average</option>
                <option value="good">Good (modern construction)</option>
                <option value="excellent">Excellent (well-insulated)</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Sunlight Exposure</label>
              <select value={sunlight} onChange={e => setSunlight(e.target.value)}>
                <option value="high">High (south/west facing, lots of windows)</option>
                <option value="average">Average</option>
                <option value="low">Low (north facing, shaded)</option>
              </select>
            </div>
            <div className="field"><label>Occupants</label><input type="number" min="0" max="20" value={occupants} onChange={e => setOccupants(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Number of Windows</label><input type="number" min="0" max="20" value={windows} onChange={e => setWindows(e.target.value)} /></div>
          </div>

          {result && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Room Area</div><div className="kpi-value">{fmt(result.area)} ft²</div></div>
              <div className="kpi"><div className="kpi-label">BTU/hr Needed</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{fmt(result.total)}</div></div>
              <div className="kpi"><div className="kpi-label">Tons</div><div className="kpi-value">{result.tons.toFixed(2)}</div></div>
              <div className="kpi"><div className="kpi-label">kW</div><div className="kpi-value">{result.kw.toFixed(2)}</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">BTU Reference by Room Size</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Room Size</th><th>BTU/hr (cooling)</th><th>Tons</th></tr></thead>
            <tbody>
              {[[150,5000],[250,6000],[300,7000],[350,8000],[400,9000],[450,10000],[550,12000],[700,14000],[1000,18000],[1200,21000],[1400,23000],[1600,24000]].map(([sf,btu]) =>
                <tr key={sf}><td style={{ fontSize: 13 }}>{sf} ft²</td><td style={{ fontFamily: "monospace" }}>{btu.toLocaleString()}</td><td style={{ fontFamily: "monospace" }}>{(btu/12000).toFixed(1)}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Unit Conversions</h3>
          <table className="table">
            <tbody>
              <tr><td>1 Ton (AC)</td><td style={{ fontFamily: "monospace" }}>12,000 BTU/hr</td></tr>
              <tr><td>1 kW</td><td style={{ fontFamily: "monospace" }}>3,412 BTU/hr</td></tr>
              <tr><td>1 BTU/hr</td><td style={{ fontFamily: "monospace" }}>0.000293 kW</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
