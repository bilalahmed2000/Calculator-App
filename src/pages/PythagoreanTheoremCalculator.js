import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => isFinite(v) ? (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41],[11,60,61],[28,45,53],[33,56,65],[36,77,85]];

export default function PythagoreanTheoremCalculator() {
  const [mode, setMode] = useState("findC");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");
  const [vA, setVA] = useState("3");
  const [vB, setVB] = useState("4");
  const [vC, setVC] = useState("5");

  const result = useMemo(() => {
    if (mode === "findC") {
      const av = parseFloat(a), bv = parseFloat(b);
      if (isNaN(av) || isNaN(bv) || av <= 0 || bv <= 0) return null;
      const cv = Math.sqrt(av ** 2 + bv ** 2);
      const A = Math.atan(av / bv) * 180 / Math.PI;
      const B = 90 - A;
      return { a: av, b: bv, c: cv, A, B, perimeter: av + bv + cv, area: 0.5 * av * bv };
    }
    if (mode === "findB") {
      const av = parseFloat(a), cv = parseFloat(c);
      if (isNaN(av) || isNaN(cv) || av <= 0 || cv <= 0) return null;
      if (cv <= av) return { error: "Hypotenuse c must be greater than leg a." };
      const bv = Math.sqrt(cv ** 2 - av ** 2);
      const A = Math.atan(av / bv) * 180 / Math.PI;
      const B = 90 - A;
      return { a: av, b: bv, c: cv, A, B, perimeter: av + bv + cv, area: 0.5 * av * bv };
    }
    // findA
    const bv = parseFloat(b), cv = parseFloat(c);
    if (isNaN(bv) || isNaN(cv) || bv <= 0 || cv <= 0) return null;
    if (cv <= bv) return { error: "Hypotenuse c must be greater than leg b." };
    const av = Math.sqrt(cv ** 2 - bv ** 2);
    const A = Math.atan(av / bv) * 180 / Math.PI;
    const B = 90 - A;
    return { a: av, b: bv, c: cv, A, B, perimeter: av + bv + cv, area: 0.5 * av * bv };
  }, [mode, a, b, c]);

  const verify = useMemo(() => {
    const av = parseFloat(vA), bv = parseFloat(vB), cv = parseFloat(vC);
    if (isNaN(av) || isNaN(bv) || isNaN(cv) || av <= 0 || bv <= 0 || cv <= 0) return null;
    const diff = Math.abs(av ** 2 + bv ** 2 - cv ** 2);
    return { ok: diff < 1e-6, lhs: av ** 2 + bv ** 2, rhs: cv ** 2 };
  }, [vA, vB, vC]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pythagorean Theorem Calculator</h1>
        <p className="muted">Find the missing side of a right triangle using a² + b² = c², where c is the hypotenuse.</p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Find Missing Side</h2>

          <div className="tab-row">
            <button className={`tab-btn${mode === "findC" ? " active" : ""}`} onClick={() => setMode("findC")}>Find c</button>
            <button className={`tab-btn${mode === "findB" ? " active" : ""}`} onClick={() => setMode("findB")}>Find b</button>
            <button className={`tab-btn${mode === "findA" ? " active" : ""}`} onClick={() => setMode("findA")}>Find a</button>
          </div>

          <div className="row two">
            {mode !== "findA" && (
              <div className="field">
                <label>Leg a</label>
                <input type="number" min="0" value={a} onChange={e => setA(e.target.value)} />
              </div>
            )}
            {mode !== "findB" && (
              <div className="field">
                <label>Leg b</label>
                <input type="number" min="0" value={b} onChange={e => setB(e.target.value)} />
              </div>
            )}
            {mode !== "findC" && (
              <div className="field">
                <label>Hypotenuse c</label>
                <input type="number" min="0" value={c} onChange={e => setC(e.target.value)} />
              </div>
            )}
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>{result.error}</div>
          ) : result ? (
            <>
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-label">a</div><div className="kpi-value">{fmt(result.a)}</div></div>
                <div className="kpi"><div className="kpi-label">b</div><div className="kpi-value">{fmt(result.b)}</div></div>
                <div className="kpi"><div className="kpi-label">c (hypotenuse)</div><div className="kpi-value" style={{ fontSize: 18 }}>{fmt(result.c)}</div></div>
              </div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontFamily: "monospace", fontSize: 13, color: "#4f46e5" }}>
                {mode === "findC" && `c = √(${fmt(result.a)}² + ${fmt(result.b)}²) = ${fmt(result.c)}`}
                {mode === "findB" && `b = √(${fmt(result.c)}² − ${fmt(result.a)}²) = ${fmt(result.b)}`}
                {mode === "findA" && `a = √(${fmt(result.c)}² − ${fmt(result.b)}²) = ${fmt(result.a)}`}
              </div>
            </>
          ) : null}

          <h3 className="card-title" style={{ marginTop: 22 }}>Verify a Right Triangle</h3>
          <p className="small">Enter all three sides to check if they form a right triangle.</p>
          <div className="row two">
            <div className="field"><label>a</label><input type="number" min="0" value={vA} onChange={e => setVA(e.target.value)} /></div>
            <div className="field"><label>b</label><input type="number" min="0" value={vB} onChange={e => setVB(e.target.value)} /></div>
            <div className="field"><label>c (hypotenuse)</label><input type="number" min="0" value={vC} onChange={e => setVC(e.target.value)} /></div>
          </div>
          {verify && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: verify.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${verify.ok ? "#86efac" : "#fca5a5"}`, color: verify.ok ? "#166534" : "#b91c1c", fontSize: 13.5 }}>
              {verify.ok ? "✓ This is a valid Pythagorean triple." : "✗ These sides do NOT form a right triangle."}
              <div style={{ fontSize: 12, marginTop: 3, fontFamily: "monospace" }}>a² + b² = {fmt(verify.lhs)} &nbsp;|&nbsp; c² = {fmt(verify.rhs)}</div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>
          {result && !result.error ? (
            <table className="table" style={{ marginBottom: 16 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Leg a</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.a)}</td></tr>
                <tr><td>Leg b</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.b)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Hypotenuse c</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.c)}</td></tr>
                <tr><td>Angle A</td><td style={{ fontFamily: "monospace" }}>{fmt(result.A)}°</td></tr>
                <tr><td>Angle B</td><td style={{ fontFamily: "monospace" }}>{fmt(result.B)}°</td></tr>
                <tr><td>Angle C</td><td style={{ fontFamily: "monospace" }}>90°</td></tr>
                <tr><td>Perimeter</td><td style={{ fontFamily: "monospace" }}>{fmt(result.perimeter)}</td></tr>
                <tr><td>Area</td><td style={{ fontFamily: "monospace" }}>{fmt(result.area)}</td></tr>
              </tbody>
            </table>
          ) : <p className="small">Enter two sides to calculate the missing side.</p>}

          <h3 className="card-title" style={{ marginTop: 16 }}>Common Pythagorean Triples</h3>
          <table className="table">
            <thead><tr><th>a</th><th>b</th><th>c</th></tr></thead>
            <tbody>
              {TRIPLES.map(([ta, tb, tc]) => (
                <tr key={`${ta}-${tb}-${tc}`}>
                  <td>{ta}</td><td>{tb}</td><td style={{ fontWeight: 700 }}>{tc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
