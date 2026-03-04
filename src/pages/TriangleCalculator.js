import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/TriangleCalculator.css";

/* ---------- Sidebar links ---------- */
const mathLinks = [
  { label: "Scientific Calculator", to: "/scientific" },
  { label: "Fraction Calculator", to: "/fraction-calculator" },
  { label: "Percentage Calculator", to: "/percentage-calculator" },
  { label: "Random Number Generator", to: "/random-number-generator" },
  { label: "Triangle Calculator", to: "/triangle-calculator" },
  { label: "Standard Deviation Calculator", to: "/std-dev" },
  { label: "Number Sequence Calculator", to: "/number-sequence" },
];

/* ---------- Triangle solver ---------- */
function solveTriangle(raw, unit) {
  const toR = unit === "deg" ? (d) => (d * Math.PI) / 180 : (r) => r;
  const fromR = unit === "deg" ? (r) => (r * 180) / Math.PI : (r) => r;

  /* Parse raw string inputs into numbers (or null if blank) */
  const parse = (v) => {
    if (v === "" || v == null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  let A = parse(raw.A);
  let B = parse(raw.B);
  let C = parse(raw.C);
  let a = parse(raw.a);
  let b = parse(raw.b);
  let c = parse(raw.c);

  const knownCount = [A, B, C, a, b, c].filter((x) => x !== null).length;
  const sideCount = [a, b, c].filter((x) => x !== null).length;

  if (knownCount < 3) return { error: "Please enter at least 3 values." };
  if (sideCount === 0)
    return { error: "At least one side length must be provided." };

  /* Validate ranges */
  if ([A, B, C].some((x) => x !== null && x <= 0))
    return { error: "All angles must be positive." };
  if ([a, b, c].some((x) => x !== null && x <= 0))
    return { error: "All sides must be positive." };
  if (unit === "deg") {
    if ([A, B, C].some((x) => x !== null && x >= 180))
      return { error: "Each angle must be less than 180°." };
  } else {
    if ([A, B, C].some((x) => x !== null && x >= Math.PI))
      return { error: "Each angle must be less than π radians." };
  }

  /* Convert angles to radians for calculation */
  if (A !== null) A = toR(A);
  if (B !== null) B = toR(B);
  if (C !== null) C = toR(C);

  /* Derive third angle if two are known */
  if (A !== null && B !== null && C === null) C = Math.PI - A - B;
  else if (A !== null && C !== null && B === null) B = Math.PI - A - C;
  else if (B !== null && C !== null && A === null) A = Math.PI - B - C;

  /* Validate derived angles */
  if (A !== null && A <= 0) return { error: "Angles must sum to 180° (or π rad)." };
  if (B !== null && B <= 0) return { error: "Angles must sum to 180° (or π rad)." };
  if (C !== null && C <= 0) return { error: "Angles must sum to 180° (or π rad)." };

  const solutions = [];

  /* Helper: build a solution from rad angles */
  const finish = (Ar, Br, Cr, av, bv, cv) => {
    if ([Ar, Br, Cr].some((x) => x <= 0 || x >= Math.PI)) return null;
    if ([av, bv, cv].some((x) => x <= 0)) return null;
    /* Angle sum check (tolerance) */
    if (Math.abs(Ar + Br + Cr - Math.PI) > 1e-6) return null;
    const s = (av + bv + cv) / 2;
    const areaVal = Math.sqrt(Math.max(0, s * (s - av) * (s - bv) * (s - cv)));
    return {
      A: fromR(Ar),
      B: fromR(Br),
      C: fromR(Cr),
      a: av,
      b: bv,
      c: cv,
      perimeter: av + bv + cv,
      semiperimeter: s,
      area: areaVal,
    };
  };

  /* ===== SSS ===== */
  if (a !== null && b !== null && c !== null) {
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const cosB = (a * a + c * c - b * b) / (2 * a * c);
    const cosC = (a * a + b * b - c * c) / (2 * a * b);
    if (Math.abs(cosA) > 1 || Math.abs(cosB) > 1 || Math.abs(cosC) > 1)
      return { error: "No valid triangle: triangle inequality violated." };
    const sol = finish(Math.acos(cosA), Math.acos(cosB), Math.acos(cosC), a, b, c);
    if (sol) solutions.push(sol);
  }
  /* ===== All 3 angles + at least 1 side (AAS/ASA) ===== */
  else if (A !== null && B !== null && C !== null) {
    if (Math.abs(A + B + C - Math.PI) > 1e-4)
      return { error: "Angles do not sum to 180° — check your values." };
    /* Determine ratio from any known side */
    let ratio = null;
    if (a !== null) ratio = a / Math.sin(A);
    else if (b !== null) ratio = b / Math.sin(B);
    else ratio = c / Math.sin(C);
    const av = a !== null ? a : ratio * Math.sin(A);
    const bv = b !== null ? b : ratio * Math.sin(B);
    const cv = c !== null ? c : ratio * Math.sin(C);
    const sol = finish(A, B, C, av, bv, cv);
    if (sol) solutions.push(sol);
  }
  /* ===== 2 sides + 1 angle ===== */
  else if (sideCount === 2) {
    /* ---- SAS cases (angle is included between the two known sides) ---- */
    /* A is the included angle between sides b and c */
    if (A !== null && b !== null && c !== null) {
      const aSq = b * b + c * c - 2 * b * c * Math.cos(A);
      if (aSq > 0) {
        const av = Math.sqrt(aSq);
        const cosB = (av * av + c * c - b * b) / (2 * av * c);
        const cosC = (av * av + b * b - c * c) / (2 * av * b);
        if (Math.abs(cosB) <= 1 && Math.abs(cosC) <= 1) {
          const sol = finish(A, Math.acos(cosB), Math.acos(cosC), av, b, c);
          if (sol) solutions.push(sol);
        }
      }
    }
    /* B is the included angle between sides a and c */
    else if (B !== null && a !== null && c !== null) {
      const bSq = a * a + c * c - 2 * a * c * Math.cos(B);
      if (bSq > 0) {
        const bv = Math.sqrt(bSq);
        const cosA = (bv * bv + c * c - a * a) / (2 * bv * c);
        const cosC = (a * a + bv * bv - c * c) / (2 * a * bv);
        if (Math.abs(cosA) <= 1 && Math.abs(cosC) <= 1) {
          const sol = finish(Math.acos(cosA), B, Math.acos(cosC), a, bv, c);
          if (sol) solutions.push(sol);
        }
      }
    }
    /* C is the included angle between sides a and b */
    else if (C !== null && a !== null && b !== null) {
      const cSq = a * a + b * b - 2 * a * b * Math.cos(C);
      if (cSq > 0) {
        const cv = Math.sqrt(cSq);
        const cosA = (b * b + cv * cv - a * a) / (2 * b * cv);
        const cosB = (a * a + cv * cv - b * b) / (2 * a * cv);
        if (Math.abs(cosA) <= 1 && Math.abs(cosB) <= 1) {
          const sol = finish(Math.acos(cosA), Math.acos(cosB), C, a, b, cv);
          if (sol) solutions.push(sol);
        }
      }
    }
    /* ---- SSA cases (ambiguous) ---- */
    /* Known: sides a & b, angle A (A opposite a) */
    else if (A !== null && a !== null && b !== null) {
      const sinB = (b * Math.sin(A)) / a;
      if (sinB > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const B1 = sinB > 1 ? Math.PI / 2 : Math.asin(sinB);
      const B2 = Math.PI - B1;
      const trySSA = (Bv) => {
        if (A + Bv >= Math.PI) return;
        const Cv = Math.PI - A - Bv;
        const cv = (a * Math.sin(Cv)) / Math.sin(A);
        const sol = finish(A, Bv, Cv, a, b, cv);
        if (sol) solutions.push(sol);
      };
      trySSA(B1);
      if (sinB < 1 - 1e-9) trySSA(B2);
    }
    /* Known: sides a & b, angle B (B opposite b) */
    else if (B !== null && a !== null && b !== null) {
      const sinA = (a * Math.sin(B)) / b;
      if (sinA > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const A1 = sinA > 1 ? Math.PI / 2 : Math.asin(sinA);
      const A2 = Math.PI - A1;
      const trySSA = (Av) => {
        if (B + Av >= Math.PI) return;
        const Cv = Math.PI - Av - B;
        const cv = (b * Math.sin(Cv)) / Math.sin(B);
        const sol = finish(Av, B, Cv, a, b, cv);
        if (sol) solutions.push(sol);
      };
      trySSA(A1);
      if (sinA < 1 - 1e-9) trySSA(A2);
    }
    /* Known: sides a & c, angle A (A opposite a) */
    else if (A !== null && a !== null && c !== null) {
      const sinC = (c * Math.sin(A)) / a;
      if (sinC > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const C1 = sinC > 1 ? Math.PI / 2 : Math.asin(sinC);
      const C2 = Math.PI - C1;
      const trySSA = (Cv) => {
        if (A + Cv >= Math.PI) return;
        const Bv = Math.PI - A - Cv;
        const bv = (a * Math.sin(Bv)) / Math.sin(A);
        const sol = finish(A, Bv, Cv, a, bv, c);
        if (sol) solutions.push(sol);
      };
      trySSA(C1);
      if (sinC < 1 - 1e-9) trySSA(C2);
    }
    /* Known: sides a & c, angle C (C opposite c) */
    else if (C !== null && a !== null && c !== null) {
      const sinA = (a * Math.sin(C)) / c;
      if (sinA > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const A1 = sinA > 1 ? Math.PI / 2 : Math.asin(sinA);
      const A2 = Math.PI - A1;
      const trySSA = (Av) => {
        if (C + Av >= Math.PI) return;
        const Bv = Math.PI - Av - C;
        const bv = (c * Math.sin(Bv)) / Math.sin(C);
        const sol = finish(Av, Bv, C, a, bv, c);
        if (sol) solutions.push(sol);
      };
      trySSA(A1);
      if (sinA < 1 - 1e-9) trySSA(A2);
    }
    /* Known: sides b & c, angle B (B opposite b) */
    else if (B !== null && b !== null && c !== null) {
      const sinC = (c * Math.sin(B)) / b;
      if (sinC > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const C1 = sinC > 1 ? Math.PI / 2 : Math.asin(sinC);
      const C2 = Math.PI - C1;
      const trySSA = (Cv) => {
        if (B + Cv >= Math.PI) return;
        const Av = Math.PI - B - Cv;
        const av = (b * Math.sin(Av)) / Math.sin(B);
        const sol = finish(Av, B, Cv, av, b, c);
        if (sol) solutions.push(sol);
      };
      trySSA(C1);
      if (sinC < 1 - 1e-9) trySSA(C2);
    }
    /* Known: sides b & c, angle C (C opposite c) */
    else if (C !== null && b !== null && c !== null) {
      const sinB = (b * Math.sin(C)) / c;
      if (sinB > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const B1 = sinB > 1 ? Math.PI / 2 : Math.asin(sinB);
      const B2 = Math.PI - B1;
      const trySSA = (Bv) => {
        if (C + Bv >= Math.PI) return;
        const Av = Math.PI - Bv - C;
        const av = (c * Math.sin(Av)) / Math.sin(C);
        const sol = finish(Av, Bv, C, av, b, c);
        if (sol) solutions.push(sol);
      };
      trySSA(B1);
      if (sinB < 1 - 1e-9) trySSA(B2);
    } else {
      return { error: "Unable to solve with the given inputs. Please check your values." };
    }
  } else {
    return {
      error:
        "Unable to solve. Provide at least 3 values (sides + angles) including at least 1 side.",
    };
  }

  if (solutions.length === 0)
    return { error: "No valid triangle exists with these values." };

  return { solutions };
}

/* ---------- Format number ---------- */
function fmt(n) {
  if (n == null || isNaN(n)) return "—";
  /* Show up to 6 significant digits, strip trailing zeros */
  return parseFloat(n.toPrecision(8)).toString();
}

/* ---------- Component ---------- */
export default function TriangleCalculator() {
  const [vals, setVals] = useState({ A: "", B: "", C: "", a: "", b: "", c: "" });
  const [unit, setUnit] = useState("deg");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }));

  const calculate = () => {
    const res = solveTriangle(vals, unit);
    if (res.error) {
      setError(res.error);
      setResults(null);
    } else {
      setError("");
      setResults(res.solutions);
    }
  };

  const clear = () => {
    setVals({ A: "", B: "", C: "", a: "", b: "", c: "" });
    setResults(null);
    setError("");
  };

  const unitSym = unit === "deg" ? "°" : " rad";

  /* SVG triangle vertices (within 320 × 210 viewBox) */
  const Ax = 40, Ay = 188;
  const Bx = 280, By = 188;
  const Cx = 160, Cy = 18;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Triangle Calculator</h1>
        <p className="muted">
          Solve any triangle from SSS, SAS, ASA, AAS, or SSA. Enter at least 3
          values (including at least 1 side length) then click&nbsp;Calculate.
        </p>
      </header>

      <div className="tri-layout">
        {/* ====== Main content ====== */}
        <div className="tri-main">
          <section className="card">
            <h2 className="card-title">Triangle Input</h2>

            {/* Unit toggle */}
            <div className="tri-unit-row">
              <span className="tri-unit-label">Angle Unit:</span>
              <div className="tri-unit-tabs">
                <button
                  className={`tri-unit-tab${unit === "deg" ? " tri-unit-tab--active" : ""}`}
                  onClick={() => setUnit("deg")}
                  type="button"
                >
                  Degrees (°)
                </button>
                <button
                  className={`tri-unit-tab${unit === "rad" ? " tri-unit-tab--active" : ""}`}
                  onClick={() => setUnit("rad")}
                  type="button"
                >
                  Radians
                </button>
              </div>
            </div>

            {/* Triangle diagram with positioned inputs */}
            <div className="tri-diagram-wrap">
              {/* SVG triangle */}
              <svg
                className="tri-svg"
                viewBox="0 0 320 210"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Filled triangle */}
                <polygon
                  points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
                  fill="rgba(99,102,241,0.07)"
                  stroke="#6366f1"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* Vertex labels */}
                <text x={Ax - 14} y={Ay + 5} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">A</text>
                <text x={Bx + 6}  y={Ay + 5} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">B</text>
                <text x={Cx - 6}  y={Cy - 8} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">C</text>
                {/* Side labels (opposite naming: a opposite A, etc.) */}
                {/* side a = BC (right side) */}
                <text
                  x={(Bx + Cx) / 2 + 12}
                  y={(By + Cy) / 2 + 4}
                  fontSize="13"
                  fill="#7c3aed"
                  fontStyle="italic"
                  fontFamily="serif"
                >a</text>
                {/* side b = AC (left side) */}
                <text
                  x={(Ax + Cx) / 2 - 20}
                  y={(Ay + Cy) / 2 + 4}
                  fontSize="13"
                  fill="#7c3aed"
                  fontStyle="italic"
                  fontFamily="serif"
                >b</text>
                {/* side c = AB (bottom) */}
                <text
                  x={(Ax + Bx) / 2 - 4}
                  y={Ay + 18}
                  fontSize="13"
                  fill="#7c3aed"
                  fontStyle="italic"
                  fontFamily="serif"
                >c</text>
              </svg>

              {/* === Angle C — top center === */}
              <div className="tri-input-group tri-pos-C">
                <label className="tri-inp-label">Angle C</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.C}
                  onChange={(e) => set("C", e.target.value)}
                />
              </div>

              {/* === Side b — left === */}
              <div className="tri-input-group tri-pos-b">
                <label className="tri-inp-label">Side b</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.b}
                  onChange={(e) => set("b", e.target.value)}
                />
              </div>

              {/* === Side a — right === */}
              <div className="tri-input-group tri-pos-a">
                <label className="tri-inp-label">Side a</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.a}
                  onChange={(e) => set("a", e.target.value)}
                />
              </div>

              {/* === Angle A — bottom left === */}
              <div className="tri-input-group tri-pos-A">
                <label className="tri-inp-label">Angle A</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.A}
                  onChange={(e) => set("A", e.target.value)}
                />
              </div>

              {/* === Side c — bottom center === */}
              <div className="tri-input-group tri-pos-c">
                <label className="tri-inp-label">Side c</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.c}
                  onChange={(e) => set("c", e.target.value)}
                />
              </div>

              {/* === Angle B — bottom right === */}
              <div className="tri-input-group tri-pos-B">
                <label className="tri-inp-label">Angle B</label>
                <input
                  className="tri-inp"
                  type="number"
                  placeholder="—"
                  value={vals.B}
                  onChange={(e) => set("B", e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="tri-btn-row">
              <button type="button" className="btn-primary" onClick={calculate}>
                Calculate
              </button>
              <button type="button" className="btn-secondary" onClick={clear}>
                Clear
              </button>
            </div>

            {/* Error message */}
            {error && <div className="tri-error">{error}</div>}
          </section>

          {/* ====== Results ====== */}
          {results &&
            results.map((sol, i) => (
              <section className="card tri-result-card" key={i}>
                {results.length > 1 && (
                  <div className="tri-ambiguous-badge">
                    Solution {i + 1} of {results.length} — Ambiguous (SSA)
                  </div>
                )}
                <h2 className="card-title">
                  {results.length > 1 ? `Solution ${i + 1}` : "Results"}
                </h2>

                {/* Angles row */}
                <div className="tri-section-label">Angles</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Angle A</div>
                    <div className="kpi-value">
                      {fmt(sol.A)}
                      {unitSym}
                    </div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Angle B</div>
                    <div className="kpi-value">
                      {fmt(sol.B)}
                      {unitSym}
                    </div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Angle C</div>
                    <div className="kpi-value">
                      {fmt(sol.C)}
                      {unitSym}
                    </div>
                  </div>
                </div>

                {/* Sides row */}
                <div className="tri-section-label" style={{ marginTop: 12 }}>Sides</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Side a</div>
                    <div className="kpi-value">{fmt(sol.a)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Side b</div>
                    <div className="kpi-value">{fmt(sol.b)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Side c</div>
                    <div className="kpi-value">{fmt(sol.c)}</div>
                  </div>
                </div>

                {/* Area / Perimeter */}
                <div className="tri-extras-row">
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Perimeter</div>
                    <div className="kpi-value tri-extra-val">{fmt(sol.perimeter)}</div>
                  </div>
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Semi-perimeter</div>
                    <div className="kpi-value tri-extra-val">{fmt(sol.semiperimeter)}</div>
                  </div>
                  <div className="tri-extra-kpi tri-area-box">
                    <div className="kpi-label" style={{ color: "#065f46" }}>Area</div>
                    <div className="kpi-value tri-extra-val" style={{ color: "#065f46" }}>
                      {fmt(sol.area)}
                    </div>
                  </div>
                </div>
              </section>
            ))}

          {/* Info card */}
          <section className="card" style={{ marginTop: 20 }}>
            <h2 className="card-title">Solving Methods</h2>
            <ul className="tri-info-list">
              <li><strong>SSS</strong> — Law of Cosines to find all angles.</li>
              <li><strong>SAS</strong> — Law of Cosines to find the opposite side, then Law of Sines.</li>
              <li><strong>ASA / AAS</strong> — Third angle = 180° − A − B, then Law of Sines.</li>
              <li><strong>SSA (ambiguous)</strong> — Law of Sines; may yield 0, 1, or 2 solutions.</li>
            </ul>
          </section>
        </div>

        {/* ====== Sidebar ====== */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Math Calculators</h3>
            <ul className="rng-sidebar-list">
              {mathLinks.map((lnk) => (
                <li key={lnk.to} className="rng-sidebar-item">
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/triangle-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
