import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 6) => isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toString() : "undefined";
const PI = Math.PI;

export default function SlopeCalculator() {
  const [x1, setX1] = useState("2");
  const [y1, setY1] = useState("3");
  const [x2, setX2] = useState("7");
  const [y2, setY2] = useState("11");

  const result = useMemo(() => {
    const vx1 = parseFloat(x1), vy1 = parseFloat(y1);
    const vx2 = parseFloat(x2), vy2 = parseFloat(y2);
    if ([vx1, vy1, vx2, vy2].some(isNaN)) return null;

    const dx = vx2 - vx1;
    const dy = vy2 - vy1;
    const isVertical = dx === 0;
    const isHorizontal = dy === 0;

    const m = isVertical ? Infinity : dy / dx;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const midX = (vx1 + vx2) / 2;
    const midY = (vy1 + vy2) / 2;
    const angleDeg = isVertical ? 90 : Math.atan(Math.abs(m)) * 180 / PI;
    const b = isVertical ? null : vy1 - m * vx1;

    let lineEq = "";
    if (isVertical) lineEq = `x = ${vx1}`;
    else if (isHorizontal) lineEq = `y = ${fmt(vy1)}`;
    else {
      const bStr = b >= 0 ? `+ ${fmt(b)}` : `− ${fmt(Math.abs(b))}`;
      lineEq = `y = ${fmt(m)}x ${bStr}`;
    }

    // Perpendicular slope
    const mPerp = isVertical ? 0 : isHorizontal ? Infinity : -1 / m;

    return { m, distance, midX, midY, angleDeg, b, lineEq, isVertical, isHorizontal, mPerp, dx, dy };
  }, [x1, y1, x2, y2]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Slope Calculator</h1>
        <p className="muted">
          Find the slope, angle, distance, midpoint, and line equation from two coordinate points.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Two Points</h2>

          <div className="row two">
            <div className="field">
              <label>x₁</label>
              <input type="number" value={x1} onChange={e => setX1(e.target.value)} />
            </div>
            <div className="field">
              <label>y₁</label>
              <input type="number" value={y1} onChange={e => setY1(e.target.value)} />
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6b7a9e", marginBottom: 4 }}>
            Point 1: ({x1 || "x₁"}, {y1 || "y₁"})
          </div>

          <div className="row two">
            <div className="field">
              <label>x₂</label>
              <input type="number" value={x2} onChange={e => setX2(e.target.value)} />
            </div>
            <div className="field">
              <label>y₂</label>
              <input type="number" value={y2} onChange={e => setY2(e.target.value)} />
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6b7a9e", marginBottom: 12 }}>
            Point 2: ({x2 || "x₂"}, {y2 || "y₂"})
          </div>

          {result && (
            <>
              <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                  Line Equation
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                  {result.lineEq}
                </div>
              </div>

              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Slope (m)</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>
                    {result.isVertical ? "undefined" : fmt(result.m, 6)}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Angle (θ)</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>{fmt(result.angleDeg, 4)}°</div>
                </div>
              </div>
            </>
          )}

          <table className="table" style={{ marginTop: 14 }}>
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Slope</td><td style={{ fontFamily: "monospace" }}>m = (y₂ − y₁) / (x₂ − x₁)</td></tr>
              <tr><td>Distance</td><td style={{ fontFamily: "monospace" }}>d = √((x₂−x₁)² + (y₂−y₁)²)</td></tr>
              <tr><td>Midpoint</td><td style={{ fontFamily: "monospace" }}>M = ((x₁+x₂)/2, (y₁+y₂)/2)</td></tr>
              <tr><td>y-intercept</td><td style={{ fontFamily: "monospace" }}>b = y₁ − m·x₁</td></tr>
              <tr><td>Angle</td><td style={{ fontFamily: "monospace" }}>θ = arctan(|m|)</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result ? (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Slope (m)</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>
                    {result.isVertical ? "undefined (vertical line)" : fmt(result.m)}
                  </td>
                </tr>
                <tr>
                  <td>y-intercept (b)</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                    {result.b === null ? "undefined" : fmt(result.b)}
                  </td>
                </tr>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Line Equation</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{result.lineEq}</td>
                </tr>
                <tr>
                  <td>Angle (θ)</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(result.angleDeg, 4)}°</td>
                </tr>
                <tr>
                  <td>Distance (d)</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.distance)}</td>
                </tr>
                <tr>
                  <td>Δx (run)</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(result.dx)}</td>
                </tr>
                <tr>
                  <td>Δy (rise)</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(result.dy)}</td>
                </tr>
                <tr>
                  <td>Midpoint</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>({fmt(result.midX)}, {fmt(result.midY)})</td>
                </tr>
                <tr>
                  <td>Perpendicular slope</td>
                  <td style={{ fontFamily: "monospace" }}>
                    {result.isHorizontal ? "undefined" : result.isVertical ? "0" : fmt(result.mPerp)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Enter two points to calculate slope and line properties.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Slope Types</h3>
          <table className="table">
            <thead><tr><th>Type</th><th>Slope (m)</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>Positive</td><td>m &gt; 0</td><td>Rises left to right</td></tr>
              <tr><td>Negative</td><td>m &lt; 0</td><td>Falls left to right</td></tr>
              <tr><td>Zero</td><td>m = 0</td><td>Horizontal line</td></tr>
              <tr><td>Undefined</td><td>—</td><td>Vertical line (Δx = 0)</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
