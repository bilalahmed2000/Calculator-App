import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const PI = Math.PI;
const fmt = v => isFinite(v) && v >= 0 ? (Math.round(v * 1e6) / 1e6).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

const SHAPES = {
  sphere:          { label: "Sphere",            fields: [{ k: "r",  l: "Radius (r)" }] },
  cube:            { label: "Cube",              fields: [{ k: "a",  l: "Side Length (a)" }] },
  box:             { label: "Rectangular Box",   fields: [{ k: "l",  l: "Length (l)" }, { k: "w", l: "Width (w)" }, { k: "h", l: "Height (h)" }] },
  cylinder:        { label: "Cylinder",          fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Height (h)" }] },
  cone:            { label: "Cone",              fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Height (h)" }] },
  capsule:         { label: "Capsule",           fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Cylinder Height (h)" }] },
  sphericalCap:    { label: "Spherical Cap",     fields: [{ k: "r",  l: "Sphere Radius (r)" }, { k: "h", l: "Cap Height (h ≤ 2r)" }] },
  conicalFrustum:  { label: "Conical Frustum",   fields: [{ k: "R",  l: "Top Radius (R)" }, { k: "r", l: "Bottom Radius (r)" }, { k: "h", l: "Height (h)" }] },
  ellipsoid:       { label: "Ellipsoid",         fields: [{ k: "a",  l: "Axis a" }, { k: "b", l: "Axis b" }, { k: "c", l: "Axis c" }] },
  pyramid:         { label: "Square Pyramid",    fields: [{ k: "a",  l: "Base Side (a)" }, { k: "h", l: "Height (h)" }] },
  tube:            { label: "Tube / Pipe",       fields: [{ k: "R",  l: "Outer Radius (R)" }, { k: "r", l: "Inner Radius (r)" }, { k: "h", l: "Length (h)" }] },
};

const FORMULAS = {
  sphere:         "V = (4/3)πr³",
  cube:           "V = a³",
  box:            "V = l × w × h",
  cylinder:       "V = πr²h",
  cone:           "V = (1/3)πr²h",
  capsule:        "V = πr²(h + 4r/3)",
  sphericalCap:   "V = (πh²/3)(3r − h)",
  conicalFrustum: "V = (πh/3)(R² + Rr + r²)",
  ellipsoid:      "V = (4/3)πabc",
  pyramid:        "V = (1/3)a²h",
  tube:           "V = π(R² − r²)h",
};

function calcVolume(shape, v) {
  const { r, R, a, b, c, l, w, h } = v;
  switch (shape) {
    case "sphere":         return (4 / 3) * PI * r ** 3;
    case "cube":           return a ** 3;
    case "box":            return l * w * h;
    case "cylinder":       return PI * r ** 2 * h;
    case "cone":           return (1 / 3) * PI * r ** 2 * h;
    case "capsule":        return PI * r ** 2 * (h + (4 / 3) * r);
    case "sphericalCap":   return (PI * h ** 2 / 3) * (3 * r - h);
    case "conicalFrustum": return (PI * h / 3) * (R ** 2 + R * r + r ** 2);
    case "ellipsoid":      return (4 / 3) * PI * a * b * c;
    case "pyramid":        return (1 / 3) * a ** 2 * h;
    case "tube":           return PI * (R ** 2 - r ** 2) * h;
    default: return null;
  }
}

export default function VolumeCalculator() {
  const [shape, setShape] = useState("sphere");
  const [vals, setVals] = useState({ r: "5" });

  const set = (key, val) => setVals(prev => ({ ...prev, [key]: val }));
  const fields = SHAPES[shape].fields;

  const result = useMemo(() => {
    const nums = {};
    for (const f of fields) {
      const v = parseFloat(vals[f.k]);
      if (isNaN(v) || v <= 0) return null;
      nums[f.k] = v;
    }
    if (shape === "sphericalCap" && nums.h > 2 * nums.r)
      return { error: "Cap height (h) cannot exceed sphere diameter (2r)." };
    if (shape === "tube" && nums.r >= nums.R)
      return { error: "Inner radius must be less than outer radius." };
    if (shape === "conicalFrustum" && nums.R === nums.r)
      return { error: "Top and bottom radii cannot be equal (use Cylinder instead)." };
    const v = calcVolume(shape, nums);
    if (!isFinite(v) || v < 0) return null;
    return { v };
  }, [shape, vals, fields]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Volume Calculator</h1>
        <p className="muted">
          Calculate the volume of common 3D shapes: sphere, cube, cylinder, cone, box, pyramid, and more.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Shape & Dimensions</h2>

          <div className="row">
            <div className="field">
              <label>Shape</label>
              <select value={shape} onChange={e => { setShape(e.target.value); setVals({}); }}>
                {Object.entries(SHAPES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {fields.map(f => (
            <div className="row" key={f.k + shape}>
              <div className="field">
                <label>{f.l}</label>
                <input type="number" min="0" value={vals[f.k] ?? ""}
                  onChange={e => set(f.k, e.target.value)} placeholder="Enter value" />
              </div>
            </div>
          ))}

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              {result.error}
            </div>
          ) : result ? (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Volume — {SHAPES[shape].label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                {fmt(result.v)}
              </div>
              <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>cubic units</div>
            </div>
          ) : null}

          <div style={{ marginTop: 16, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontFamily: "monospace", fontSize: 13, color: "#4f46e5", border: "1px solid rgba(99,102,241,0.1)" }}>
            {FORMULAS[shape]}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Volume Formulas</h2>
          <table className="table">
            <thead><tr><th>Shape</th><th>Formula</th></tr></thead>
            <tbody>
              {Object.entries(FORMULAS).map(([k, f]) => (
                <tr key={k} style={k === shape ? { background: "#f0eeff" } : {}}>
                  <td style={k === shape ? { fontWeight: 700 } : {}}>{SHAPES[k].label}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
