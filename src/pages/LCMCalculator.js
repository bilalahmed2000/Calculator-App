import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a / gcd(a, b)) * b; }

function primeFactors(n) {
  const factors = {};
  let d = 2, m = n;
  while (m > 1) {
    while (m % d === 0) { factors[d] = (factors[d] || 0) + 1; m = Math.floor(m / d); }
    d++;
    if (d * d > m && m > 1) { factors[m] = (factors[m] || 0) + 1; break; }
  }
  return factors;
}

function pfStr(n) {
  const f = primeFactors(n);
  return Object.entries(f).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(" × ") || String(n);
}

export default function LCMCalculator() {
  const [input, setInput] = useState("4, 6, 10");

  const result = useMemo(() => {
    const nums = input.split(/[\s,;]+/).map(Number).filter(n => Number.isInteger(n) && n > 0);
    if (nums.length < 2) return null;
    if (nums.some(n => n > 1e9)) return { error: "Numbers must be ≤ 1,000,000,000." };

    const lcmVal = nums.reduce((acc, n) => lcm(acc, n));
    const gcfVal = nums.reduce((acc, n) => gcd(acc, n));

    // LCM via max exponents of primes
    const allFactors = nums.map(primeFactors);
    const allPrimes = [...new Set(allFactors.flatMap(f => Object.keys(f).map(Number)))].sort((a, b) => a - b);
    const lcmFactors = {};
    allPrimes.forEach(p => { lcmFactors[p] = Math.max(...allFactors.map(f => f[p] || 0)); });

    return { nums, lcmVal, gcfVal, lcmFactors, allFactors, allPrimes };
  }, [input]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>LCM Calculator</h1>
        <p className="muted">
          Find the Least Common Multiple (LCM) of two or more integers using prime factorization.
          Also shows GCF and step-by-step prime factor method.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>
          <div className="row">
            <div className="field">
              <label>Numbers (comma or space separated, positive integers)</label>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. 4, 6, 10" style={{ fontFamily: "monospace" }} />
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
                  <div className="kpi-label">LCM</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>{result.lcmVal.toLocaleString()}</div>
                  <div className="kpi-sub">of {result.nums.join(", ")}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">GCF / GCD</div>
                  <div className="kpi-value">{result.gcfVal.toLocaleString()}</div>
                </div>
              </div>

              <h3 className="card-title" style={{ marginTop: 18 }}>Prime Factorization Method</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Number</th>
                    {result.allPrimes.map(p => <th key={p} style={{ fontFamily: "monospace" }}>{p}</th>)}
                    <th>Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {result.nums.map((n, i) => (
                    <tr key={n}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{n.toLocaleString()}</td>
                      {result.allPrimes.map(p => (
                        <td key={p} style={{ fontFamily: "monospace", textAlign: "center" }}>
                          {result.allFactors[i][p] ? (result.allFactors[i][p] > 1 ? `${p}^${result.allFactors[i][p]}` : p) : "—"}
                        </td>
                      ))}
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{pfStr(n)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>LCM (max)</strong></td>
                    {result.allPrimes.map(p => (
                      <td key={p} style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5", textAlign: "center" }}>
                        {result.lcmFactors[p] > 1 ? `${p}^${result.lcmFactors[p]}` : p}
                      </td>
                    ))}
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5", fontSize: 12 }}>
                      {Object.entries(result.lcmFactors).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(" × ")}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontFamily: "monospace", fontSize: 13, color: "#4f46e5", fontWeight: 700 }}>
                LCM({result.nums.join(", ")}) = {result.lcmVal.toLocaleString()}
              </div>
            </>
          ) : (
            <p className="small">Enter at least two positive integers separated by commas.</p>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">LCM Chain Method</h2>
          <p className="small">For multiple numbers, LCM is computed iteratively.</p>

          {result ? (
            <>
              <table className="table">
                <thead><tr><th>Step</th><th>Calculation</th><th>Result</th></tr></thead>
                <tbody>
                  {result.nums.slice(1).reduce((acc, n, i) => {
                    const prev = i === 0 ? result.nums[0] : acc[acc.length - 1].res;
                    const res = lcm(prev, n);
                    acc.push({ a: prev, b: n, res });
                    return acc;
                  }, []).map((row, i) => (
                    <tr key={i} style={i === result.nums.length - 2 ? { background: "#f0eeff" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace" }}>LCM({row.a.toLocaleString()}, {row.b.toLocaleString()})</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{row.res.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter numbers to see LCM chain.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Formulas & Properties</h3>
          <table className="table">
            <thead><tr><th>Property</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>LCM from GCF</td><td style={{ fontFamily: "monospace" }}>LCM(a,b) = a×b / GCF(a,b)</td></tr>
              <tr><td>Prime factorization</td><td style={{ fontFamily: "monospace" }}>Take highest power of each prime</td></tr>
              <tr><td>Relationship</td><td style={{ fontFamily: "monospace" }}>GCF × LCM = a × b</td></tr>
              <tr><td>LCM ≥ max(nums)</td><td>Always true</td></tr>
              <tr><td>If GCF = 1</td><td style={{ fontFamily: "monospace" }}>LCM = a × b</td></tr>
            </tbody>
          </table>

          <h3 className="card-title" style={{ marginTop: 18 }}>Common LCM Examples</h3>
          <table className="table">
            <thead><tr><th>Numbers</th><th>LCM</th><th>Use case</th></tr></thead>
            <tbody>
              {[[2,3,6,"Adding ½, ⅓, ⅙"],[4,6,12,"Adding ¼, ⅙"],[3,4,12,"Adding ⅓, ¼"],[6,10,30,"Adding ⅙, 1/10"],[5,7,35,"Adding ⅕, 1/7"]].map(([a,b,l,u]) => (
                <tr key={`${a}-${b}`}><td>{a}, {b}</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{l}</td><td style={{ fontSize: 12 }}>{u}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
