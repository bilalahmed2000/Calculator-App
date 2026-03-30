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

/* ---------- Helpers ---------- */

/**
 * Safely format any number to 5 decimal places, stripping trailing zeros.
 * Returns "—" for null / undefined / NaN / Infinity.
 */
function formatNumber(n) {
  if (n == null || typeof n !== "number" || isNaN(n) || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(5)).toString();
}

/** Format a coordinate pair as [x, y] */
function fmtCoord(x, y) {
  return `[${formatNumber(x)}, ${formatNumber(y)}]`;
}

/**
 * Validate that a solution object has every required key and that all numeric
 * fields are finite numbers. Returns true only for fully-formed solutions.
 */
function isValidSolution(sol) {
  if (!sol || typeof sol !== "object") return false;

  const { angles, sides, area, perimeter, semiperimeter, heights, medians, radii, coords } = sol;

  const isNum = (v) => typeof v === "number" && isFinite(v);

  if (!angles || !isNum(angles.A) || !isNum(angles.B) || !isNum(angles.C)) return false;
  if (!sides  || !isNum(sides.a)  || !isNum(sides.b)  || !isNum(sides.c))  return false;
  if (!isNum(area) || !isNum(perimeter) || !isNum(semiperimeter))           return false;
  if (!heights || !isNum(heights.ha) || !isNum(heights.hb) || !isNum(heights.hc)) return false;
  if (!medians || !isNum(medians.ma) || !isNum(medians.mb) || !isNum(medians.mc)) return false;
  if (!radii   || !isNum(radii.r)   || !isNum(radii.R))                         return false;

  if (!coords) return false;
  if (!isNum(coords.Ax) || !isNum(coords.Ay)) return false;
  if (!isNum(coords.Bx) || !isNum(coords.By)) return false;
  if (!isNum(coords.Cx) || !isNum(coords.Cy)) return false;
  if (!coords.centroid    || !isNum(coords.centroid.x)    || !isNum(coords.centroid.y))    return false;
  if (!coords.incenter    || !isNum(coords.incenter.x)    || !isNum(coords.incenter.y))    return false;
  if (!coords.circumcenter|| !isNum(coords.circumcenter.x)|| !isNum(coords.circumcenter.y))return false;

  return true;
}

/* ---------- Triangle solver ---------- */
function solveTriangle(raw, unit) {
  const toR   = unit === "deg" ? (d) => (d * Math.PI) / 180 : (r) => r;
  const fromR = unit === "deg" ? (r) => (r * 180) / Math.PI : (r) => r;

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
  const sideCount  = [a, b, c].filter((x) => x !== null).length;

  if (knownCount < 3) return { error: "Please enter at least 3 values." };
  if (sideCount === 0) return { error: "At least one side length must be provided." };

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

  /* Convert to radians for all internal computation */
  if (A !== null) A = toR(A);
  if (B !== null) B = toR(B);
  if (C !== null) C = toR(C);

  /* Derive third angle */
  if      (A !== null && B !== null && C === null) C = Math.PI - A - B;
  else if (A !== null && C !== null && B === null) B = Math.PI - A - C;
  else if (B !== null && C !== null && A === null) A = Math.PI - B - C;

  if ([A, B, C].some((x) => x !== null && x <= 0))
    return { error: "Angles must sum to 180° (or π rad)." };

  const solutions = [];

  /**
   * Build one fully-validated solution object.
   * Returns null (never throws) if the inputs are geometrically invalid or
   * any computed value is non-finite. Only valid solutions are returned.
   */
  const finish = (Ar, Br, Cr, av, bv, cv) => {
    try {
      /* Basic geometric checks */
      if ([Ar, Br, Cr].some((x) => !(x > 0 && x < Math.PI))) return null;
      if ([av, bv, cv].some((x) => !(x > 0)))                 return null;
      if (Math.abs(Ar + Br + Cr - Math.PI) > 1e-6)            return null;

      /* Core measurements */
      const s       = (av + bv + cv) / 2;
      const areaVal = Math.sqrt(Math.max(0, s * (s - av) * (s - bv) * (s - cv)));

      if (!isFinite(areaVal) || areaVal <= 0) return null; // degenerate / collinear

      /* Heights */
      const ha = (2 * areaVal) / av;
      const hb = (2 * areaVal) / bv;
      const hc = (2 * areaVal) / cv;

      /* Medians */
      const ma = 0.5 * Math.sqrt(Math.max(0, 2 * bv * bv + 2 * cv * cv - av * av));
      const mb = 0.5 * Math.sqrt(Math.max(0, 2 * av * av + 2 * cv * cv - bv * bv));
      const mc = 0.5 * Math.sqrt(Math.max(0, 2 * av * av + 2 * bv * bv - cv * cv));

      /* Inradius & Circumradius */
      const r = areaVal / s;
      const R = (av * bv * cv) / (4 * areaVal);

      if (!isFinite(r) || !isFinite(R)) return null;

      /* ---- Coordinates ----
         Place A at the origin, B along the positive x-axis (length = cv = side c = AB).
         C is resolved from the law of cosines. */
      const vAx = 0;
      const vAy = 0;
      const vBx = cv;
      const vBy = 0;
      const xC  = (bv * bv + cv * cv - av * av) / (2 * cv);
      const yC  = Math.sqrt(Math.max(0, bv * bv - xC * xC));
      const vCx = xC;
      const vCy = yC;

      if (!isFinite(vCx) || !isFinite(vCy)) return null;

      /* Centroid */
      const Gx = (vAx + vBx + vCx) / 3;
      const Gy = (vAy + vBy + vCy) / 3;

      /* Incenter — weighted by the length of the side OPPOSITE each vertex:
           vertex A is weighted by side a (av), B by b (bv), C by c (cv)  */
      const perim = av + bv + cv;
      const Ix = (av * vAx + bv * vBx + cv * vCx) / perim;
      const Iy = (av * vAy + bv * vBy + cv * vCy) / perim;

      /* Circumcenter — general determinant formula */
      const denom = 2 * (vAx * (vBy - vCy) + vBx * (vCy - vAy) + vCx * (vAy - vBy));
      let Ox = 0, Oy = 0;
      if (Math.abs(denom) > 1e-12) {
        const A2 = vAx * vAx + vAy * vAy;
        const B2 = vBx * vBx + vBy * vBy;
        const C2 = vCx * vCx + vCy * vCy;
        Ox = (A2 * (vBy - vCy) + B2 * (vCy - vAy) + C2 * (vAy - vBy)) / denom;
        Oy = (A2 * (vCx - vBx) + B2 * (vAx - vCx) + C2 * (vBx - vAx)) / denom;
      }

      if (!isFinite(Ox) || !isFinite(Oy)) return null;

      /* Build solution in the canonical nested shape */
      const sol = {
        angles: { A: fromR(Ar), B: fromR(Br), C: fromR(Cr) },
        sides:  { a: av, b: bv, c: cv },
        area:          areaVal,
        perimeter:     av + bv + cv,
        semiperimeter: s,
        heights:  { ha, hb, hc },
        medians:  { ma, mb, mc },
        radii:    { r, R },
        coords: {
          Ax: vAx, Ay: vAy,
          Bx: vBx, By: vBy,
          Cx: vCx, Cy: vCy,
          centroid:     { x: Gx, y: Gy },
          incenter:     { x: Ix, y: Iy },
          circumcenter: { x: Ox, y: Oy },
        },
      };

      /* Final safety check — reject if any field failed to produce a real number */
      return isValidSolution(sol) ? sol : null;
    } catch {
      return null;
    }
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
  /* ===== All 3 angles + at least 1 side (AAS / ASA) ===== */
  else if (A !== null && B !== null && C !== null) {
    if (Math.abs(A + B + C - Math.PI) > 1e-4)
      return { error: "Angles do not sum to 180° — check your values." };
    let ratio = a !== null ? a / Math.sin(A) : b !== null ? b / Math.sin(B) : c / Math.sin(C);
    const av = a !== null ? a : ratio * Math.sin(A);
    const bv = b !== null ? b : ratio * Math.sin(B);
    const cv = c !== null ? c : ratio * Math.sin(C);
    const sol = finish(A, B, C, av, bv, cv);
    if (sol) solutions.push(sol);
  }
  /* ===== 2 sides + 1 angle ===== */
  else if (sideCount === 2) {

    /* --- SAS cases (angle is the included angle between the two known sides) --- */
    if (A !== null && b !== null && c !== null) {           /* SAS: A between b and c */
      const aSq = b * b + c * c - 2 * b * c * Math.cos(A);
      if (aSq > 0) {
        const av   = Math.sqrt(aSq);
        const cosB = (av * av + c * c - b * b) / (2 * av * c);
        const cosC = (av * av + b * b - c * c) / (2 * av * b);
        if (Math.abs(cosB) <= 1 && Math.abs(cosC) <= 1) {
          const sol = finish(A, Math.acos(cosB), Math.acos(cosC), av, b, c);
          if (sol) solutions.push(sol);
        }
      }
    } else if (B !== null && a !== null && c !== null) {    /* SAS: B between a and c */
      const bSq = a * a + c * c - 2 * a * c * Math.cos(B);
      if (bSq > 0) {
        const bv   = Math.sqrt(bSq);
        const cosA = (bv * bv + c * c - a * a) / (2 * bv * c);
        const cosC = (a * a + bv * bv - c * c) / (2 * a * bv);
        if (Math.abs(cosA) <= 1 && Math.abs(cosC) <= 1) {
          const sol = finish(Math.acos(cosA), B, Math.acos(cosC), a, bv, c);
          if (sol) solutions.push(sol);
        }
      }
    } else if (C !== null && a !== null && b !== null) {    /* SAS: C between a and b */
      const cSq = a * a + b * b - 2 * a * b * Math.cos(C);
      if (cSq > 0) {
        const cv   = Math.sqrt(cSq);
        const cosA = (b * b + cv * cv - a * a) / (2 * b * cv);
        const cosB = (a * a + cv * cv - b * b) / (2 * a * cv);
        if (Math.abs(cosA) <= 1 && Math.abs(cosB) <= 1) {
          const sol = finish(Math.acos(cosA), Math.acos(cosB), C, a, b, cv);
          if (sol) solutions.push(sol);
        }
      }

    /* --- SSA cases (ambiguous) --- */
    } else if (A !== null && a !== null && b !== null) {
      const sinB = (b * Math.sin(A)) / a;
      if (sinB > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const B1 = sinB > 1 ? Math.PI / 2 : Math.asin(sinB);
      const trySSA = (Bv) => {
        if (A + Bv >= Math.PI) return;
        const Cv = Math.PI - A - Bv;
        const sol = finish(A, Bv, Cv, a, b, (a * Math.sin(Cv)) / Math.sin(A));
        if (sol) solutions.push(sol);
      };
      trySSA(B1);
      if (sinB < 1 - 1e-9) trySSA(Math.PI - B1);

    } else if (B !== null && a !== null && b !== null) {
      const sinA = (a * Math.sin(B)) / b;
      if (sinA > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const A1 = sinA > 1 ? Math.PI / 2 : Math.asin(sinA);
      const trySSA = (Av) => {
        if (B + Av >= Math.PI) return;
        const Cv = Math.PI - Av - B;
        const sol = finish(Av, B, Cv, a, b, (b * Math.sin(Cv)) / Math.sin(B));
        if (sol) solutions.push(sol);
      };
      trySSA(A1);
      if (sinA < 1 - 1e-9) trySSA(Math.PI - A1);

    } else if (A !== null && a !== null && c !== null) {
      const sinC = (c * Math.sin(A)) / a;
      if (sinC > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const C1 = sinC > 1 ? Math.PI / 2 : Math.asin(sinC);
      const trySSA = (Cv) => {
        if (A + Cv >= Math.PI) return;
        const Bv = Math.PI - A - Cv;
        const sol = finish(A, Bv, Cv, a, (a * Math.sin(Bv)) / Math.sin(A), c);
        if (sol) solutions.push(sol);
      };
      trySSA(C1);
      if (sinC < 1 - 1e-9) trySSA(Math.PI - C1);

    } else if (C !== null && a !== null && c !== null) {
      const sinA = (a * Math.sin(C)) / c;
      if (sinA > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const A1 = sinA > 1 ? Math.PI / 2 : Math.asin(sinA);
      const trySSA = (Av) => {
        if (C + Av >= Math.PI) return;
        const Bv = Math.PI - Av - C;
        const sol = finish(Av, Bv, C, a, (c * Math.sin(Bv)) / Math.sin(C), c);
        if (sol) solutions.push(sol);
      };
      trySSA(A1);
      if (sinA < 1 - 1e-9) trySSA(Math.PI - A1);

    } else if (B !== null && b !== null && c !== null) {
      const sinC = (c * Math.sin(B)) / b;
      if (sinC > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const C1 = sinC > 1 ? Math.PI / 2 : Math.asin(sinC);
      const trySSA = (Cv) => {
        if (B + Cv >= Math.PI) return;
        const Av = Math.PI - B - Cv;
        const sol = finish(Av, B, Cv, (b * Math.sin(Av)) / Math.sin(B), b, c);
        if (sol) solutions.push(sol);
      };
      trySSA(C1);
      if (sinC < 1 - 1e-9) trySSA(Math.PI - C1);

    } else if (C !== null && b !== null && c !== null) {
      const sinB = (b * Math.sin(C)) / c;
      if (sinB > 1 + 1e-9) return { error: "No valid triangle exists (SSA — side too short)." };
      const B1 = sinB > 1 ? Math.PI / 2 : Math.asin(sinB);
      const trySSA = (Bv) => {
        if (C + Bv >= Math.PI) return;
        const Av = Math.PI - Bv - C;
        const sol = finish(Av, Bv, C, (c * Math.sin(Av)) / Math.sin(C), b, c);
        if (sol) solutions.push(sol);
      };
      trySSA(B1);
      if (sinB < 1 - 1e-9) trySSA(Math.PI - B1);

    } else {
      return { error: "Unable to solve with the given inputs. Please check your values." };
    }
  } else {
    return {
      error: "Unable to solve. Provide at least 3 values (sides + angles) including at least 1 side.",
    };
  }

  if (solutions.length === 0)
    return { error: "No valid triangle exists with these values." };

  return { solutions };
}

/* ---------- Component ---------- */
export default function TriangleCalculator() {
  const [vals, setVals]     = useState({ A: "", B: "", C: "", a: "", b: "", c: "" });
  const [unit, setUnit]     = useState("deg");
  const [results, setResults] = useState([]); // always an array, never null/undefined
  const [error, setError]   = useState("");

  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }));

  const calculate = () => {
    const res = solveTriangle(vals, unit);
    if (res.error) {
      setError(res.error);
      setResults([]);
    } else {
      setError("");
      /* Extra safety: filter out any solution that failed isValidSolution */
      setResults((res.solutions ?? []).filter(isValidSolution));
    }
  };

  const clear = () => {
    setVals({ A: "", B: "", C: "", a: "", b: "", c: "" });
    setResults([]);
    setError("");
  };

  const unitSym = unit === "deg" ? "°" : " rad";

  /* SVG diagram vertices (fixed, within 320 × 210 viewBox) */
  const svgAx = 40,  svgAy = 188;
  const svgBx = 280, svgBy = 188;
  const svgCx = 160, svgCy = 18;

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
              <svg
                className="tri-svg"
                viewBox="0 0 320 210"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <polygon
                  points={`${svgAx},${svgAy} ${svgBx},${svgBy} ${svgCx},${svgCy}`}
                  fill="rgba(99,102,241,0.07)"
                  stroke="#6366f1"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <text x={svgAx - 14} y={svgAy + 5} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">A</text>
                <text x={svgBx + 6}  y={svgBy + 5} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">B</text>
                <text x={svgCx - 6}  y={svgCy - 8} fontSize="15" fontWeight="700" fill="#4338ca" fontFamily="sans-serif">C</text>
                <text x={(svgBx + svgCx) / 2 + 12} y={(svgBy + svgCy) / 2 + 4} fontSize="13" fill="#7c3aed" fontStyle="italic" fontFamily="serif">a</text>
                <text x={(svgAx + svgCx) / 2 - 20} y={(svgAy + svgCy) / 2 + 4} fontSize="13" fill="#7c3aed" fontStyle="italic" fontFamily="serif">b</text>
                <text x={(svgAx + svgBx) / 2 - 4}  y={svgAy + 18}              fontSize="13" fill="#7c3aed" fontStyle="italic" fontFamily="serif">c</text>
              </svg>

              <div className="tri-input-group tri-pos-C">
                <label className="tri-inp-label">Angle C</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.C} onChange={(e) => set("C", e.target.value)} />
              </div>
              <div className="tri-input-group tri-pos-b">
                <label className="tri-inp-label">Side b</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.b} onChange={(e) => set("b", e.target.value)} />
              </div>
              <div className="tri-input-group tri-pos-a">
                <label className="tri-inp-label">Side a</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.a} onChange={(e) => set("a", e.target.value)} />
              </div>
              <div className="tri-input-group tri-pos-A">
                <label className="tri-inp-label">Angle A</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.A} onChange={(e) => set("A", e.target.value)} />
              </div>
              <div className="tri-input-group tri-pos-c">
                <label className="tri-inp-label">Side c</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.c} onChange={(e) => set("c", e.target.value)} />
              </div>
              <div className="tri-input-group tri-pos-B">
                <label className="tri-inp-label">Angle B</label>
                <input className="tri-inp" type="number" placeholder="—" value={vals.B} onChange={(e) => set("B", e.target.value)} />
              </div>
            </div>

            <div className="tri-btn-row">
              <button type="button" className="btn-primary" onClick={calculate}>Calculate</button>
              <button type="button" className="btn-secondary" onClick={clear}>Clear</button>
            </div>

            {error && <div className="tri-error">{error}</div>}
          </section>

          {/* ====== Results ====== */}
          {results.length > 0 && results.map((sol, i) => {
            /* Guard: skip rendering if solution somehow slipped past isValidSolution */
            if (!isValidSolution(sol)) return null;

            const { angles, sides, heights, medians, radii, coords } = sol;

            return (
              <section className="card tri-result-card" key={i}>
                {results.length > 1 && (
                  <div className="tri-ambiguous-badge">
                    Solution {i + 1} of {results.length} — Ambiguous (SSA)
                  </div>
                )}
                <h2 className="card-title">
                  {results.length > 1 ? `Solution ${i + 1}` : "Results"}
                </h2>

                {/* Angles */}
                <div className="tri-section-label">Angles</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Angle A</div>
                    <div className="kpi-value">{formatNumber(angles?.A)}{unitSym}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Angle B</div>
                    <div className="kpi-value">{formatNumber(angles?.B)}{unitSym}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Angle C</div>
                    <div className="kpi-value">{formatNumber(angles?.C)}{unitSym}</div>
                  </div>
                </div>

                {/* Sides */}
                <div className="tri-section-label" style={{ marginTop: 12 }}>Sides</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Side a</div>
                    <div className="kpi-value">{formatNumber(sides?.a)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Side b</div>
                    <div className="kpi-value">{formatNumber(sides?.b)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Side c</div>
                    <div className="kpi-value">{formatNumber(sides?.c)}</div>
                  </div>
                </div>

                {/* Area / Perimeter */}
                <div className="tri-extras-row">
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Perimeter</div>
                    <div className="kpi-value tri-extra-val">{formatNumber(sol.perimeter)}</div>
                  </div>
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Semi-perimeter</div>
                    <div className="kpi-value tri-extra-val">{formatNumber(sol.semiperimeter)}</div>
                  </div>
                  <div className="tri-extra-kpi tri-area-box">
                    <div className="kpi-label" style={{ color: "#065f46" }}>Area</div>
                    <div className="kpi-value tri-extra-val" style={{ color: "#065f46" }}>
                      {formatNumber(sol.area)}
                    </div>
                  </div>
                </div>

                {/* Heights */}
                <div className="tri-section-label" style={{ marginTop: 20 }}>Heights</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Height h<sub>a</sub></div>
                    <div className="kpi-value">{formatNumber(heights?.ha)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Height h<sub>b</sub></div>
                    <div className="kpi-value">{formatNumber(heights?.hb)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Height h<sub>c</sub></div>
                    <div className="kpi-value">{formatNumber(heights?.hc)}</div>
                  </div>
                </div>

                {/* Medians */}
                <div className="tri-section-label" style={{ marginTop: 12 }}>Medians</div>
                <div className="tri-kpi-row">
                  <div className="kpi">
                    <div className="kpi-label">Median m<sub>a</sub></div>
                    <div className="kpi-value">{formatNumber(medians?.ma)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Median m<sub>b</sub></div>
                    <div className="kpi-value">{formatNumber(medians?.mb)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Median m<sub>c</sub></div>
                    <div className="kpi-value">{formatNumber(medians?.mc)}</div>
                  </div>
                </div>

                {/* Inradius & Circumradius */}
                <div className="tri-section-label" style={{ marginTop: 12 }}>Inradius &amp; Circumradius</div>
                <div className="tri-radii-row">
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Inradius r</div>
                    <div className="kpi-value tri-extra-val">{formatNumber(radii?.r)}</div>
                  </div>
                  <div className="tri-extra-kpi">
                    <div className="kpi-label">Circumradius R</div>
                    <div className="kpi-value tri-extra-val">{formatNumber(radii?.R)}</div>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="tri-section-label" style={{ marginTop: 20 }}>Coordinates</div>
                <div className="tri-coords-block">
                  <div className="tri-coords-row">
                    <span className="tri-coords-key">Vertex coordinates:</span>
                    <span className="tri-coords-val">
                      A{fmtCoord(coords?.Ax, coords?.Ay)}&nbsp;&nbsp;
                      B{fmtCoord(coords?.Bx, coords?.By)}&nbsp;&nbsp;
                      C{fmtCoord(coords?.Cx, coords?.Cy)}
                    </span>
                  </div>
                  <div className="tri-coords-row">
                    <span className="tri-coords-key">Centroid G:</span>
                    <span className="tri-coords-val">{fmtCoord(coords?.centroid?.x, coords?.centroid?.y)}</span>
                  </div>
                  <div className="tri-coords-row">
                    <span className="tri-coords-key">Inscribed Circle Center (Incenter) I:</span>
                    <span className="tri-coords-val">{fmtCoord(coords?.incenter?.x, coords?.incenter?.y)}</span>
                  </div>
                  <div className="tri-coords-row">
                    <span className="tri-coords-key">Circumscribed Circle Center (Circumcenter) O:</span>
                    <span className="tri-coords-val">{fmtCoord(coords?.circumcenter?.x, coords?.circumcenter?.y)}</span>
                  </div>
                </div>
              </section>
            );
          })}

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
