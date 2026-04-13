import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const MATERIALS = [
  { name: "Mulch (Shredded Bark)", lbPerCuFt: 20 },
  { name: "Wood Chips",            lbPerCuFt: 25 },
  { name: "Straw / Hay",           lbPerCuFt: 8  },
  { name: "Rubber Mulch",          lbPerCuFt: 44 },
  { name: "Compost",               lbPerCuFt: 40 },
  { name: "Pine Straw",            lbPerCuFt: 6  },
  { name: "Peat Moss",             lbPerCuFt: 18 },
  { name: "Cocoa Shell Mulch",     lbPerCuFt: 35 },
];

export default function MulchCalculator() {
  const [length,  setLength]  = useState("20");
  const [width,   setWidth]   = useState("8");
  const [depth,   setDepth]   = useState("3");
  const [depthU,  setDepthU]  = useState("in");
  const [matIdx,  setMatIdx]  = useState(0);
  const [bagSize, setBagSize] = useState("2"); // cubic feet per bag

  const result = useMemo(() => {
    const l = parseFloat(length) || 0, w = parseFloat(width) || 0;
    const d = parseFloat(depth) || 0;
    const dFt = depthU === "in" ? d / 12 : d;
    const bag = parseFloat(bagSize) || 2;
    const mat = MATERIALS[matIdx];
    if (l <= 0 || w <= 0 || dFt <= 0) return null;
    const areaSqFt = l * w;
    const cuFt     = areaSqFt * dFt;
    const cuYd     = cuFt / 27;
    const bags     = Math.ceil(cuFt / bag);
    const lbs      = cuFt * mat.lbPerCuFt;
    return { areaSqFt, cuFt, cuYd, bags, lbs };
  }, [length, width, depth, depthU, matIdx, bagSize]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mulch Calculator</h1>
        <p className="muted">Calculate cubic yards, cubic feet, and number of bags of mulch needed for your garden or landscaping beds.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Length (ft)</label>
              <input type="number" min="0" step="0.5" value={length} onChange={e => setLength(e.target.value)} /></div>
            <div className="field"><label>Width (ft)</label>
              <input type="number" min="0" step="0.5" value={width} onChange={e => setWidth(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Depth</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" min="0" step="0.5" value={depth} onChange={e => setDepth(e.target.value)} style={{ flex: 1 }} />
                <select value={depthU} onChange={e => setDepthU(e.target.value)} style={{ width: 80 }}>
                  <option value="in">inches</option>
                  <option value="ft">feet</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Material</label>
              <select value={matIdx} onChange={e => setMatIdx(parseInt(e.target.value))}>
                {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Bag Size (cubic ft)</label>
              <select value={bagSize} onChange={e => setBagSize(e.target.value)}>
                <option value="1">1 cu ft</option>
                <option value="1.5">1.5 cu ft</option>
                <option value="2">2 cu ft (standard)</option>
                <option value="3">3 cu ft</option>
              </select>
            </div>
          </div>

          {result && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Area</div><div className="kpi-value">{fmt(result.areaSqFt, 1)} ft²</div></div>
              <div className="kpi"><div className="kpi-label">Volume</div><div className="kpi-value">{fmt(result.cuFt, 2)} ft³</div></div>
              <div className="kpi"><div className="kpi-label">Cubic Yards</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{fmt(result.cuYd, 2)} yd³</div></div>
              <div className="kpi"><div className="kpi-label">Bags Needed</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{result.bags}</div></div>
              <div className="kpi"><div className="kpi-label">Weight</div><div className="kpi-value">{fmt(result.lbs, 0)} lbs</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Mulch Depth Guide</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Purpose</th><th>Recommended Depth</th></tr></thead>
            <tbody>
              {[["Weed suppression","3–4 inches"],["Moisture retention","2–3 inches"],["Annual beds","2–3 inches"],["Perennial beds","3–4 inches"],["Tree / shrub rings","3–4 inches"],["Vegetable garden","2–3 inches"],["Slopes / erosion control","4–6 inches"],["Playground safety","6–12 inches"]].map(([p,d]) =>
                <tr key={p}><td style={{ fontSize: 13 }}>{p}</td><td style={{ fontFamily: "monospace" }}>{d}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Coverage by Bag Size</h3>
          <table className="table">
            <thead><tr><th>Bag Size</th><th>@ 2" deep</th><th>@ 3" deep</th><th>@ 4" deep</th></tr></thead>
            <tbody>
              {[["1 cu ft","6 ft²","4 ft²","3 ft²"],["2 cu ft","12 ft²","8 ft²","6 ft²"],["3 cu ft","18 ft²","12 ft²","9 ft²"]].map(([b,a,c,d]) =>
                <tr key={b}><td style={{ fontFamily: "monospace" }}>{b}</td><td>{a}</td><td>{c}</td><td>{d}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
