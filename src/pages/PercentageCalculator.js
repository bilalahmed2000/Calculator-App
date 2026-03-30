/**
 * PercentageCalculator.js
 * Full rewrite — matches calculator.net behavior with Smart Calculators theme.
 *
 * Sections:
 *   1) Percentage Calculator          — A% of B = C  (solve any missing field)
 *   2) Common Phrases                 — 3 sub-calculators (each has its own Calculate/Clear)
 *   3) Percentage Difference          — |V1−V2| / avg × 100
 *   4) Percentage Change              — Increase/Decrease (solve for any of the 3 fields)
 *
 * Layout: two-column (main + sidebar) using SharedCalcLayout.css
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ═══════════════════════════════════════════════
   MATH HELPERS
   ═══════════════════════════════════════════════ */

/** Parse a string to a finite number; returns null if empty, NaN if invalid. */
const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).replace(/[,%\s]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

/** Format a number: integer if close to integer, otherwise up to 6 decimal places (no trailing zeros). */
const fmt = (n) => {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  // toPrecision(10) to avoid floating-point noise, then strip trailing zeros
  const raw = Number(n.toPrecision(10));
  let s = String(raw);
  if (s.includes("e")) s = raw.toFixed(10);
  if (s.includes(".")) s = s.replace(/\.?0+$/, "");
  return s;
};

const fmtPct = (n) => `${fmt(n)}%`;

/* ═══════════════════════════════════════════════
   SHARED MINI-COMPONENTS
   ═══════════════════════════════════════════════ */

/** Themed inline text input used inside phrase rows. */
const InField = ({ value, onChange, width = 96 }) => (
  <input
    type="text"
    inputMode="decimal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width,
      padding: "8px 10px",
      borderRadius: 10,
      border: "1.5px solid rgba(99,102,241,0.25)",
      background: "#f8f9ff",
      color: "#1e1b4b",
      fontSize: 15,
      fontWeight: 600,
      outline: "none",
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  />
);

/** Bold text label used between inputs in a phrase row. */
const Lbl = ({ children }) => (
  <span style={{ fontWeight: 700, color: "#374151", fontSize: 15, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

/** Green result header bar (matches calculator.net style). */
const ResultBar = ({ label }) => (
  <div className="result-header">
    <span>{label}</span>
    <button
      type="button"
      className="link-btn"
      onClick={() => window.print()}
      title="Print this result"
    >
      Print
    </button>
  </div>
);

/** Inline error box. */
const ErrBox = ({ msg }) =>
  msg ? <div className="rng-error" style={{ marginTop: 12 }}>{msg}</div> : null;

/** Step-by-step calculation list shown under the result bar. */
const StepList = ({ lines }) =>
  lines?.length > 0 ? (
    <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.85 }}>
      <span style={{ fontWeight: 700, color: "#374151" }}>Steps:</span>
      {lines.map((l, i) => (
        <div key={i} style={{ color: "#4b5280" }}>
          {l}
        </div>
      ))}
    </div>
  ) : null;

/**
 * Universal result block.
 * res = null         → renders nothing
 * res.err (string)   → error box
 * res.title / .equation / .steps / .extras → success display
 */
function ResultBlock({ res }) {
  if (!res) return null;
  if (res.err) return <ErrBox msg={res.err} />;
  return (
    <div style={{ marginTop: 14 }}>
      <ResultBar label={res.title} />
      {res.equation && (
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "#1e1b4b", marginBottom: 4 }}>
          {res.equation}
        </div>
      )}
      <StepList lines={res.steps} />
      {res.extras?.map((l, i) => (
        <div key={i} style={{ fontSize: 13.5, color: "#6b7a9e", marginTop: 6 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** Calculate + Clear button pair (flex, not full-width). */
function BtnRow({ onCalc, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn"
        style={{ padding: "9px 24px", width: "auto" }}
        onClick={onCalc}
      >
        Calculate
      </button>
      <button
        type="button"
        onClick={onClear}
        style={{
          padding: "9px 18px",
          borderRadius: 12,
          border: "1.5px solid rgba(99,102,241,0.22)",
          background: "#fff",
          color: "#6b7a9e",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          width: "auto",
        }}
      >
        Clear
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════ */

const MATH_LINKS = [
  { to: "/scientific", label: "Scientific Calculator" },
  { to: "/percentage-calculator", label: "Percentage Calculator", active: true },
  { to: "/fraction-calculator", label: "Fraction Calculator" },
  { to: "/triangle-calculator", label: "Triangle Calculator" },
  { to: "/standard-deviation-calculator", label: "Standard Deviation" },
  { to: "/random-number-generator", label: "Random Number Generator" },
  { to: "/hours-calculator", label: "Hours Calculator" },
  { to: "/gpa-calculator", label: "GPA Calculator" },
  { to: "/grade-calculator", label: "Grade Calculator" },
];

function Sidebar() {
  const [q, setQ] = useState("");
  return (
    <aside className="rng-sidebar">
      {/* Search */}
      <div className="card rng-sidebar-card" style={{ marginBottom: 14 }}>
        <div className="rng-sidebar-title">Search</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search calculators…"
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 9,
              border: "1.5px solid rgba(99,102,241,0.2)",
              background: "#f8f9ff",
              fontSize: 13,
              color: "#1e1b4b",
              outline: "none",
            }}
          />
          <button
            className="btn"
            style={{ padding: "7px 12px", width: "auto", fontSize: 13 }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Math Calculators list */}
      <div className="card rng-sidebar-card">
        <div className="rng-sidebar-title">Math Calculators</div>
        <ul className="rng-sidebar-list">
          {MATH_LINKS.map(({ to, label, active }) => (
            <li key={to}>
              <Link
                to={to}
                className={`rng-sidebar-link${active ? " rng-sidebar-link--active" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function PercentageCalculator() {
  /* ── shared style objects (defined once to avoid recreation on each render) ── */
  const boxSt = {
    background: "#f5f3ff",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 12,
  };
  const phraseBoxSt = { ...boxSt, marginBottom: 14 };
  const flexRow = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };

  /* ────────────────────────────────────────────────
     BLOCK 1 — A% of B = C  (solve any one missing)
     ──────────────────────────────────────────────── */
  const [p1, setP1] = useState("");   // A (percentage)
  const [b1, setB1] = useState("");   // B (base value)
  const [c1, setC1] = useState("");   // C (result value)
  const [res1, setRes1] = useState(null);

  const calc1 = () => {
    const A = toNum(p1), B = toNum(b1), C = toNum(c1);

    // Validate inputs
    if (Number.isNaN(A) || Number.isNaN(B) || Number.isNaN(C)) {
      setRes1({ err: "Please enter valid numbers only." });
      return;
    }
    const nulls = [A, B, C].filter((x) => x === null).length;
    if (nulls > 1) {
      setRes1({ err: "Please provide any two values and leave one field empty." });
      return;
    }

    // Determine which field to compute.
    // Priority: if C is null (or all filled) → compute C; else if B null → compute B; else compute A.
    let outA = A, outB = B, outC = C;
    let steps = [];
    let resultLabel = "";
    let equation = "";

    if (C === null || nulls === 0) {
      // Compute C = (A/100) × B
      outC = (outA / 100) * outB;
      resultLabel = fmt(outC);
      equation = `${fmtPct(outA)} of ${fmt(outB)} = ${fmt(outC)}`;
      steps = [
        `C = A% × B`,
        `C = ${fmt(outA)} ÷ 100 × ${fmt(outB)}`,
        `C = ${fmt(outA / 100)} × ${fmt(outB)}`,
        `C = ${fmt(outC)}`,
      ];
    } else if (B === null) {
      // Compute B = C / (A/100)
      if (outA === 0) {
        setRes1({ err: "Cannot compute: percentage (A) cannot be 0." });
        return;
      }
      outB = outC / (outA / 100);
      resultLabel = fmt(outB);
      equation = `${fmtPct(outA)} of ${fmt(outB)} = ${fmt(outC)}`;
      steps = [
        `B = C ÷ (A ÷ 100)`,
        `B = ${fmt(outC)} ÷ (${fmt(outA)} ÷ 100)`,
        `B = ${fmt(outC)} ÷ ${fmt(outA / 100)}`,
        `B = ${fmt(outB)}`,
      ];
    } else {
      // Compute A = (C/B) × 100
      if (outB === 0) {
        setRes1({ err: "Cannot compute: base value (B) cannot be 0." });
        return;
      }
      outA = (outC / outB) * 100;
      resultLabel = fmtPct(outA);
      equation = `${fmtPct(outA)} of ${fmt(outB)} = ${fmt(outC)}`;
      steps = [
        `A = (C ÷ B) × 100`,
        `A = (${fmt(outC)} ÷ ${fmt(outB)}) × 100`,
        `A = ${fmt(outC / outB)} × 100`,
        `A = ${fmtPct(outA)}`,
      ];
    }

    setRes1({ title: `Result: ${resultLabel}`, equation, steps });
  };

  const clear1 = () => { setP1(""); setB1(""); setC1(""); setRes1(null); };

  /* ────────────────────────────────────────────────
     BLOCK 2a — What is P% of N?
     ──────────────────────────────────────────────── */
  const [p2a, setP2a] = useState("");
  const [n2a, setN2a] = useState("");
  const [res2a, setRes2a] = useState(null);

  const calc2a = () => {
    const P = toNum(p2a), N = toNum(n2a);
    if (Number.isNaN(P) || Number.isNaN(N)) { setRes2a({ err: "Please enter valid numbers." }); return; }
    if (P === null || N === null) { setRes2a({ err: "Please enter both values." }); return; }
    const R = (P / 100) * N;
    setRes2a({
      title: `Result: ${fmt(R)}`,
      equation: `${fmtPct(P)} of ${fmt(N)} = ${fmt(R)}`,
      steps: [
        `R = P% × N`,
        `R = ${fmt(P)} ÷ 100 × ${fmt(N)}`,
        `R = ${fmt(P / 100)} × ${fmt(N)}`,
        `R = ${fmt(R)}`,
      ],
    });
  };
  const clear2a = () => { setP2a(""); setN2a(""); setRes2a(null); };

  /* ────────────────────────────────────────────────
     BLOCK 2b — X is what % of Y?
     ──────────────────────────────────────────────── */
  const [x2b, setX2b] = useState("");
  const [y2b, setY2b] = useState("");
  const [res2b, setRes2b] = useState(null);

  const calc2b = () => {
    const X = toNum(x2b), Y = toNum(y2b);
    if (Number.isNaN(X) || Number.isNaN(Y)) { setRes2b({ err: "Please enter valid numbers." }); return; }
    if (X === null || Y === null) { setRes2b({ err: "Please enter both values." }); return; }
    if (Y === 0) { setRes2b({ err: "Cannot divide by zero (Y cannot be 0)." }); return; }
    const P = (X / Y) * 100;
    setRes2b({
      title: `Result: ${fmtPct(P)}`,
      equation: `${fmt(X)} is ${fmtPct(P)} of ${fmt(Y)}`,
      steps: [
        `P = (X ÷ Y) × 100`,
        `P = (${fmt(X)} ÷ ${fmt(Y)}) × 100`,
        `P = ${fmt(X / Y)} × 100`,
        `P = ${fmtPct(P)}`,
      ],
    });
  };
  const clear2b = () => { setX2b(""); setY2b(""); setRes2b(null); };

  /* ────────────────────────────────────────────────
     BLOCK 2c — X is P% of what?
     ──────────────────────────────────────────────── */
  const [x2c, setX2c] = useState("");
  const [p2c, setP2c] = useState("");
  const [res2c, setRes2c] = useState(null);

  const calc2c = () => {
    const X = toNum(x2c), P = toNum(p2c);
    if (Number.isNaN(X) || Number.isNaN(P)) { setRes2c({ err: "Please enter valid numbers." }); return; }
    if (X === null || P === null) { setRes2c({ err: "Please enter both values." }); return; }
    if (P === 0) { setRes2c({ err: "Cannot compute: percentage cannot be 0." }); return; }
    const W = X / (P / 100);
    setRes2c({
      title: `Result: ${fmt(W)}`,
      equation: `${fmt(X)} is ${fmtPct(P)} of ${fmt(W)}`,
      steps: [
        `W = X ÷ (P ÷ 100)`,
        `W = ${fmt(X)} ÷ (${fmt(P)} ÷ 100)`,
        `W = ${fmt(X)} ÷ ${fmt(P / 100)}`,
        `W = ${fmt(W)}`,
      ],
    });
  };
  const clear2c = () => { setX2c(""); setP2c(""); setRes2c(null); };

  /* ────────────────────────────────────────────────
     BLOCK 3 — Percentage Difference
     Formula: |V1 − V2| / ((V1 + V2) / 2) × 100
     ──────────────────────────────────────────────── */
  const [v1_3, setV1_3] = useState("");
  const [v2_3, setV2_3] = useState("");
  const [res3, setRes3] = useState(null);

  const calc3 = () => {
    const A = toNum(v1_3), B = toNum(v2_3);
    if (Number.isNaN(A) || Number.isNaN(B)) { setRes3({ err: "Please enter valid numbers." }); return; }
    if (A === null || B === null) { setRes3({ err: "Please enter both values." }); return; }
    const avg = (A + B) / 2;
    if (avg === 0) {
      setRes3({ err: "The average of both values is 0; percentage difference is undefined." });
      return;
    }
    const diff = Math.abs(A - B);
    const pd = (diff / avg) * 100;

    // Bonus: also show percentage change from V1 to V2
    const extras = [];
    if (A !== 0) {
      const chg = ((B - A) / Math.abs(A)) * 100;
      const dir = chg >= 0 ? "increase" : "decrease";
      extras.push(
        `Note: ${fmt(B)} is a ${fmtPct(Math.abs(chg))} ${dir} from ${fmt(A)}.`
      );
    }

    setRes3({
      title: `Result: ${fmtPct(pd)}`,
      equation: `Percentage difference between ${fmt(A)} and ${fmt(B)} = ${fmtPct(pd)}`,
      steps: [
        `|${fmt(A)} − ${fmt(B)}| ÷ ((${fmt(A)} + ${fmt(B)}) ÷ 2) × 100`,
        `= ${fmt(diff)} ÷ ${fmt(avg)} × 100`,
        `= ${fmt(diff / avg)} × 100`,
        `= ${fmtPct(pd)}`,
      ],
      extras,
    });
  };
  const clear3 = () => { setV1_3(""); setV2_3(""); setRes3(null); };

  /* ────────────────────────────────────────────────
     BLOCK 4 — Percentage Change (3-way solve)
     Fields: V (start), mode (Increase|Decrease), P (%), R (end)
     Solve for whichever one field is empty.
     ──────────────────────────────────────────────── */
  const [v4, setV4] = useState("");        // starting value
  const [p4, setP4] = useState("");        // percentage
  const [r4, setR4] = useState("");        // resulting value
  const [mode4, setMode4] = useState("Increase");
  const [res4, setRes4] = useState(null);

  const calc4 = () => {
    const V = toNum(v4), P = toNum(p4), R = toNum(r4);
    if (Number.isNaN(V) || Number.isNaN(P) || Number.isNaN(R)) {
      setRes4({ err: "Please enter valid numbers." });
      return;
    }

    const nulls = [V, P, R].filter((x) => x === null).length;
    if (nulls > 1) {
      setRes4({ err: "Please provide any two values and leave one field empty." });
      return;
    }

    // Determine target: priority V → P → R (if all filled, default to computing R)
    let target;
    if (V === null) target = "V";
    else if (P === null) target = "P";
    else target = "R"; // R null OR all filled

    let outV = V ?? 0, outP = P ?? 0, outR = R ?? 0;
    let outMode = mode4;
    let steps = [];
    let resultLabel = "";

    if (target === "R") {
      // R = V × (1 ± P/100)
      const sign = mode4 === "Increase" ? 1 : -1;
      const factor = 1 + sign * (outP / 100);
      outR = outV * factor;
      resultLabel = fmt(outR);
      const opStr = mode4 === "Increase" ? "+" : "−";
      steps = [
        `R = V × (1 ${opStr} P ÷ 100)`,
        `R = ${fmt(outV)} × (1 ${opStr} ${fmt(outP)} ÷ 100)`,
        `R = ${fmt(outV)} × (1 ${opStr} ${fmt(outP / 100)})`,
        `R = ${fmt(outV)} × ${fmt(factor)}`,
        `R = ${fmt(outR)}`,
      ];
    } else if (target === "P") {
      // P = |R − V| / V × 100  (direction auto-detected)
      if (outV === 0) {
        setRes4({ err: "Starting value cannot be 0 when computing the percentage." });
        return;
      }
      outP = Math.abs((outR - outV) / outV) * 100;
      outMode = outR >= outV ? "Increase" : "Decrease";
      resultLabel = fmtPct(outP);
      steps = [
        `P = |R − V| ÷ V × 100`,
        `P = |${fmt(outR)} − ${fmt(outV)}| ÷ ${fmt(outV)} × 100`,
        `P = ${fmt(Math.abs(outR - outV))} ÷ ${fmt(outV)} × 100`,
        `P = ${fmt(Math.abs(outR - outV) / outV)} × 100`,
        `P = ${fmtPct(outP)}  (${outMode})`,
      ];
    } else {
      // target === "V":  V = R / (1 ± P/100)
      const sign = mode4 === "Increase" ? 1 : -1;
      const factor = 1 + sign * (outP / 100);
      if (factor === 0) {
        setRes4({ err: "Factor is 0 (100% decrease of itself); cannot compute." });
        return;
      }
      outV = outR / factor;
      resultLabel = fmt(outV);
      const opStr = mode4 === "Increase" ? "+" : "−";
      steps = [
        `V = R ÷ (1 ${opStr} P ÷ 100)`,
        `V = ${fmt(outR)} ÷ (1 ${opStr} ${fmt(outP)} ÷ 100)`,
        `V = ${fmt(outR)} ÷ (1 ${opStr} ${fmt(outP / 100)})`,
        `V = ${fmt(outR)} ÷ ${fmt(factor)}`,
        `V = ${fmt(outV)}`,
      ];
    }

    const dirSymbol = outMode === "Increase" ? "+" : "−";
    setRes4({
      title: `Result: ${resultLabel}`,
      equation: `${fmt(outV)} ${outMode === "Increase" ? "▲" : "▼"} ${dirSymbol}${fmtPct(outP)} = ${fmt(outR)}`,
      steps,
    });
  };

  const clear4 = () => {
    setV4(""); setP4(""); setR4(""); setMode4("Increase"); setRes4(null);
  };

  /* ─────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────── */
  return (
    <div className="calc-wrap">
      {/* ── Page Header ── */}
      <header className="calc-hero">
        <h1>Percentage Calculator</h1>
        <p className="muted">
          Please provide any two values below and click the <strong>Calculate</strong> button
          to get the third value.
        </p>
      </header>

      <div className="rng-layout">
        {/* ══════════════════════════════════
            MAIN CONTENT
            ══════════════════════════════════ */}
        <main className="rng-main">

          {/* ════════ SECTION 1 — Percentage Calculator ════════ */}
          <section className="card" style={{ marginBottom: 20 }}>
            <h2 className="card-title">Percentage Calculator</h2>
            <p className="rng-desc">
              Fill in any <strong>two</strong> of the three fields and leave one empty.
              Click <strong>Calculate</strong> to solve for the missing value.
            </p>

            <div style={boxSt}>
              <div style={flexRow}>
                <InField value={p1} onChange={setP1} />
                <Lbl>% of</Lbl>
                <InField value={b1} onChange={setB1} />
                <Lbl>=</Lbl>
                <InField value={c1} onChange={setC1} />
              </div>
              <BtnRow onCalc={calc1} onClear={clear1} />
              <ResultBlock res={res1} />
            </div>
          </section>

          {/* ════════ SECTION 2 — Common Phrases ════════ */}
          <section className="card" style={{ marginBottom: 20 }}>
            <h2 className="card-title">Percentage Calculator in Common Phrases</h2>
            <p className="rng-desc">
              Three quick phrase-based calculators — each has its own Calculate and Clear button.
            </p>

            {/* 2a: What is P% of N? */}
            <div style={phraseBoxSt}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#6b7a9e" }}>
                a) What is _% of _?
              </p>
              <div style={flexRow}>
                <Lbl>What is</Lbl>
                <InField value={p2a} onChange={setP2a} />
                <Lbl>% of</Lbl>
                <InField value={n2a} onChange={setN2a} />
                <Lbl>?</Lbl>
              </div>
              <BtnRow onCalc={calc2a} onClear={clear2a} />
              <ResultBlock res={res2a} />
            </div>

            {/* 2b: X is what % of Y? */}
            <div style={phraseBoxSt}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#6b7a9e" }}>
                b) _ is what % of _?
              </p>
              <div style={flexRow}>
                <InField value={x2b} onChange={setX2b} />
                <Lbl>is what % of</Lbl>
                <InField value={y2b} onChange={setY2b} />
                <Lbl>?</Lbl>
              </div>
              <BtnRow onCalc={calc2b} onClear={clear2b} />
              <ResultBlock res={res2b} />
            </div>

            {/* 2c: X is P% of what? */}
            <div style={{ ...phraseBoxSt, marginBottom: 0 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#6b7a9e" }}>
                c) _ is _% of what?
              </p>
              <div style={flexRow}>
                <InField value={x2c} onChange={setX2c} />
                <Lbl>is</Lbl>
                <InField value={p2c} onChange={setP2c} />
                <Lbl>% of what?</Lbl>
              </div>
              <BtnRow onCalc={calc2c} onClear={clear2c} />
              <ResultBlock res={res2c} />
            </div>
          </section>

          {/* ════════ SECTION 3 — Percentage Difference ════════ */}
          <section className="card" style={{ marginBottom: 20 }}>
            <h2 className="card-title">Percentage Difference Calculator</h2>
            <p className="rng-desc">
              Calculates the percentage difference between two values relative to their average
              (symmetric — order does not matter).
            </p>
            <div style={boxSt}>
              <div style={{ display: "grid", gap: 10, maxWidth: 380 }}>
                <div style={flexRow}>
                  <span style={{ minWidth: 60, fontWeight: 600, color: "#4b5280", fontSize: 14 }}>
                    Value 1
                  </span>
                  <InField value={v1_3} onChange={setV1_3} width={220} />
                </div>
                <div style={flexRow}>
                  <span style={{ minWidth: 60, fontWeight: 600, color: "#4b5280", fontSize: 14 }}>
                    Value 2
                  </span>
                  <InField value={v2_3} onChange={setV2_3} width={220} />
                </div>
              </div>
              <BtnRow onCalc={calc3} onClear={clear3} />
              <ResultBlock res={res3} />
            </div>
          </section>

          {/* ════════ SECTION 4 — Percentage Change ════════ */}
          <section className="card" style={{ marginBottom: 20 }}>
            <h2 className="card-title">Percentage Change Calculator</h2>
            <p className="rng-desc">
              Fill in any <strong>two</strong> of the three fields (Start, Percentage, End) and
              leave one empty. The direction (Increase / Decrease) is auto-detected when computing
              the percentage.
            </p>
            <div style={boxSt}>
              {/* Field labels row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6, alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Start value
                  </span>
                  <InField value={v4} onChange={setV4} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Direction
                  </span>
                  <select
                    value={mode4}
                    onChange={(e) => setMode4(e.target.value)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1.5px solid rgba(99,102,241,0.25)",
                      background: "#f8f9ff",
                      color: "#1e1b4b",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="Increase">Increase</option>
                    <option value="Decrease">Decrease</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Percentage
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <InField value={p4} onChange={setP4} />
                    <Lbl>%</Lbl>
                  </div>
                </div>

                <Lbl>=</Lbl>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    End value
                  </span>
                  <InField value={r4} onChange={setR4} />
                </div>
              </div>

              <BtnRow onCalc={calc4} onClear={clear4} />
              <ResultBlock res={res4} />
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════
            SIDEBAR
            ══════════════════════════════════ */}
        <Sidebar />
      </div>
    </div>
  );
}
