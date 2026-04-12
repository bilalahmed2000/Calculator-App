import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const PI = Math.PI;
const toRad = d => d * PI / 180;
const toDeg = r => r * 180 / PI;
const fmt = v => isFinite(v) && !isNaN(v) ? (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

// Solve right triangle given exactly 2 of {a, b, c, A, B}
// C is always 90°, A + B = 90°
function solveTriangle(inputs) {
  const { a, b, c, A, B } = inputs; // undefined means unknown
  const known = Object.entries({ a, b, c, A, B }).filter(([, v]) => v !== undefined);
  if (known.length < 2) return null;

  let ra = a, rb = b, rc = c, rA = A, rB = B;

  // If both angles are known (and degrees), we can set rA/rB but need a side
  if (rA !== undefined) rB = 90 - rA;
  if (rB !== undefined) rA = 90 - rB;

  // Derive sides
  if (ra !== undefined && rb !== undefined) {
    rc = Math.sqrt(ra ** 2 + rb ** 2);
    rA = toDeg(Math.atan(ra / rb));
    rB = 90 - rA;
  } else if (ra !== undefined && rc !== undefined) {
    if (rc < ra) return { error: "Hypotenuse must be greater than any leg." };
    rb = Math.sqrt(rc ** 2 - ra ** 2);
    rA = toDeg(Math.asin(ra / rc));
    rB = 90 - rA;
  } else if (rb !== undefined && rc !== undefined) {
    if (rc < rb) return { error: "Hypotenuse must be greater than any leg." };
    ra = Math.sqrt(rc ** 2 - rb ** 2);
    rB = toDeg(Math.asin(rb / rc));
    rA = 90 - rB;
  } else if (ra !== undefined && rA !== undefined) {
    if (rA <= 0 || rA >= 90) return { error: "Angle A must be between 0° and 90°." };
    rb = ra / Math.tan(toRad(rA));
    rc = ra / Math.sin(toRad(rA));
    rB = 90 - rA;
  } else if (ra !== undefined && rB !== undefined) {
    if (rB <= 0 || rB >= 90) return { error: "Angle B must be between 0° and 90°." };
    rA = 90 - rB;
    rb = ra / Math.tan(toRad(rA));
    rc = ra / Math.sin(toRad(rA));
  } else if (rb !== undefined && rB !== undefined) {
    if (rB <= 0 || rB >= 90) return { error: "Angle B must be between 0° and 90°." };
    ra = rb / Math.tan(toRad(rB));
    rc = rb / Math.sin(toRad(rB));
    rA = 90 - rB;
  } else if (rb !== undefined && rA !== undefined) {
    if (rA <= 0 || rA >= 90) return { error: "Angle A must be between 0° and 90°." };
    rB = 90 - rA;
    ra = rb / Math.tan(toRad(rB));
    rc = rb / Math.sin(toRad(rB));
  } else if (rc !== undefined && rA !== undefined) {
    if (rA <= 0 || rA >= 90) return { error: "Angle A must be between 0° and 90°." };
    ra = rc * Math.sin(toRad(rA));
    rb = rc * Math.cos(toRad(rA));
    rB = 90 - rA;
  } else if (rc !== undefined && rB !== undefined) {
    if (rB <= 0 || rB >= 90) return { error: "Angle B must be between 0° and 90°." };
    rb = rc * Math.sin(toRad(rB));
    ra = rc * Math.cos(toRad(rB));
    rA = 90 - rB;
  } else {
    return null;
  }

  if ([ra, rb, rc].some(v => v <= 0 || !isFinite(v))) return { error: "Invalid combination — check your values." };

  return {
    a: ra, b: rb, c: rc,
    A: rA, B: rB, C: 90,
    perimeter: ra + rb + rc,
    area: 0.5 * ra * rb,
    sinA: Math.sin(toRad(rA)), cosA: Math.cos(toRad(rA)), tanA: Math.tan(toRad(rA)),
  };
}

const VARS = [
  { key: "a", label: "Leg a" },
  { key: "b", label: "Leg b" },
  { key: "c", label: "Hypotenuse c" },
  { key: "A", label: "Angle A (°)" },
  { key: "B", label: "Angle B (°)" },
];

export default function RightTriangleCalculator() {
  const [v1Key, setV1Key] = useState("a");
  const [v1Val, setV1Val] = useState("3");
  const [v2Key, setV2Key] = useState("b");
  const [v2Val, setV2Val] = useState("4");

  const result = useMemo(() => {
    if (v1Key === v2Key) return { error: "Please select two different values." };
    const p1 = parseFloat(v1Val), p2 = parseFloat(v2Val);
    if (isNaN(p1) || isNaN(p2)) return null;
    const inputs = { [v1Key]: p1, [v2Key]: p2 };
    return solveTriangle(inputs);
  }, [v1Key, v1Val, v2Key, v2Val]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Right Triangle Calculator</h1>
        <p className="muted">
          Enter any two values of a right triangle (sides or angles) and solve for all remaining properties.
          Angle C is always 90°.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Two Known Values</h2>
          <p className="small">Select what each value represents, then enter the number.</p>

          <div className="row two">
            <div className="field">
              <label>First value type</label>
              <select value={v1Key} onChange={e => setV1Key(e.target.value)}>
                {VARS.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{VARS.find(v => v.key === v1Key)?.label}</label>
              <input type="number" min="0" value={v1Val} onChange={e => setV1Val(e.target.value)} />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Second value type</label>
              <select value={v2Key} onChange={e => setV2Key(e.target.value)}>
                {VARS.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{VARS.find(v => v.key === v2Key)?.label}</label>
              <input type="number" min="0" value={v2Val} onChange={e => setV2Val(e.target.value)} />
            </div>
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13, marginTop: 8 }}>
              {result.error}
            </div>
          ) : result ? (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">a</div><div className="kpi-value">{fmt(result.a)}</div></div>
              <div className="kpi"><div className="kpi-label">b</div><div className="kpi-value">{fmt(result.b)}</div></div>
              <div className="kpi"><div className="kpi-label">c (hyp)</div><div className="kpi-value">{fmt(result.c)}</div></div>
            </div>
          ) : null}

          <table className="table" style={{ marginTop: 14 }}>
            <thead><tr><th>Function</th><th>Definition</th></tr></thead>
            <tbody>
              <tr><td>sin(A)</td><td style={{ fontFamily: "monospace" }}>a / c (opposite / hypotenuse)</td></tr>
              <tr><td>cos(A)</td><td style={{ fontFamily: "monospace" }}>b / c (adjacent / hypotenuse)</td></tr>
              <tr><td>tan(A)</td><td style={{ fontFamily: "monospace" }}>a / b (opposite / adjacent)</td></tr>
              <tr><td>Pythagorean</td><td style={{ fontFamily: "monospace" }}>a² + b² = c²</td></tr>
              <tr><td>A + B</td><td style={{ fontFamily: "monospace" }}>= 90° (always)</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result && !result.error ? (
            <>
              <table className="table" style={{ marginBottom: 14 }}>
                <thead><tr><th>Property</th><th>Value</th></tr></thead>
                <tbody>
                  <tr style={{ background: v1Key === "a" || v2Key === "a" ? "#f0eeff" : "" }}>
                    <td><strong>Leg a</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.a)}</td>
                  </tr>
                  <tr style={{ background: v1Key === "b" || v2Key === "b" ? "#f0eeff" : "" }}>
                    <td><strong>Leg b</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.b)}</td>
                  </tr>
                  <tr style={{ background: v1Key === "c" || v2Key === "c" ? "#f0eeff" : "" }}>
                    <td><strong>Hypotenuse c</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.c)}</td>
                  </tr>
                  <tr style={{ background: v1Key === "A" || v2Key === "A" ? "#f0eeff" : "" }}>
                    <td>Angle A</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.A)}°</td>
                  </tr>
                  <tr style={{ background: v1Key === "B" || v2Key === "B" ? "#f0eeff" : "" }}>
                    <td>Angle B</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.B)}°</td>
                  </tr>
                  <tr><td>Angle C</td><td style={{ fontFamily: "monospace" }}>90°</td></tr>
                  <tr><td>Perimeter</td><td style={{ fontFamily: "monospace" }}>{fmt(result.perimeter)}</td></tr>
                  <tr><td>Area</td><td style={{ fontFamily: "monospace" }}>{fmt(result.area)}</td></tr>
                </tbody>
              </table>

              <h3 className="card-title">Trig Ratios (Angle A)</h3>
              <table className="table">
                <tbody>
                  <tr><td>sin(A)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.sinA)}</td></tr>
                  <tr><td>cos(A)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.cosA)}</td></tr>
                  <tr><td>tan(A)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.tanA)}</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Select two different values and enter their amounts to solve the triangle.</p>
          )}
        </section>
      </div>
    </div>
  );
}
