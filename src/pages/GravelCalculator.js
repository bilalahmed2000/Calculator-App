import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const MATERIALS = [
  { name: "Pea Gravel",          lbPerCuFt: 96  },
  { name: "Crushed Stone #57",   lbPerCuFt: 100 },
  { name: "Crushed Stone #411",  lbPerCuFt: 104 },
  { name: "River Rock",          lbPerCuFt: 105 },
  { name: "Decomposed Granite",  lbPerCuFt: 108 },
  { name: "White Marble Chips",  lbPerCuFt: 84  },
  { name: "Lava Rock",           lbPerCuFt: 50  },
  { name: "Sand",                lbPerCuFt: 100 },
  { name: "Topsoil",             lbPerCuFt: 75  },
  { name: "Fill Dirt",           lbPerCuFt: 90  },
];

export default function GravelCalculator() {
  const [length,  setLength]  = useState("20");
  const [width,   setWidth]   = useState("10");
  const [depth,   setDepth]   = useState("4");
  const [depthU,  setDepthU]  = useState("in");
  const [matIdx,  setMatIdx]  = useState(0);
  const [shape,   setShape]   = useState("rect");
  const [radius,  setRadius]  = useState("10");

  const result = useMemo(() => {
    const l = parseFloat(length) || 0, w = parseFloat(width) || 0, r = parseFloat(radius) || 0;
    const d = parseFloat(depth) || 0;
    const dFt = depthU === "in" ? d / 12 : d;
    const mat = MATERIALS[matIdx];
    let areaSqFt = shape === "rect" ? l * w : Math.PI * r * r;
    if (areaSqFt <= 0 || dFt <= 0) return null;
    const cuFt = areaSqFt * dFt;
    const cuYd = cuFt / 27;
    const lbs  = cuFt * mat.lbPerCuFt;
    const tons = lbs / 2000;
    const bags50 = Math.ceil(lbs / 50);
    return { areaSqFt, cuFt, cuYd, lbs, tons, bags50 };
  }, [length, width, depth, depthU, matIdx, shape, radius]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Gravel Calculator</h1>
        <p className="muted">Calculate the volume and weight of gravel, rock, sand, or soil needed for your landscaping or construction project.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Shape</label>
              <select value={shape} onChange={e => setShape(e.target.value)}>
                <option value="rect">Rectangle / Square</option>
                <option value="circle">Circle</option>
              </select>
            </div>
            <div className="field"><label>Material</label>
              <select value={matIdx} onChange={e => setMatIdx(parseInt(e.target.value))}>
                {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
              </select>
            </div>
          </div>
          {shape === "rect"
            ? <div className="row two">
                <div className="field"><label>Length (ft)</label><input type="number" min="0" value={length} onChange={e => setLength(e.target.value)} /></div>
                <div className="field"><label>Width (ft)</label><input type="number" min="0" value={width} onChange={e => setWidth(e.target.value)} /></div>
              </div>
            : <div className="row two">
                <div className="field"><label>Radius (ft)</label><input type="number" min="0" value={radius} onChange={e => setRadius(e.target.value)} /></div>
              </div>
          }
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
          </div>

          {result && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Area</div><div className="kpi-value">{fmt(result.areaSqFt, 1)} ft²</div></div>
              <div className="kpi"><div className="kpi-label">Volume</div><div className="kpi-value">{fmt(result.cuFt, 2)} ft³</div></div>
              <div className="kpi"><div className="kpi-label">Cubic Yards</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{fmt(result.cuYd, 2)} yd³</div></div>
              <div className="kpi"><div className="kpi-label">Weight</div><div className="kpi-value">{fmt(result.lbs, 0)} lbs</div></div>
              <div className="kpi"><div className="kpi-label">Tons</div><div className="kpi-value">{fmt(result.tons, 2)} tons</div></div>
              <div className="kpi"><div className="kpi-label">50-lb Bags</div><div className="kpi-value">{result.bags50}</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Material Densities</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Material</th><th>lbs/ft³</th><th>tons/yd³</th></tr></thead>
            <tbody>
              {MATERIALS.map((m, i) => (
                <tr key={m.name} style={i === matIdx ? { background: "#f0eeff" } : {}}>
                  <td style={{ fontSize: 13 }}>{m.name}</td>
                  <td style={{ fontFamily: "monospace" }}>{m.lbPerCuFt}</td>
                  <td style={{ fontFamily: "monospace" }}>{(m.lbPerCuFt * 27 / 2000).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="card-title">Typical Depths by Use</h3>
          <table className="table">
            <thead><tr><th>Application</th><th>Depth</th></tr></thead>
            <tbody>
              {[["Driveway base",6],[" Driveway top layer",2],[" Pathway / walkway",3],[" Garden border",2],[" Under concrete",4],[" Drainage layer",6],[" Playground surface",6]].map(([a,d]) =>
                <tr key={a}><td style={{ fontSize: 13 }}>{a}</td><td style={{ fontFamily: "monospace" }}>{d}"</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
