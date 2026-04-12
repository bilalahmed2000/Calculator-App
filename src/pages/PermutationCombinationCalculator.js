import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

/* global BigInt */
function factBig(n) {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}
function permBig(n, r) {
  if (r > n) return 0n;
  return factBig(n) / factBig(n - r);
}
function combBig(n, r) {
  if (r > n) return 0n;
  return factBig(n) / (factBig(r) * factBig(n - r));
}
function fmtBig(v) {
  const s = v.toString();
  if (s.length <= 15) return Number(v).toLocaleString("en-US");
  return s.length + "-digit number";
}

export default function PermutationCombinationCalculator() {
  const [n, setN] = useState("10");
  const [r, setR] = useState("3");

  const result = useMemo(() => {
    const nv = parseInt(n), rv = parseInt(r);
    if (isNaN(nv) || isNaN(rv) || nv < 0 || rv < 0) return null;
    if (rv > nv) return { error: "r cannot be greater than n." };
    if (nv > 170) return { error: "n is too large (max 170 for exact calculation)." };

    const P   = permBig(nv, rv);
    const C   = combBig(nv, rv);
    const Prep = BigInt(nv) ** BigInt(rv);   // P with repetition = n^r
    const Crep = combBig(nv + rv - 1, rv);  // C with repetition = C(n+r-1, r)

    return { P, C, Prep, Crep, n: nv, r: rv };
  }, [n, r]);

  // Pascal's triangle rows for reference
  const pascal = useMemo(() => {
    const rows = [];
    for (let i = 0; i <= 7; i++) {
      const row = [];
      for (let j = 0; j <= i; j++) row.push(Number(combBig(i, j)));
      rows.push(row);
    }
    return rows;
  }, []);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Permutation and Combination Calculator</h1>
        <p className="muted">
          Calculate permutations P(n,r) and combinations C(n,r) — with and without repetition.
          Find how many ways to arrange or select r items from n distinct items.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row two">
            <div className="field">
              <label>n (total items)</label>
              <input type="number" min="0" max="170" value={n} onChange={e => setN(e.target.value)} />
            </div>
            <div className="field">
              <label>r (items to choose)</label>
              <input type="number" min="0" value={r} onChange={e => setR(e.target.value)} />
            </div>
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              {result.error}
            </div>
          ) : result ? (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi">
                <div className="kpi-label">P(n,r) — Permutation</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{fmtBig(result.P)}</div>
                <div className="kpi-sub">without repetition</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">C(n,r) — Combination</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{fmtBig(result.C)}</div>
                <div className="kpi-sub">without repetition</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Pᵣₑₚ — Permutation</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{fmtBig(result.Prep)}</div>
                <div className="kpi-sub">with repetition (nʳ)</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Cᵣₑₚ — Combination</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{fmtBig(result.Crep)}</div>
                <div className="kpi-sub">with repetition</div>
              </div>
            </div>
          ) : null}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Type</th><th>Formula</th><th>Order matters?</th><th>Repetition?</th></tr></thead>
            <tbody>
              <tr style={{ background: "#f0eeff" }}>
                <td><strong>Permutation</strong></td>
                <td style={{ fontFamily: "monospace" }}>n! / (n−r)!</td>
                <td>Yes</td><td>No</td>
              </tr>
              <tr>
                <td><strong>Combination</strong></td>
                <td style={{ fontFamily: "monospace" }}>n! / (r!(n−r)!)</td>
                <td>No</td><td>No</td>
              </tr>
              <tr>
                <td>Perm (rep)</td>
                <td style={{ fontFamily: "monospace" }}>nʳ</td>
                <td>Yes</td><td>Yes</td>
              </tr>
              <tr>
                <td>Comb (rep)</td>
                <td style={{ fontFamily: "monospace" }}>C(n+r−1, r)</td>
                <td>No</td><td>Yes</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Step-by-step</h2>

          {result && !result.error ? (
            <table className="table" style={{ marginBottom: 16 }}>
              <thead><tr><th>Property</th><th>Calculation</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>P({result.n},{result.r})</strong></td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{result.n}! / ({result.n}−{result.r})! = {result.n}! / {result.n - result.r}!</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtBig(result.P)}</td>
                </tr>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>C({result.n},{result.r})</strong></td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{result.n}! / ({result.r}! × {result.n - result.r}!)</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtBig(result.C)}</td>
                </tr>
                <tr>
                  <td>Pᵣₑₚ({result.n},{result.r})</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{result.n}^{result.r}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtBig(result.Prep)}</td>
                </tr>
                <tr>
                  <td>Cᵣₑₚ({result.n},{result.r})</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>C({result.n + result.r - 1},{result.r})</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtBig(result.Crep)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Enter n and r to calculate permutations and combinations.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 10 }}>Pascal's Triangle (C(n,r))</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>n\r</th>{[0,1,2,3,4,5,6,7].map(i => <th key={i}>{i}</th>)}</tr></thead>
              <tbody>
                {pascal.map((row, i) => (
                  <tr key={i} style={result && result.n === i ? { background: "#f0eeff" } : {}}>
                    <td style={{ fontWeight: 700 }}>{i}</td>
                    {[0,1,2,3,4,5,6,7].map(j => (
                      <td key={j} style={{ fontFamily: "monospace", textAlign: "center", fontWeight: result && result.n === i && result.r === j ? 800 : 400, color: result && result.n === i && result.r === j ? "#4f46e5" : "inherit" }}>
                        {j <= i ? row[j] : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
