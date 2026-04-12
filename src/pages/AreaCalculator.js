import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const PI = Math.PI;
const fmt = v => isFinite(v) && v >= 0 ? (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

const SHAPES = {
  square:         { label: "Square",              fields: [{ k: "a",   l: "Side (a)" }] },
  rectangle:      { label: "Rectangle",           fields: [{ k: "l",   l: "Length (l)" }, { k: "w", l: "Width (w)" }] },
  triangleBH:     { label: "Triangle (Base & Height)", fields: [{ k: "b",  l: "Base (b)" }, { k: "h", l: "Height (h)" }] },
  triangle3S:     { label: "Triangle (3 Sides)",  fields: [{ k: "a",   l: "Side a" }, { k: "b", l: "Side b" }, { k: "c", l: "Side c" }] },
  circle:         { label: "Circle",              fields: [{ k: "r",   l: "Radius (r)" }] },
  parallelogram:  { label: "Parallelogram",       fields: [{ k: "b",   l: "Base (b)" }, { k: "h", l: "Height (h)" }] },
  trapezoid:      { label: "Trapezoid",           fields: [{ k: "a",   l: "Parallel Side a" }, { k: "b", l: "Parallel Side b" }, { k: "h", l: "Height (h)" }] },
  rhombus:        { label: "Rhombus",             fields: [{ k: "d1",  l: "Diagonal 1 (d₁)" }, { k: "d2", l: "Diagonal 2 (d₂)" }] },
  ellipse:        { label: "Ellipse",             fields: [{ k: "a",   l: "Semi-major axis (a)" }, { k: "b", l: "Semi-minor axis (b)" }] },
  sector:         { label: "Sector",              fields: [{ k: "r",   l: "Radius (r)" }, { k: "theta", l: "Central angle θ (°)" }] },
  polygon:        { label: "Regular Polygon",     fields: [{ k: "n",   l: "Number of sides (n)" }, { k: "s", l: "Side length (s)" }] },
};

const FORMULAS = {
  square:        "A = a²",
  rectangle:     "A = l × w",
  triangleBH:    "A = ½ × b × h",
  triangle3S:    "A = √(s(s−a)(s−b)(s−c)), s = (a+b+c)/2 (Heron's)",
  circle:        "A = πr²",
  parallelogram: "A = b × h",
  trapezoid:     "A = ½(a + b) × h",
  rhombus:       "A = (d₁ × d₂) / 2",
  ellipse:       "A = π × a × b",
  sector:        "A = (θ/360°) × πr²",
  polygon:       "A = (n × s²) / (4 × tan(π/n))",
};

function calcArea(shape, v) {
  const { a, b, c, l, w, h, r, d1, d2, theta, n, s } = v;
  switch (shape) {
    case "square":        return a ** 2;
    case "rectangle":     return l * w;
    case "triangleBH":    return 0.5 * b * h;
    case "triangle3S": {
      const sp = (a + b + c) / 2;
      const val = sp * (sp - a) * (sp - b) * (sp - c);
      if (val < 0) return null;
      return Math.sqrt(val);
    }
    case "circle":        return PI * r ** 2;
    case "parallelogram": return b * h;
    case "trapezoid":     return 0.5 * (a + b) * h;
    case "rhombus":       return (d1 * d2) / 2;
    case "ellipse":       return PI * a * b;
    case "sector":        return (theta / 360) * PI * r ** 2;
    case "polygon": {
      if (n < 3) return null;
      return (n * s ** 2) / (4 * Math.tan(PI / n));
    }
    default: return null;
  }
}

export default function AreaCalculator() {
  const [shape, setShape] = useState("rectangle");
  const [vals, setVals] = useState({ l: "8", w: "5" });

  const set = (key, val) => setVals(prev => ({ ...prev, [key]: val }));
  const fields = SHAPES[shape].fields;

  const result = useMemo(() => {
    const nums = {};
    for (const f of fields) {
      const v = parseFloat(vals[f.k]);
      if (isNaN(v) || v <= 0) return null;
      nums[f.k] = v;
    }
    // Triangle validity check
    if (shape === "triangle3S") {
      const { a, b, c } = nums;
      if (a + b <= c || a + c <= b || b + c <= a)
        return { error: "Invalid triangle: sum of any two sides must exceed the third." };
    }
    if (shape === "polygon" && nums.n < 3)
      return { error: "A polygon must have at least 3 sides." };

    const area = calcArea(shape, nums);
    if (area === null || !isFinite(area) || area < 0) return null;

    // Extra: perimeter where easy
    let perimeter = null;
    if (shape === "square")       perimeter = 4 * nums.a;
    if (shape === "rectangle")    perimeter = 2 * (nums.l + nums.w);
    if (shape === "triangle3S")   perimeter = nums.a + nums.b + nums.c;
    if (shape === "circle")       perimeter = 2 * PI * nums.r;
    if (shape === "ellipse")      perimeter = PI * (3 * (nums.a + nums.b) - Math.sqrt((3 * nums.a + nums.b) * (nums.a + 3 * nums.b)));
    if (shape === "polygon")      perimeter = nums.n * nums.s;

    return { area, perimeter };
  }, [shape, vals, fields]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Area Calculator</h1>
        <p className="muted">
          Calculate the area of common 2D shapes: rectangle, triangle, circle, trapezoid, ellipse, sector, polygon, and more.
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
            <>
              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                  Area — {SHAPES[shape].label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                  {fmt(result.area)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>square units</div>
              </div>
              {result.perimeter !== null && result.perimeter !== undefined && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "#f5f3ff", borderRadius: 10, fontFamily: "monospace", fontSize: 14, color: "#6b7a9e" }}>
                  Perimeter / Circumference: <strong style={{ color: "#4f46e5" }}>{fmt(result.perimeter)}</strong>
                </div>
              )}
            </>
          ) : null}

          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontFamily: "monospace", fontSize: 12, color: "#4f46e5", border: "1px solid rgba(99,102,241,0.1)" }}>
            {FORMULAS[shape]}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Area Formulas</h2>
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
