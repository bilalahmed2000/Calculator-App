import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

function fmtNum(v) {
  if (!isFinite(v)) return "undefined";
  if (Math.abs(v) > 1e15 || (Math.abs(v) < 1e-7 && v !== 0)) return v.toExponential(6);
  const r = Math.round(v * 1e10) / 1e10;
  return r.toString();
}

export default function ExponentCalculator() {
  const [base, setBase]   = useState("2");
  const [exp, setExp]     = useState("10");

  const b = useMemo(() => parseFloat(base), [base]);
  const e = useMemo(() => parseFloat(exp),  [exp]);

  const result = useMemo(() => {
    if (isNaN(b) || isNaN(e)) return null;
    if (b === 0 && e < 0) return { error: "0 cannot be raised to a negative exponent." };
    const val = Math.pow(b, e);
    return { val, sci: val.toExponential(6), isInt: Number.isInteger(e) && Number.isInteger(b) && e >= 0 };
  }, [b, e]);

  // Powers table
  const powersTable = useMemo(() => {
    if (isNaN(b)) return [];
    return [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ex => ({
      exp: ex,
      val: Math.pow(b, ex),
    }));
  }, [b]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Exponent Calculator</h1>
        <p className="muted">
          Calculate any base raised to any power — including negative exponents, fractional
          exponents, and zero exponents. See a full powers table for any base.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Calculate b<sup>n</sup></h2>

          <div className="row two">
            <div className="field">
              <label>Base (b)</label>
              <input type="text" value={base} onChange={e => setBase(e.target.value)}
                placeholder="e.g. 2" />
            </div>
            <div className="field">
              <label>Exponent (n)</label>
              <input type="text" value={exp} onChange={e => setExp(e.target.value)}
                placeholder="e.g. 10" />
            </div>
          </div>

          {result && !result.error && (
            <div style={{ marginTop: 12, padding: "18px 20px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                {b}<sup>{e}</sup> =
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", wordBreak: "break-all" }}>
                {fmtNum(result.val)}
              </div>
              {Math.abs(result.val) > 999 && (
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 6 }}>
                  Scientific notation: <strong>{result.sci}</strong>
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div style={{ marginTop: 12, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, color: "#b91c1c", fontSize: 13.5 }}>
              {result.error}
            </div>
          )}

          <table className="table" style={{ marginTop: 18 }}>
            <thead><tr><th>Property</th><th>Example</th><th>Rule</th></tr></thead>
            <tbody>
              <tr><td>Zero exponent</td><td>b⁰ = 1</td><td>Any base to the power 0 equals 1</td></tr>
              <tr><td>Negative exponent</td><td>b⁻ⁿ = 1/bⁿ</td><td>Reciprocal of positive exponent</td></tr>
              <tr><td>Fractional exponent</td><td>b^(1/n) = ⁿ√b</td><td>nth root of the base</td></tr>
              <tr><td>Product rule</td><td>bᵐ · bⁿ = bᵐ⁺ⁿ</td><td>Add exponents when multiplying</td></tr>
              <tr><td>Power rule</td><td>(bᵐ)ⁿ = bᵐⁿ</td><td>Multiply exponents when raising a power</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Powers of {isNaN(b) ? "..." : b}</h2>
          {!isNaN(b) ? (
            <table className="table">
              <thead><tr><th>Expression</th><th>Value</th><th>Scientific</th></tr></thead>
              <tbody>
                {powersTable.map(row => (
                  <tr key={row.exp} style={row.exp === Number(exp) ? { background: "#f0eeff" } : {}}>
                    <td><strong>{b}<sup>{row.exp}</sup></strong></td>
                    <td>{isFinite(row.val) ? fmtNum(row.val) : "∞"}</td>
                    <td style={{ fontSize: 12, color: "#6b7a9e" }}>{isFinite(row.val) ? row.val.toExponential(3) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="small">Enter a base to see its powers table.</p>
          )}
        </section>
      </div>
    </div>
  );
}
