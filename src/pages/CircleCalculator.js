import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const PI = Math.PI;
const fmt = v => isFinite(v) && !isNaN(v) ? (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

export default function CircleCalculator() {
  const [given, setGiven] = useState("radius");
  const [value, setValue] = useState("5");
  const [arcAngle, setArcAngle] = useState("60");

  const r = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) return null;
    switch (given) {
      case "radius":        return v;
      case "diameter":      return v / 2;
      case "circumference": return v / (2 * PI);
      case "area":          return Math.sqrt(v / PI);
      default: return null;
    }
  }, [given, value]);

  const circle = useMemo(() => {
    if (r === null) return null;
    return {
      r,
      d: 2 * r,
      c: 2 * PI * r,
      area: PI * r ** 2,
    };
  }, [r]);

  const arc = useMemo(() => {
    if (!circle) return null;
    const theta = parseFloat(arcAngle);
    if (isNaN(theta) || theta <= 0 || theta > 360) return null;
    const thetaRad = theta * PI / 180;
    const arcLen = r * thetaRad;
    const sectorArea = 0.5 * r ** 2 * thetaRad;
    const chordLen = 2 * r * Math.sin(thetaRad / 2);
    const segmentArea = 0.5 * r ** 2 * (thetaRad - Math.sin(thetaRad));
    return { arcLen, sectorArea, chordLen, segmentArea, theta };
  }, [circle, arcAngle, r]);

  const GIVEN_OPTIONS = [
    { key: "radius",        label: "Radius (r)" },
    { key: "diameter",      label: "Diameter (d)" },
    { key: "circumference", label: "Circumference (C)" },
    { key: "area",          label: "Area (A)" },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Circle Calculator</h1>
        <p className="muted">
          Enter any one circle measurement — radius, diameter, circumference, or area — and calculate all others,
          plus arc length, chord, sector area, and segment area.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row">
            <div className="field">
              <label>Given value</label>
              <select value={given} onChange={e => { setGiven(e.target.value); setValue(""); }}>
                {GIVEN_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>{GIVEN_OPTIONS.find(o => o.key === given)?.label}</label>
              <input type="number" min="0" value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter value" />
            </div>
          </div>

          {circle && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi">
                <div className="kpi-label">Radius</div>
                <div className="kpi-value" style={{ fontSize: given === "radius" ? 24 : 18 }}>{fmt(circle.r)}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Diameter</div>
                <div className="kpi-value" style={{ fontSize: given === "diameter" ? 24 : 18 }}>{fmt(circle.d)}</div>
              </div>
            </div>
          )}

          <h3 className="card-title" style={{ marginTop: 20 }}>Arc / Sector / Chord</h3>
          <div className="row">
            <div className="field">
              <label>Central angle (θ) in degrees</label>
              <input type="number" min="0" max="360" value={arcAngle}
                onChange={e => setArcAngle(e.target.value)} />
            </div>
          </div>

          {arc && (
            <table className="table" style={{ marginTop: 10 }}>
              <tbody>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Arc Length</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(arc.arcLen)}</td>
                </tr>
                <tr>
                  <td>Chord Length</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(arc.chordLen)}</td>
                </tr>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Sector Area</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(arc.sectorArea)}</td>
                </tr>
                <tr>
                  <td>Segment Area</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(arc.segmentArea)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {circle ? (
            <>
              <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                  Circle with radius = {fmt(circle.r)}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                  A = {fmt(circle.area)}
                </div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                  C = {fmt(circle.c)}
                </div>
              </div>

              <table className="table">
                <thead><tr><th>Property</th><th>Formula</th><th>Value</th></tr></thead>
                <tbody>
                  <tr style={{ background: given === "radius" ? "#f0eeff" : "" }}>
                    <td><strong>Radius (r)</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>—</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800 }}>{fmt(circle.r)}</td>
                  </tr>
                  <tr style={{ background: given === "diameter" ? "#f0eeff" : "" }}>
                    <td><strong>Diameter (d)</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>2r</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800 }}>{fmt(circle.d)}</td>
                  </tr>
                  <tr style={{ background: given === "circumference" ? "#f0eeff" : "" }}>
                    <td><strong>Circumference (C)</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>2πr</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800 }}>{fmt(circle.c)}</td>
                  </tr>
                  <tr style={{ background: given === "area" ? "#f0eeff" : "" }}>
                    <td><strong>Area (A)</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>πr²</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800 }}>{fmt(circle.area)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter a value to calculate all circle properties.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Circle Formulas</h3>
          <table className="table">
            <thead><tr><th>Property</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>Diameter</td><td style={{ fontFamily: "monospace" }}>d = 2r</td></tr>
              <tr><td>Circumference</td><td style={{ fontFamily: "monospace" }}>C = 2πr = πd</td></tr>
              <tr><td>Area</td><td style={{ fontFamily: "monospace" }}>A = πr²</td></tr>
              <tr><td>Arc length</td><td style={{ fontFamily: "monospace" }}>L = rθ (θ in radians)</td></tr>
              <tr><td>Sector area</td><td style={{ fontFamily: "monospace" }}>A = ½r²θ</td></tr>
              <tr><td>Chord length</td><td style={{ fontFamily: "monospace" }}>c = 2r·sin(θ/2)</td></tr>
              <tr><td>Segment area</td><td style={{ fontFamily: "monospace" }}>A = ½r²(θ − sin θ)</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
