import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const PI = Math.PI;
const fmt = v => isFinite(v) && v >= 0 ? (Math.round(v * 1e6) / 1e6).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

const SHAPES = {
  sphere:         { label: "Sphere",            fields: [{ k: "r",  l: "Radius (r)" }] },
  cube:           { label: "Cube",              fields: [{ k: "a",  l: "Side Length (a)" }] },
  box:            { label: "Rectangular Box",   fields: [{ k: "l",  l: "Length (l)" }, { k: "w", l: "Width (w)" }, { k: "h", l: "Height (h)" }] },
  cylinder:       { label: "Cylinder",          fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Height (h)" }] },
  cone:           { label: "Cone",              fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Height (h)" }] },
  capsule:        { label: "Capsule",           fields: [{ k: "r",  l: "Radius (r)" }, { k: "h", l: "Cylinder Height (h)" }] },
  conicalFrustum: { label: "Conical Frustum",   fields: [{ k: "R",  l: "Top Radius (R)" }, { k: "r", l: "Bottom Radius (r)" }, { k: "h", l: "Height (h)" }] },
  pyramid:        { label: "Square Pyramid",    fields: [{ k: "a",  l: "Base Side (a)" }, { k: "h", l: "Height (h)" }] },
};

function calcSA(shape, v) {
  const { r, R, a, l, w, h } = v;
  switch (shape) {
    case "sphere": return {
      total: 4 * PI * r ** 2,
    };
    case "cube": return {
      total: 6 * a ** 2,
    };
    case "box": return {
      lateral: 2 * (l * h + w * h),
      base: 2 * l * w,
      total: 2 * (l * w + l * h + w * h),
    };
    case "cylinder": {
      const lateral = 2 * PI * r * h;
      const base = 2 * PI * r ** 2;
      return { lateral, base, total: lateral + base };
    }
    case "cone": {
      const slant = Math.sqrt(r ** 2 + h ** 2);
      const lateral = PI * r * slant;
      const base = PI * r ** 2;
      return { lateral, base, slant, total: lateral + base };
    }
    case "capsule": return {
      total: 4 * PI * r ** 2 + 2 * PI * r * h,
    };
    case "conicalFrustum": {
      const slant = Math.sqrt((R - r) ** 2 + h ** 2);
      const lateral = PI * (R + r) * slant;
      const bases = PI * (R ** 2 + r ** 2);
      return { lateral, bases, slant, total: lateral + bases };
    }
    case "pyramid": {
      const slant = Math.sqrt(h ** 2 + (a / 2) ** 2);
      const lateral = 2 * a * slant;
      const base = a ** 2;
      return { lateral, base, slant, total: lateral + base };
    }
    default: return null;
  }
}

const FORMULAS = {
  sphere:         "SA = 4πr²",
  cube:           "SA = 6a²",
  box:            "SA = 2(lw + lh + wh)",
  cylinder:       "SA = 2πr(r + h)",
  cone:           "SA = πr(r + l),  l = √(r² + h²)",
  capsule:        "SA = 2πr(2r + h)",
  conicalFrustum: "SA = π(R + r)l + π(R² + r²),  l = √((R−r)² + h²)",
  pyramid:        "SA = a² + 2al,  l = √(h² + (a/2)²)",
};

export default function SurfaceAreaCalculator() {
  const [shape, setShape] = useState("cylinder");
  const [vals, setVals] = useState({ r: "4", h: "10" });

  const set = (key, val) => setVals(prev => ({ ...prev, [key]: val }));
  const fields = SHAPES[shape].fields;

  const result = useMemo(() => {
    const nums = {};
    for (const f of fields) {
      const v = parseFloat(vals[f.k]);
      if (isNaN(v) || v <= 0) return null;
      nums[f.k] = v;
    }
    if (shape === "conicalFrustum" && nums.R === nums.r)
      return { error: "R and r cannot be equal (use Cylinder instead)." };
    const sa = calcSA(shape, nums);
    if (!sa || !isFinite(sa.total)) return null;
    return sa;
  }, [shape, vals, fields]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Surface Area Calculator</h1>
        <p className="muted">
          Calculate the total and lateral surface area of common 3D shapes: sphere, cube, cylinder, cone, pyramid, and more.
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
                Total Surface Area — {SHAPES[shape].label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                {fmt(result.total)}
              </div>
              <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>square units</div>
            </div>
          ) : null}

          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontFamily: "monospace", fontSize: 12, color: "#4f46e5", border: "1px solid rgba(99,102,241,0.1)" }}>
            {FORMULAS[shape]}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Breakdown</h2>

          {result ? (
            <table className="table" style={{ marginBottom: 16 }}>
              <thead><tr><th>Component</th><th>Value</th></tr></thead>
              <tbody>
                {result.lateral !== undefined && (
                  <tr><td>Lateral surface</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.lateral)}</td></tr>
                )}
                {result.base !== undefined && (
                  <tr><td>Base(s)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.base)}</td></tr>
                )}
                {result.bases !== undefined && (
                  <tr><td>Top + Bottom bases</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.bases)}</td></tr>
                )}
                {result.slant !== undefined && (
                  <tr><td>Slant height (l)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.slant)}</td></tr>
                )}
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Total Surface Area</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.total)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Enter dimensions to calculate surface area.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 16 }}>Surface Area Formulas</h3>
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
