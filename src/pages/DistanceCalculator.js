import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => isFinite(v) ? (Math.round(v * 1e8) / 1e8).toString() : "—";

export default function DistanceCalculator() {
  const [mode, setMode] = useState("2d");
  const [x1, setX1] = useState("1"); const [y1, setY1] = useState("2");
  const [x2, setX2] = useState("4"); const [y2, setY2] = useState("6");
  const [z1, setZ1] = useState("0"); const [z2, setZ2] = useState("3");

  const result = useMemo(() => {
    const vx1 = parseFloat(x1), vy1 = parseFloat(y1);
    const vx2 = parseFloat(x2), vy2 = parseFloat(y2);
    if ([vx1, vy1, vx2, vy2].some(isNaN)) return null;

    const dx = vx2 - vx1, dy = vy2 - vy1;

    if (mode === "2d") {
      const dist = Math.sqrt(dx ** 2 + dy ** 2);
      const manhattan = Math.abs(dx) + Math.abs(dy);
      const midX = (vx1 + vx2) / 2, midY = (vy1 + vy2) / 2;
      return { dist, manhattan, mid: `(${fmt(midX)}, ${fmt(midY)})`, dx, dy };
    }

    const vz1 = parseFloat(z1), vz2 = parseFloat(z2);
    if (isNaN(vz1) || isNaN(vz2)) return null;
    const dz = vz2 - vz1;
    const dist = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
    const manhattan = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
    const midX = (vx1 + vx2) / 2, midY = (vy1 + vy2) / 2, midZ = (vz1 + vz2) / 2;
    return { dist, manhattan, mid: `(${fmt(midX)}, ${fmt(midY)}, ${fmt(midZ)})`, dx, dy, dz };
  }, [mode, x1, y1, x2, y2, z1, z2]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Distance Calculator</h1>
        <p className="muted">
          Calculate the Euclidean distance between two points in 2D or 3D space, plus midpoint and Manhattan distance.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Points</h2>

          <div className="tab-row">
            <button className={`tab-btn${mode === "2d" ? " active" : ""}`} onClick={() => setMode("2d")}>2D (x, y)</button>
            <button className={`tab-btn${mode === "3d" ? " active" : ""}`} onClick={() => setMode("3d")}>3D (x, y, z)</button>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
            Point 1
          </div>
          <div className="row two">
            <div className="field"><label>x₁</label><input type="number" value={x1} onChange={e => setX1(e.target.value)} /></div>
            <div className="field"><label>y₁</label><input type="number" value={y1} onChange={e => setY1(e.target.value)} /></div>
            {mode === "3d" && <div className="field"><label>z₁</label><input type="number" value={z1} onChange={e => setZ1(e.target.value)} /></div>}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 10 }}>
            Point 2
          </div>
          <div className="row two">
            <div className="field"><label>x₂</label><input type="number" value={x2} onChange={e => setX2(e.target.value)} /></div>
            <div className="field"><label>y₂</label><input type="number" value={y2} onChange={e => setY2(e.target.value)} /></div>
            {mode === "3d" && <div className="field"><label>z₂</label><input type="number" value={z2} onChange={e => setZ2(e.target.value)} /></div>}
          </div>

          {result && (
            <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Distance
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                {fmt(result.dist)}
              </div>
            </div>
          )}

          <table className="table" style={{ marginTop: 14 }}>
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr>
                <td>2D Distance</td>
                <td style={{ fontFamily: "monospace" }}>√((x₂−x₁)² + (y₂−y₁)²)</td>
              </tr>
              <tr>
                <td>3D Distance</td>
                <td style={{ fontFamily: "monospace" }}>√((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)</td>
              </tr>
              <tr>
                <td>Manhattan (2D)</td>
                <td style={{ fontFamily: "monospace" }}>|x₂−x₁| + |y₂−y₁|</td>
              </tr>
              <tr>
                <td>Midpoint (2D)</td>
                <td style={{ fontFamily: "monospace" }}>((x₁+x₂)/2, (y₁+y₂)/2)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result ? (
            <>
              <table className="table">
                <thead><tr><th>Measurement</th><th>Value</th></tr></thead>
                <tbody>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Euclidean Distance</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.dist)}</td>
                  </tr>
                  <tr>
                    <td>Manhattan Distance</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.manhattan)}</td>
                  </tr>
                  <tr>
                    <td>Midpoint</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.mid}</td>
                  </tr>
                  <tr>
                    <td>Δx (horizontal)</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.dx)}</td>
                  </tr>
                  <tr>
                    <td>Δy (vertical)</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.dy)}</td>
                  </tr>
                  {mode === "3d" && result.dz !== undefined && (
                    <tr>
                      <td>Δz (depth)</td>
                      <td style={{ fontFamily: "monospace" }}>{fmt(result.dz)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi">
                  <div className="kpi-label">Euclidean</div>
                  <div className="kpi-value">{fmt(result.dist)}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Manhattan</div>
                  <div className="kpi-value">{fmt(result.manhattan)}</div>
                </div>
              </div>
            </>
          ) : (
            <p className="small">Enter two points to calculate the distance.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Distance Types</h3>
          <table className="table">
            <thead><tr><th>Type</th><th>Also known as</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>Euclidean</td><td>Straight-line</td><td>Shortest path between two points</td></tr>
              <tr><td>Manhattan</td><td>Taxicab / City block</td><td>Sum of absolute differences</td></tr>
              <tr><td>Chebyshev</td><td>Chessboard</td><td>Maximum of absolute differences</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
