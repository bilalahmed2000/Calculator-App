import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ═══════════════════════════════════════════════════════════
   UNIT CONVERSION
═══════════════════════════════════════════════════════════ */
const UNITS = ["feet", "inches", "yards", "meters", "centimeters"];

function toFeet(value, unit) {
  switch (unit) {
    case "feet":        return value;
    case "inches":      return value / 12;
    case "yards":       return value * 3;
    case "meters":      return value * 3.280839895;
    case "centimeters": return value * 0.03280839895;
    default:            return value;
  }
}

/* ═══════════════════════════════════════════════════════════
   CALCULATION HELPERS
═══════════════════════════════════════════════════════════ */

/** Build a result object from a raw cubic-feet volume. */
function computeResult(cuFtRaw) {
  const cuFt   = cuFtRaw;
  const cuYd   = cuFt / 27;
  const cuM    = cuFt * 0.028316846592;
  const lbs    = cuFt * 133;
  const kg     = cuM  * 2130;
  const bags60 = lbs  / 60;
  const bags80 = lbs  / 80;
  return {
    cuFt:   dec2(cuFt),
    cuYd:   dec2(cuYd),
    cuM:    dec2(cuM),
    lbs:    Math.round(lbs).toLocaleString(),
    kg:     Math.round(kg).toLocaleString(),
    bags60: dec2(bags60),
    bags80: dec2(bags80),
  };
}

function dec2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/* ═══════════════════════════════════════════════════════════
   SECTION STATE FACTORY
   Each dimension key gets two state fields:  key_v (value) and key_u (unit).
   Example: makeSectionState(["l","w","h"]) → { qty:"1", l_v:"", l_u:"feet", ... }
═══════════════════════════════════════════════════════════ */
function makeSectionState(keys) {
  const obj = { qty: "1" };
  keys.forEach(k => {
    obj[k + "_v"] = "";
    obj[k + "_u"] = "feet";
  });
  return obj;
}

/** Read a dimension from state and convert to feet. Returns NaN if invalid. */
function valFt(state, key) {
  const v = parseFloat(state[key + "_v"]);
  return isNaN(v) ? NaN : toFeet(v, state[key + "_u"]);
}

/** Validate all dimension fields + qty. Returns false and sets error if invalid. */
function validate(state, dimFields, setError, setResult) {
  const qty = parseInt(state.qty, 10);
  if (isNaN(qty) || qty < 1) {
    setError("Quantity must be a positive whole number (≥ 1).");
    setResult(null);
    return false;
  }
  for (const [key, label] of dimFields) {
    const v = parseFloat(state[key + "_v"]);
    if (isNaN(v) || v <= 0) {
      setError(`"${label}" must be a positive number.`);
      setResult(null);
      return false;
    }
  }
  setError("");
  return true;
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS  — defined OUTSIDE main component
   so React never unmounts/remounts them on re-render.
═══════════════════════════════════════════════════════════ */

const inputSt = {
  background: "#fff", color: "#1e1b4b",
  border: "1px solid #ccc", borderRadius: 6,
  padding: "8px 10px", fontSize: 14,
  outline: "none", fontFamily: "inherit",
  width: "100%", boxSizing: "border-box",
};
const selectSt = {
  background: "#f8f9ff", color: "#1e1b4b",
  border: "1px solid #ccc", borderRadius: 6,
  padding: "8px 6px", fontSize: 13,
  outline: "none", cursor: "pointer",
  width: "100%", boxSizing: "border-box",
};
const fieldLabel = {
  display: "block", fontSize: 10.5, fontWeight: 700,
  color: "#6b7a9e", marginBottom: 4, letterSpacing: "0.4px",
  textTransform: "uppercase",
};
const blueBar = {
  background: "#dbeafe", border: "1px solid #93c5fd",
  borderRadius: 6, padding: "9px 14px", marginBottom: 14,
  color: "#1d4ed8", fontSize: 13.5, fontWeight: 500,
  display: "flex", alignItems: "center", gap: 8,
};
const grayBox = {
  background: "#f5f5f5", border: "1px solid #ddd",
  borderRadius: 8, padding: "16px",
};
const thSt = {
  padding: "8px 12px", background: "#f0f0f0", color: "#444",
  fontWeight: 700, fontSize: 13, border: "1px solid #ccc", textAlign: "left",
};
const tdSt = { padding: "8px 12px", border: "1px solid #e5e7eb", fontSize: 14 };
const dimGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: 14,
  marginBottom: 16,
};
const btnGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

/** Number input + unit dropdown for one dimension. */
function DimField({ state, setter, fieldKey, label }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="0"
          value={state[fieldKey + "_v"]}
          onChange={e => setter(p => ({ ...p, [fieldKey + "_v"]: e.target.value }))}
          style={inputSt}
        />
        <select
          value={state[fieldKey + "_u"]}
          onChange={e => setter(p => ({ ...p, [fieldKey + "_u"]: e.target.value }))}
          style={selectSt}
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

/** Quantity integer input. */
function QtyField({ state, setter }) {
  return (
    <div>
      <label style={fieldLabel}>Quantity</label>
      <input
        type="number"
        min="1"
        step="1"
        placeholder="1"
        value={state.qty}
        onChange={e => setter(p => ({ ...p, qty: e.target.value }))}
        style={{ ...inputSt, maxWidth: 90 }}
      />
    </div>
  );
}

/** Green result card shown above a section after Calculate. */
function ResultBlock({ r }) {
  return (
    <section className="card" style={{ marginBottom: 18 }}>
      <div className="result-header"><span>Result</span></div>

      {/* Volume KPIs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          { label: "Cubic Feet",   val: r.cuFt, sub: "ft³",  color: "#065f46" },
          { label: "Cubic Yards",  val: r.cuYd, sub: "yd³",  color: "#4f46e5" },
          { label: "Cubic Meters", val: r.cuM,  sub: "m³",   color: "#0369a1" },
        ].map(k => (
          <div key={k.label} className="kpi" style={{ flex: 1, minWidth: 100 }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color, fontSize: "clamp(17px,2.4vw,22px)" }}>
              {k.val}
            </div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bag table */}
      <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={thSt}>Bag Type</th>
              <th style={thSt}>Total Weight Needed</th>
              <th style={thSt}>Number of Bags</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdSt, fontWeight: 700 }}>60 lb bags</td>
              <td style={{ ...tdSt, fontFamily: "monospace" }}>
                {r.lbs} lbs &nbsp;/&nbsp; {r.kg} kg
              </td>
              <td style={{ ...tdSt, fontFamily: "monospace", fontWeight: 700, color: "#065f46" }}>
                {r.bags60}
              </td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ ...tdSt, fontWeight: 700 }}>80 lb bags</td>
              <td style={{ ...tdSt, fontFamily: "monospace" }}>
                {r.lbs} lbs &nbsp;/&nbsp; {r.kg} kg
              </td>
              <td style={{ ...tdSt, fontFamily: "monospace", fontWeight: 700, color: "#065f46" }}>
                {r.bags80}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, color: "#6b7a9e", fontSize: 12, lineHeight: 1.6 }}>
        * Density: 133 lb/ft³ (2,130 kg/m³). Add 5–10% extra for waste and spillage.
        For projects over 1 cubic yard, consider ordering ready-mix concrete.
      </p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR DATA
═══════════════════════════════════════════════════════════ */
const SIDEBAR_LINKS = [
  { label: "Concrete Calculator",   to: "/concrete-calculator" },
  { label: "BMI Calculator",        to: "/bmi" },
  { label: "Age Calculator",        to: "/age" },
  { label: "Time Calculator",       to: "/time" },
  { label: "Hours Calculator",      to: "/hours-calculator" },
  { label: "Percentage Calculator", to: "/percentage-calculator" },
  { label: "Loan Calculator",       to: "/loan" },
  { label: "Mortgage Calculator",   to: "/mortgage" },
  { label: "GPA Calculator",        to: "/gpa-calculator" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ConcreteCalculator() {
  /* ── Section 1: Slabs / Square Footings / Walls ── */
  const [s1, setS1] = useState(() => makeSectionState(["l", "w", "h"]));
  const [r1, setR1] = useState(null);
  const [e1, setE1] = useState("");

  /* ── Section 2: Hole / Column / Round Footings ── */
  const [s2, setS2] = useState(() => makeSectionState(["d", "h"]));
  const [r2, setR2] = useState(null);
  const [e2, setE2] = useState("");

  /* ── Section 3: Circular Slab / Tube ── */
  const [s3, setS3] = useState(() => makeSectionState(["d1", "d2", "h"]));
  const [r3, setR3] = useState(null);
  const [e3, setE3] = useState("");

  /* ── Section 4: Curb and Gutter Barrier ── */
  const [s4, setS4] = useState(() =>
    makeSectionState(["curbDepth", "gutterWidth", "curbHeight", "flagThick", "len"])
  );
  const [r4, setR4] = useState(null);
  const [e4, setE4] = useState("");

  /* ── Section 5: Stairs ── */
  const [s5, setS5] = useState(() => ({
    ...makeSectionState(["run", "rise", "width", "platform"]),
    steps: "3",
  }));
  const [r5, setR5] = useState(null);
  const [e5, setE5] = useState("");

  const [search, setSearch] = useState("");

  /* ─────────────────────────────── CALCULATORS ─────────────────────────────── */

  /* S1 — Rectangular prism: V = l × w × h × qty */
  function calcS1() {
    const fields = [["l","Length"], ["w","Width"], ["h","Thickness / Height"]];
    if (!validate(s1, fields, setE1, setR1)) return;
    const cuFt = valFt(s1,"l") * valFt(s1,"w") * valFt(s1,"h") * parseInt(s1.qty, 10);
    setR1(computeResult(cuFt));
  }

  /* S2 — Cylinder: V = π × r² × h × qty */
  function calcS2() {
    const fields = [["d","Diameter"], ["h","Depth / Height"]];
    if (!validate(s2, fields, setE2, setR2)) return;
    const r   = valFt(s2,"d") / 2;
    const cuFt = Math.PI * r * r * valFt(s2,"h") * parseInt(s2.qty, 10);
    setR2(computeResult(cuFt));
  }

  /* S3 — Cylindrical ring: V = π × ((d1/2)² − (d2/2)²) × h × qty */
  function calcS3() {
    const fields = [["d1","Outer Diameter"], ["d2","Inner Diameter"], ["h","Length / Height"]];
    if (!validate(s3, fields, setE3, setR3)) return;
    const d1ft = valFt(s3,"d1");
    const d2ft = valFt(s3,"d2");
    if (d2ft >= d1ft) {
      setE3("Inner Diameter must be smaller than Outer Diameter.");
      setR3(null);
      return;
    }
    const cuFt = Math.PI * ((d1ft / 2) ** 2 - (d2ft / 2) ** 2) * valFt(s3,"h") * parseInt(s3.qty, 10);
    setR3(computeResult(cuFt));
  }

  /* S4 — L-shaped cross-section curb:
     V = (curbDepth × curbHeight + gutterWidth × flagThick) × length × qty */
  function calcS4() {
    const fields = [
      ["curbDepth","Curb Depth"], ["gutterWidth","Gutter Width"],
      ["curbHeight","Curb Height"], ["flagThick","Flag Thickness"], ["len","Length"],
    ];
    if (!validate(s4, fields, setE4, setR4)) return;
    const cross = valFt(s4,"curbDepth") * valFt(s4,"curbHeight")
                + valFt(s4,"gutterWidth") * valFt(s4,"flagThick");
    const cuFt  = cross * valFt(s4,"len") * parseInt(s4.qty, 10);
    setR4(computeResult(cuFt));
  }

  /* S5 — Stair wedge + platform:
     V = width × rise × numSteps × (0.5 × run × numSteps + platformDepth) */
  function calcS5() {
    const numSteps = parseInt(s5.steps, 10);
    if (isNaN(numSteps) || numSteps < 1) {
      setE5("Number of Steps must be a positive whole number (≥ 1).");
      setR5(null);
      return;
    }
    const dimFields = [["run","Run"], ["rise","Rise"], ["width","Width"], ["platform","Platform Depth"]];
    if (!validate(s5, dimFields, setE5, setR5)) return;
    const run  = valFt(s5,"run");
    const rise = valFt(s5,"rise");
    const wid  = valFt(s5,"width");
    const plat = valFt(s5,"platform");
    /* Wedge of stair structure: triangle cross-section × width + platform rectangle */
    const cuFt = wid * rise * numSteps * (0.5 * run * numSteps + plat);
    setR5(computeResult(cuFt));
  }

  /* ─────────────────────────────── CLEARS ─────────────────────────────── */
  function clearS1() { setS1(makeSectionState(["l","w","h"])); setR1(null); setE1(""); }
  function clearS2() { setS2(makeSectionState(["d","h"])); setR2(null); setE2(""); }
  function clearS3() { setS3(makeSectionState(["d1","d2","h"])); setR3(null); setE3(""); }
  function clearS4() {
    setS4(makeSectionState(["curbDepth","gutterWidth","curbHeight","flagThick","len"]));
    setR4(null); setE4("");
  }
  function clearS5() {
    setS5({ ...makeSectionState(["run","rise","width","platform"]), steps: "3" });
    setR5(null); setE5("");
  }

  const filteredLinks = SIDEBAR_LINKS.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="calc-wrap">

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto 14px", fontSize: 12.5, color: "#888" }}>
        <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>home</Link>
        <span style={{ margin: "0 5px" }}>/</span>
        <span>other</span>
        <span style={{ margin: "0 5px" }}>/</span>
        <span style={{ color: "#444" }}>concrete calculator</span>
      </div>

      {/* Title */}
      <div style={{ maxWidth: 1100, margin: "0 auto 22px" }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, margin: "0 0 8px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Concrete Calculator
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          Estimate concrete volume and pre-mixed bag counts for slabs, columns, circular slabs,
          curb &amp; gutter barriers, and stairs. Based on 133 lb/ft³ (2,130 kg/m³) density.
          All dimensions accept feet, inches, yards, meters, or centimeters.
        </p>
      </div>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ══════════════════════════════════════════════════════
              SECTION 1 — Slabs, Square Footings, or Walls
          ══════════════════════════════════════════════════════ */}
          {r1 && <ResultBlock r={r1} />}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Slabs, Square Footings, or Walls</h2>
            <p className="rng-desc">
              Rectangular prism. Formula: <em>V = Length × Width × Thickness × Quantity</em>
            </p>
            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBox}>
              <div style={dimGrid}>
                <DimField state={s1} setter={setS1} fieldKey="l" label="Length (l)" />
                <DimField state={s1} setter={setS1} fieldKey="w" label="Width (w)" />
                <DimField state={s1} setter={setS1} fieldKey="h" label="Thickness / Height (h)" />
                <QtyField state={s1} setter={setS1} />
              </div>
              <div style={btnGrid}>
                <button type="button" className="btn-primary" onClick={calcS1}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clearS1}>Clear</button>
              </div>
            </div>
            {e1 && <div className="rng-error" style={{ marginTop: 12 }}>{e1}</div>}
          </section>

          {/* ══════════════════════════════════════════════════════
              SECTION 2 — Hole, Column, or Round Footings
          ══════════════════════════════════════════════════════ */}
          {r2 && <ResultBlock r={r2} />}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Hole, Column, or Round Footings</h2>
            <p className="rng-desc">
              Cylinder. Formula: <em>V = π × (Diameter / 2)² × Depth × Quantity</em>
            </p>
            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBox}>
              <div style={dimGrid}>
                <DimField state={s2} setter={setS2} fieldKey="d" label="Diameter (d)" />
                <DimField state={s2} setter={setS2} fieldKey="h" label="Depth / Height (h)" />
                <QtyField state={s2} setter={setS2} />
              </div>
              <div style={btnGrid}>
                <button type="button" className="btn-primary" onClick={calcS2}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clearS2}>Clear</button>
              </div>
            </div>
            {e2 && <div className="rng-error" style={{ marginTop: 12 }}>{e2}</div>}
          </section>

          {/* ══════════════════════════════════════════════════════
              SECTION 3 — Circular Slab or Tube
          ══════════════════════════════════════════════════════ */}
          {r3 && <ResultBlock r={r3} />}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Circular Slab or Tube</h2>
            <p className="rng-desc">
              Cylindrical ring. Formula:{" "}
              <em>V = π × ((d1/2)² − (d2/2)²) × Height × Quantity</em>.{" "}
              Inner diameter must be smaller than outer diameter.
            </p>
            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBox}>
              <div style={dimGrid}>
                <DimField state={s3} setter={setS3} fieldKey="d1" label="Outer Diameter (d1)" />
                <DimField state={s3} setter={setS3} fieldKey="d2" label="Inner Diameter (d2)" />
                <DimField state={s3} setter={setS3} fieldKey="h"  label="Length / Height (h)" />
                <QtyField state={s3} setter={setS3} />
              </div>
              <div style={btnGrid}>
                <button type="button" className="btn-primary" onClick={calcS3}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clearS3}>Clear</button>
              </div>
            </div>
            {e3 && <div className="rng-error" style={{ marginTop: 12 }}>{e3}</div>}
          </section>

          {/* ══════════════════════════════════════════════════════
              SECTION 4 — Curb and Gutter Barrier
          ══════════════════════════════════════════════════════ */}
          {r4 && <ResultBlock r={r4} />}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Curb and Gutter Barrier</h2>
            <p className="rng-desc">
              L-shaped cross-section extruded along a length. Formula:{" "}
              <em>V = (Curb Depth × Curb Height + Gutter Width × Flag Thickness) × Length × Qty</em>
            </p>
            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBox}>
              <div style={dimGrid}>
                <DimField state={s4} setter={setS4} fieldKey="curbDepth"   label="Curb Depth" />
                <DimField state={s4} setter={setS4} fieldKey="gutterWidth" label="Gutter Width" />
                <DimField state={s4} setter={setS4} fieldKey="curbHeight"  label="Curb Height" />
                <DimField state={s4} setter={setS4} fieldKey="flagThick"   label="Flag Thickness" />
                <DimField state={s4} setter={setS4} fieldKey="len"         label="Length" />
                <QtyField state={s4} setter={setS4} />
              </div>
              <div style={btnGrid}>
                <button type="button" className="btn-primary" onClick={calcS4}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clearS4}>Clear</button>
              </div>
            </div>
            {e4 && <div className="rng-error" style={{ marginTop: 12 }}>{e4}</div>}
          </section>

          {/* ══════════════════════════════════════════════════════
              SECTION 5 — Stairs
          ══════════════════════════════════════════════════════ */}
          {r5 && <ResultBlock r={r5} />}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Stairs</h2>
            <p className="rng-desc">
              Stair wedge + platform. Formula:{" "}
              <em>V = Width × Rise × Steps × (0.5 × Run × Steps + Platform Depth)</em>
            </p>
            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBox}>
              <div style={dimGrid}>
                <DimField state={s5} setter={setS5} fieldKey="run"      label="Run (tread depth)" />
                <DimField state={s5} setter={setS5} fieldKey="rise"     label="Rise (step height)" />
                <DimField state={s5} setter={setS5} fieldKey="width"    label="Width" />
                <DimField state={s5} setter={setS5} fieldKey="platform" label="Platform Depth" />
                <div>
                  <label style={fieldLabel}>Number of Steps</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="3"
                    value={s5.steps}
                    onChange={e => setS5(p => ({ ...p, steps: e.target.value }))}
                    style={{ ...inputSt, maxWidth: 110 }}
                  />
                </div>
              </div>
              <div style={btnGrid}>
                <button type="button" className="btn-primary" onClick={calcS5}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clearS5}>Clear</button>
              </div>
            </div>
            {e5 && <div className="rng-error" style={{ marginTop: 12 }}>{e5}</div>}
          </section>

        </div>

        {/* ══════════════════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════════════════ */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card" style={{ marginBottom: 16 }}>
            <h3 className="rng-sidebar-title">Search</h3>
            <input
              type="text"
              placeholder="Search calculators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 8,
                padding: "8px 10px", fontSize: 13, color: "#1e1b4b",
                background: "#f8f9ff", outline: "none",
              }}
            />
          </div>

          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Other Calculators</h3>
            <ul className="rng-sidebar-list">
              {filteredLinks.map(lnk => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/concrete-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
              {filteredLinks.length === 0 && (
                <li style={{ fontSize: 12, color: "#aaa", padding: "8px 10px" }}>No results</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
