import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const PITCHES = [
  { label: "2/12 (9.5°)",  rise: 2  },
  { label: "3/12 (14.0°)", rise: 3  },
  { label: "4/12 (18.4°)", rise: 4  },
  { label: "5/12 (22.6°)", rise: 5  },
  { label: "6/12 (26.6°)", rise: 6  },
  { label: "7/12 (30.3°)", rise: 7  },
  { label: "8/12 (33.7°)", rise: 8  },
  { label: "9/12 (36.9°)", rise: 9  },
  { label: "10/12 (39.8°)",rise: 10 },
  { label: "12/12 (45.0°)",rise: 12 },
];

export default function RoofingCalculator() {
  const [roofL,    setRoofL]    = useState("40");
  const [roofW,    setRoofW]    = useState("30");
  const [pitch,    setPitch]    = useState(4);   // rise per 12
  const [waste,    setWaste]    = useState("10");
  const [coverage, setCoverage] = useState("33.3"); // sq ft per bundle

  const result = useMemo(() => {
    const l = parseFloat(roofL) || 0, w = parseFloat(roofW) || 0;
    const p = parseFloat(pitch) || 0, wst = parseFloat(waste) || 0;
    const cov = parseFloat(coverage) || 33.3;
    if (l <= 0 || w <= 0) return null;
    const slopeFactor = Math.sqrt(1 + (p / 12) ** 2);
    const footprint   = l * w;
    const roofArea    = footprint * slopeFactor;
    const withWaste   = roofArea * (1 + wst / 100);
    const squares     = withWaste / 100;
    const bundles     = Math.ceil(withWaste / cov);
    const angleDeg    = Math.atan(p / 12) * 180 / Math.PI;
    return { footprint, roofArea, withWaste, squares, bundles, slopeFactor, angleDeg };
  }, [roofL, roofW, pitch, waste, coverage]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Roofing Calculator</h1>
        <p className="muted">Calculate roof area, squares, and shingle bundles needed for your roofing project.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Roof Dimensions</h2>
          <div className="row two">
            <div className="field"><label>Roof Length (ft)</label>
              <input type="number" min="0" value={roofL} onChange={e => setRoofL(e.target.value)} /></div>
            <div className="field"><label>Roof Width (ft)</label>
              <input type="number" min="0" value={roofW} onChange={e => setRoofW(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Roof Pitch (rise per 12" run)</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" min="0" max="24" step="1" value={pitch} onChange={e => setPitch(e.target.value)} style={{ flex: 1 }} />
                <select onChange={e => setPitch(e.target.value)} style={{ width: 160 }}>
                  {PITCHES.map(p => <option key={p.rise} value={p.rise}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Waste Factor (%)</label>
              <input type="number" min="0" max="50" value={waste} onChange={e => setWaste(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Bundle Coverage (sq ft/bundle)</label>
              <input type="number" min="1" step="0.1" value={coverage} onChange={e => setCoverage(e.target.value)} /></div>
          </div>

          {result && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Roof Area</div><div className="kpi-value">{fmt(result.roofArea, 0)} ft²</div></div>
              <div className="kpi"><div className="kpi-label">With Waste</div><div className="kpi-value">{fmt(result.withWaste, 0)} ft²</div></div>
              <div className="kpi"><div className="kpi-label">Squares</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{fmt(result.squares, 2)}</div></div>
              <div className="kpi"><div className="kpi-label">Bundles Needed</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{result.bundles}</div></div>
              <div className="kpi"><div className="kpi-label">Slope Factor</div><div className="kpi-value">{result.slopeFactor.toFixed(4)}</div></div>
              <div className="kpi"><div className="kpi-label">Pitch Angle</div><div className="kpi-value">{fmt(result.angleDeg, 1)}°</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Pitch &amp; Slope Reference</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Pitch</th><th>Angle</th><th>Slope Factor</th><th>Category</th></tr></thead>
            <tbody>
              {PITCHES.map(p => {
                const sf = Math.sqrt(1 + (p.rise / 12) ** 2);
                const ang = Math.atan(p.rise / 12) * 180 / Math.PI;
                const cat = p.rise < 4 ? "Low Slope" : p.rise < 9 ? "Moderate" : "Steep";
                return (
                  <tr key={p.rise} style={parseFloat(pitch) === p.rise ? { background: "#f0eeff" } : {}}>
                    <td style={{ fontFamily: "monospace" }}>{p.rise}/12</td>
                    <td style={{ fontFamily: "monospace" }}>{ang.toFixed(1)}°</td>
                    <td style={{ fontFamily: "monospace" }}>{sf.toFixed(4)}</td>
                    <td style={{ fontSize: 12 }}>{cat}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3 className="card-title">Material Estimates (per Square)</h3>
          <table className="table">
            <thead><tr><th>Material</th><th>Amount</th></tr></thead>
            <tbody>
              {[["3-tab shingles","3 bundles"],["Architectural shingles","3 bundles"],["Hip & ridge cap","1 bundle per 35 LF"],["Roofing nails","2–2.5 lbs"],["Underlayment","1 roll per 4 squares"],["Ice & water shield","1 roll per 2 squares"]].map(([m,a]) =>
                <tr key={m}><td style={{ fontSize: 13 }}>{m}</td><td style={{ fontFamily: "monospace" }}>{a}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
