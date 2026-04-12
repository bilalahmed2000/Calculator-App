import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => (Math.round(v * 1e8) / 1e8).toString();

export default function QuadraticFormulaCalculator() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-5");
  const [c, setC] = useState("6");

  const result = useMemo(() => {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c);
    if (isNaN(av) || isNaN(bv) || isNaN(cv)) return null;
    if (av === 0) return { error: "Coefficient 'a' cannot be 0 — the equation would be linear, not quadratic." };

    const disc = bv ** 2 - 4 * av * cv;
    const h = -bv / (2 * av);
    const k = cv - bv ** 2 / (4 * av);

    if (disc > 1e-10) {
      const x1 = (-bv + Math.sqrt(disc)) / (2 * av);
      const x2 = (-bv - Math.sqrt(disc)) / (2 * av);
      return { disc, x1, x2, h, k, type: "two_real", av, bv, cv };
    } else if (Math.abs(disc) <= 1e-10) {
      const x1 = -bv / (2 * av);
      return { disc: 0, x1, h, k, type: "one_real", av, bv, cv };
    } else {
      const re = -bv / (2 * av);
      const im = Math.sqrt(-disc) / (2 * av);
      return { disc, re, im, h, k, type: "complex", av, bv, cv };
    }
  }, [a, b, c]);

  const sign = v => v >= 0 ? `+ ${Math.abs(v)}` : `− ${Math.abs(v)}`;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Quadratic Formula Calculator</h1>
        <p className="muted">
          Solve ax² + bx + c = 0 using the quadratic formula. Finds real and complex roots,
          discriminant, vertex, and axis of symmetry.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Coefficients</h2>
          <p className="small">Enter coefficients for <strong>ax² + bx + c = 0</strong></p>

          <div className="row two">
            <div className="field">
              <label>a (x² coefficient, ≠ 0)</label>
              <input type="number" value={a} onChange={e => setA(e.target.value)} />
            </div>
            <div className="field">
              <label>b (x coefficient)</label>
              <input type="number" value={b} onChange={e => setB(e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>c (constant term)</label>
              <input type="number" value={c} onChange={e => setC(e.target.value)} />
            </div>
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              {result.error}
            </div>
          ) : result ? (
            <>
              <div style={{ marginTop: 12, padding: "12px 14px", background: "#f8f9ff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)", fontFamily: "monospace", fontSize: 14 }}>
                <span style={{ color: "#6b7a9e" }}>Equation: </span>
                <strong style={{ color: "#1e1b4b" }}>
                  {result.av}x² {sign(result.bv)}x {sign(result.cv)} = 0
                </strong>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                  Discriminant Δ = b² − 4ac
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontFamily: "monospace", fontWeight: 700, fontSize: 14,
                  background: result.disc > 0 ? "#f0fdf4" : result.disc === 0 ? "#fefce8" : "#fef2f2",
                  color:      result.disc > 0 ? "#166534" : result.disc === 0 ? "#854d0e" : "#b91c1c",
                  border:     `1px solid ${result.disc > 0 ? "#86efac" : result.disc === 0 ? "#fde047" : "#fca5a5"}`,
                }}>
                  Δ = {fmt(result.disc)} &nbsp;→&nbsp;
                  {result.type === "two_real"  && "Two distinct real roots"}
                  {result.type === "one_real"  && "One repeated real root (double root)"}
                  {result.type === "complex"   && "Two complex conjugate roots"}
                </div>
              </div>
            </>
          ) : null}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Roots</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>x = (−b ± √(b²−4ac)) / 2a</td></tr>
              <tr><td>Discriminant</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Δ = b² − 4ac</td></tr>
              <tr><td>Vertex x (h)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>h = −b / 2a</td></tr>
              <tr><td>Vertex y (k)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>k = c − b²/4a</td></tr>
              <tr><td>Sum of roots</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>x₁ + x₂ = −b/a</td></tr>
              <tr><td>Product of roots</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>x₁ · x₂ = c/a</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Solutions</h2>

          {result && !result.error ? (
            <>
              {result.type === "two_real" && (
                <div className="kpi-grid">
                  <div className="kpi"><div className="kpi-label">Root x₁</div><div className="kpi-value">{fmt(result.x1)}</div></div>
                  <div className="kpi"><div className="kpi-label">Root x₂</div><div className="kpi-value">{fmt(result.x2)}</div></div>
                </div>
              )}
              {result.type === "one_real" && (
                <div className="kpi-grid">
                  <div className="kpi"><div className="kpi-label">Double Root x₁ = x₂</div><div className="kpi-value">{fmt(result.x1)}</div></div>
                </div>
              )}
              {result.type === "complex" && (
                <div className="kpi-grid">
                  <div className="kpi"><div className="kpi-label">Root x₁</div><div className="kpi-value" style={{ fontSize: 14 }}>{fmt(result.re)} + {fmt(result.im)}i</div></div>
                  <div className="kpi"><div className="kpi-label">Root x₂</div><div className="kpi-value" style={{ fontSize: 14 }}>{fmt(result.re)} − {fmt(result.im)}i</div></div>
                </div>
              )}

              <table className="table" style={{ marginTop: 14 }}>
                <thead><tr><th>Property</th><th>Value</th></tr></thead>
                <tbody>
                  {result.type === "two_real" && <>
                    <tr style={{ background: "#f0eeff" }}><td><strong>x₁</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.x1)}</td></tr>
                    <tr style={{ background: "#f0eeff" }}><td><strong>x₂</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.x2)}</td></tr>
                  </>}
                  {result.type === "one_real" &&
                    <tr style={{ background: "#f0eeff" }}><td><strong>x₁ = x₂</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.x1)}</td></tr>
                  }
                  {result.type === "complex" && <>
                    <tr style={{ background: "#f0eeff" }}><td><strong>x₁</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.re)} + {fmt(result.im)}i</td></tr>
                    <tr style={{ background: "#f0eeff" }}><td><strong>x₂</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.re)} − {fmt(result.im)}i</td></tr>
                  </>}
                  <tr><td>Discriminant (Δ)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.disc)}</td></tr>
                  <tr><td>Vertex (h, k)</td><td style={{ fontFamily: "monospace" }}>({fmt(result.h)}, {fmt(result.k)})</td></tr>
                  <tr><td>Axis of symmetry</td><td style={{ fontFamily: "monospace" }}>x = {fmt(result.h)}</td></tr>
                  <tr><td>y-intercept</td><td style={{ fontFamily: "monospace" }}>(0, {result.cv})</td></tr>
                  <tr><td>Parabola opens</td><td>{result.av > 0 ? "Upward ↑ (minimum at vertex)" : "Downward ↓ (maximum at vertex)"}</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter coefficients a, b, c to solve the quadratic equation.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Discriminant Guide</h3>
          <table className="table">
            <thead><tr><th>Δ</th><th>Roots</th><th>Graph</th></tr></thead>
            <tbody>
              <tr><td>Δ &gt; 0</td><td>Two distinct real roots</td><td>Crosses x-axis twice</td></tr>
              <tr><td>Δ = 0</td><td>One repeated real root</td><td>Touches x-axis once</td></tr>
              <tr><td>Δ &lt; 0</td><td>Two complex conjugate roots</td><td>Never crosses x-axis</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
