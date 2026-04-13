import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const SHAPES = ["Rectangle / Square", "Circle", "Triangle", "Trapezoid", "L-Shape"];

export default function SquareFootageCalculator() {
  const [shape, setShape] = useState(0);
  const [unit,  setUnit]  = useState("ft");
  // Rectangle
  const [rL, setRL] = useState("20"); const [rW, setRW] = useState("15");
  // Circle
  const [cR, setCR] = useState("10");
  // Triangle
  const [tB, setTB] = useState("20"); const [tH, setTH] = useState("15");
  // Trapezoid
  const [trA, setTrA] = useState("20"); const [trB2, setTrB2] = useState("14"); const [trH, setTrH] = useState("10");
  // L-Shape
  const [lA, setLA] = useState("20"); const [lB, setLB] = useState("10");
  const [lC, setLC] = useState("10"); const [lD, setLD] = useState("8");

  const toFt = v => {
    const n = parseFloat(v) || 0;
    if (unit === "ft") return n;
    if (unit === "m")  return n * 3.28084;
    if (unit === "in") return n / 12;
    if (unit === "yd") return n * 3;
    return n;
  };

  const sqFt = useMemo(() => {
    switch (shape) {
      case 0: { const a = toFt(rL) * toFt(rW); return a; }
      case 1: { return Math.PI * toFt(cR) ** 2; }
      case 2: { return 0.5 * toFt(tB) * toFt(tH); }
      case 3: { return 0.5 * (toFt(trA) + toFt(trB2)) * toFt(trH); }
      case 4: { return toFt(lA) * toFt(lB) + toFt(lC) * toFt(lD); }
      default: return 0;
    }
  }, [shape, unit, rL, rW, cR, tB, tH, trA, trB2, trH, lA, lB, lC, lD]);

  const sqM  = sqFt / 10.7639;
  const sqYd = sqFt / 9;
  const sqIn = sqFt * 144;
  const acres = sqFt / 43560;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Square Footage Calculator</h1>
        <p className="muted">Calculate the area in square feet (or other units) for rectangles, circles, triangles, trapezoids, and L-shapes.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Shape &amp; Inputs</h2>
          <div className="row two">
            <div className="field"><label>Shape</label>
              <select value={shape} onChange={e => setShape(parseInt(e.target.value))}>
                {SHAPES.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label>Input Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="ft">Feet</option>
                <option value="in">Inches</option>
                <option value="m">Meters</option>
                <option value="yd">Yards</option>
              </select>
            </div>
          </div>

          {shape === 0 && <div className="row two">
            <div className="field"><label>Length ({unit})</label><input type="number" min="0" step="0.5" value={rL} onChange={e => setRL(e.target.value)} /></div>
            <div className="field"><label>Width ({unit})</label><input type="number" min="0" step="0.5" value={rW} onChange={e => setRW(e.target.value)} /></div>
          </div>}

          {shape === 1 && <div className="row two">
            <div className="field"><label>Radius ({unit})</label><input type="number" min="0" step="0.5" value={cR} onChange={e => setCR(e.target.value)} /></div>
          </div>}

          {shape === 2 && <div className="row two">
            <div className="field"><label>Base ({unit})</label><input type="number" min="0" step="0.5" value={tB} onChange={e => setTB(e.target.value)} /></div>
            <div className="field"><label>Height ({unit})</label><input type="number" min="0" step="0.5" value={tH} onChange={e => setTH(e.target.value)} /></div>
          </div>}

          {shape === 3 && <><div className="row two">
            <div className="field"><label>Side A ({unit})</label><input type="number" min="0" step="0.5" value={trA} onChange={e => setTrA(e.target.value)} /></div>
            <div className="field"><label>Side B ({unit})</label><input type="number" min="0" step="0.5" value={trB2} onChange={e => setTrB2(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Height ({unit})</label><input type="number" min="0" step="0.5" value={trH} onChange={e => setTrH(e.target.value)} /></div>
          </div></>}

          {shape === 4 && <><div className="row two">
            <div className="field"><label>Width A ({unit})</label><input type="number" min="0" step="0.5" value={lA} onChange={e => setLA(e.target.value)} /></div>
            <div className="field"><label>Length B ({unit})</label><input type="number" min="0" step="0.5" value={lB} onChange={e => setLB(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Width C ({unit})</label><input type="number" min="0" step="0.5" value={lC} onChange={e => setLC(e.target.value)} /></div>
            <div className="field"><label>Length D ({unit})</label><input type="number" min="0" step="0.5" value={lD} onChange={e => setLD(e.target.value)} /></div>
          </div></>}

          <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Area</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(sqFt, 2)} ft²</div>
            <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmt(sqM, 2)} m² &nbsp;|&nbsp; {fmt(sqYd, 2)} yd²</div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">All Unit Results</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Unit</th><th>Value</th></tr></thead>
            <tbody>
              {[["Square Feet (ft²)", fmt(sqFt)],["Square Meters (m²)", fmt(sqM)],["Square Yards (yd²)", fmt(sqYd)],["Square Inches (in²)", fmt(sqIn,0)],["Acres", sqFt.toFixed(6)],["Hectares", (sqM / 10000).toFixed(6)]].map(([u,v]) =>
                <tr key={u}><td style={{ fontSize: 13 }}>{u}</td><td style={{ fontFamily: "monospace", fontWeight: u.includes("Feet") ? 800 : 400, color: u.includes("Feet") ? "#4f46e5" : undefined }}>{v}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Area Reference</h3>
          <table className="table">
            <thead><tr><th>Space</th><th>Typical ft²</th></tr></thead>
            <tbody>
              {[["Studio apartment","400–600"],["1-bedroom apt","550–900"],["2-bedroom apt","900–1,200"],["3-bedroom home","1,500–2,500"],["Standard lot","6,000–9,000"],["Basketball court","4,700"],["Tennis court","2,808"],["Football field","48,000"],["Acre","43,560"]].map(([s,v]) =>
                <tr key={s}><td style={{ fontSize: 13 }}>{s}</td><td style={{ fontFamily: "monospace" }}>{v}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
