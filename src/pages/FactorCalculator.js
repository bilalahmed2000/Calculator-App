import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function getAllFactors(n) {
  const factors = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
}

function primeFactors(n) {
  const factors = [];
  let d = 2, m = n;
  while (m > 1) {
    while (m % d === 0) { factors.push(d); m = Math.floor(m / d); }
    d++;
    if (d * d > m && m > 1) { factors.push(m); break; }
  }
  return factors;
}

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
  return true;
}

function isPerfect(n) {
  if (n < 2) return false;
  return getAllFactors(n).slice(0, -1).reduce((a, b) => a + b, 0) === n;
}

export default function FactorCalculator() {
  const [input, setInput] = useState("360");

  const result = useMemo(() => {
    const n = parseInt(input.replace(/,/g, "").trim());
    if (isNaN(n) || n <= 0) return null;
    if (n > 1e10) return { error: "Number must be ≤ 10,000,000,000." };

    const factors = getAllFactors(n);
    const pf = primeFactors(n);
    const prime = isPrime(n);
    const perfect = isPerfect(n);

    // Prime factorization as exponent map
    const pfMap = {};
    pf.forEach(p => { pfMap[p] = (pfMap[p] || 0) + 1; });
    const pfStr = Object.entries(pfMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(" × ");

    // Factor pairs
    const pairs = [];
    for (let i = 0; i < factors.length; i++) {
      const a = factors[i], b = n / a;
      if (a <= b) pairs.push([a, b]);
    }

    return { n, factors, pf, pfMap, pfStr, prime, perfect, pairs };
  }, [input]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Factor Calculator</h1>
        <p className="muted">
          Find all factors (divisors) of a positive integer, prime factorization, factor pairs,
          and check if a number is prime or perfect.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>
          <div className="row">
            <div className="field">
              <label>Integer to factor (positive, up to 10 billion)</label>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. 360" style={{ fontFamily: "monospace", fontSize: 16 }} />
            </div>
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              {result.error}
            </div>
          ) : result ? (
            <>
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi">
                  <div className="kpi-label">Total Factors</div>
                  <div className="kpi-value">{result.factors.length}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Factor Pairs</div>
                  <div className="kpi-value">{result.pairs.length}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: result.prime ? "#f0fdf4" : "#fef2f2",
                  color: result.prime ? "#166534" : "#b91c1c",
                  border: `1px solid ${result.prime ? "#86efac" : "#fca5a5"}`
                }}>
                  {result.prime ? "✓ Prime" : "✗ Composite"}
                </span>
                {result.perfect && (
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13, background: "#f0eeff", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.3)" }}>
                    ★ Perfect Number
                  </span>
                )}
              </div>

              <div style={{ marginTop: 12, padding: "12px 14px", background: "#f0eeff", borderRadius: 10, fontFamily: "monospace", fontSize: 14, color: "#4f46e5", fontWeight: 700 }}>
                {result.n.toLocaleString()} = {result.pfStr}
              </div>

              <h3 className="card-title" style={{ marginTop: 16 }}>Prime Factorization Steps</h3>
              <table className="table">
                <thead><tr><th>Divisor</th><th>Quotient</th></tr></thead>
                <tbody>
                  {(() => {
                    const rows = [];
                    let m = result.n;
                    for (const p of result.pf) {
                      rows.push({ div: p, quot: Math.floor(m / p) });
                      m = Math.floor(m / p);
                    }
                    return rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: "monospace" }}>{r.div}</td>
                        <td style={{ fontFamily: "monospace", fontWeight: r.quot === 1 ? 800 : 400 }}>{r.quot}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter a positive integer to find all its factors.</p>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">All Factors & Pairs</h2>

          {result ? (
            <>
              <h3 className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>
                All {result.factors.length} Factors of {result.n.toLocaleString()}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {result.factors.map(f => (
                  <span key={f} style={{
                    display: "inline-block", padding: "3px 10px",
                    background: Object.keys(result.pfMap).includes(String(f)) ? "#f0eeff" : "#f8f9ff",
                    borderRadius: 6, fontFamily: "monospace", fontSize: 13, fontWeight: 700,
                    color: Object.keys(result.pfMap).includes(String(f)) ? "#4f46e5" : "#374151",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}>
                    {f.toLocaleString()}
                  </span>
                ))}
              </div>

              <h3 className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>Factor Pairs</h3>
              <table className="table">
                <thead><tr><th>#</th><th>Factor A</th><th>Factor B</th><th>Check</th></tr></thead>
                <tbody>
                  {result.pairs.map(([a, b], i) => (
                    <tr key={i} style={a === b ? { background: "#f0eeff" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{a.toLocaleString()}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{b.toLocaleString()}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7a9e" }}>{a} × {b} = {result.n.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter a number to see factors and pairs.</p>
          )}
        </section>
      </div>
    </div>
  );
}
