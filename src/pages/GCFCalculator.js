import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a / gcd(a, b)) * b; }

function euclidSteps(a, b) {
  const steps = [];
  let x = Math.abs(a), y = Math.abs(b);
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ x, y, q, r });
    x = y; y = r;
  }
  return { gcf: x, steps };
}

function primeFactors(n) {
  const factors = {};
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      n = Math.floor(n / d);
    }
    d++;
    if (d * d > n && n > 1) { factors[n] = (factors[n] || 0) + 1; break; }
  }
  return factors;
}

function pfStr(n) {
  const f = primeFactors(n);
  return Object.entries(f).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(" × ") || String(n);
}

export default function GCFCalculator() {
  const [input, setInput] = useState("48, 36, 24");

  const result = useMemo(() => {
    const nums = input.split(/[\s,;]+/).map(Number).filter(n => Number.isInteger(n) && n > 0);
    if (nums.length < 2) return null;
    if (nums.some(n => n > 1e12)) return { error: "Numbers must be ≤ 1,000,000,000,000." };

    const gcfVal = nums.reduce((acc, n) => gcd(acc, n));
    const lcmVal = nums.reduce((acc, n) => lcm(acc, n));

    // Step-by-step for first two numbers
    const { steps } = euclidSteps(nums[0], nums[1]);

    return { nums, gcfVal, lcmVal, steps };
  }, [input]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>GCF Calculator</h1>
        <p className="muted">
          Find the Greatest Common Factor (GCF), also called Greatest Common Divisor (GCD),
          of two or more integers. Also shows LCM and Euclidean algorithm steps.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>
          <div className="row">
            <div className="field">
              <label>Numbers (comma or space separated, positive integers)</label>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. 48, 36, 24" style={{ fontFamily: "monospace" }} />
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
                  <div className="kpi-label">GCF / GCD</div>
                  <div className="kpi-value">{result.gcfVal.toLocaleString()}</div>
                  <div className="kpi-sub">of {result.nums.join(", ")}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">LCM</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>{result.lcmVal.toLocaleString()}</div>
                </div>
              </div>

              <h3 className="card-title" style={{ marginTop: 18 }}>Prime Factorizations</h3>
              <table className="table">
                <thead><tr><th>Number</th><th>Prime Factors</th></tr></thead>
                <tbody>
                  {result.nums.map(n => (
                    <tr key={n}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{n.toLocaleString()}</td>
                      <td style={{ fontFamily: "monospace" }}>{pfStr(n)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>GCF = {result.gcfVal.toLocaleString()}</strong></td>
                    <td style={{ fontFamily: "monospace" }}>{pfStr(result.gcfVal)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter at least two positive integers separated by commas.</p>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td>GCF / GCD</td><td>Largest integer that divides all given numbers evenly</td></tr>
              <tr><td>LCM</td><td>Smallest positive integer divisible by all given numbers</td></tr>
              <tr><td>Co-prime</td><td>GCF = 1 (no common factors except 1)</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Euclidean Algorithm Steps</h2>
          <p className="small">Step-by-step for the first two numbers.</p>

          {result && result.steps.length > 0 ? (
            <>
              <table className="table">
                <thead><tr><th>Step</th><th>Division</th><th>Remainder</th></tr></thead>
                <tbody>
                  {result.steps.map((s, i) => (
                    <tr key={i} style={s.r === 0 ? { background: "#f0eeff" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace" }}>{s.x} = {s.q} × {s.y} + {s.r}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: s.r === 0 ? 800 : 400 }}>{s.r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontFamily: "monospace", fontSize: 13, color: "#4f46e5", fontWeight: 700 }}>
                GCF({result.nums[0]}, {result.nums[1]}) = {gcd(result.nums[0], result.nums[1]).toLocaleString()}
              </div>

              {result.nums.length > 2 && (
                <>
                  <h3 className="card-title" style={{ marginTop: 16 }}>Multi-number GCF Chain</h3>
                  <table className="table">
                    <thead><tr><th>Step</th><th>Calculation</th><th>Result</th></tr></thead>
                    <tbody>
                      {result.nums.slice(1).reduce((acc, n, i) => {
                        const prev = i === 0 ? result.nums[0] : acc[acc.length - 1].gcf;
                        const g = gcd(prev, n);
                        acc.push({ a: prev, b: n, gcf: g });
                        return acc;
                      }, []).map((row, i) => (
                        <tr key={i} style={i === result.nums.length - 2 ? { background: "#f0eeff" } : {}}>
                          <td>{i + 1}</td>
                          <td style={{ fontFamily: "monospace" }}>GCF({row.a.toLocaleString()}, {row.b.toLocaleString()})</td>
                          <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{row.gcf.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          ) : (
            <p className="small">Enter numbers to see step-by-step solution.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>GCF × LCM Relationship</h3>
          <table className="table">
            <thead><tr><th>Property</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>For two numbers</td><td style={{ fontFamily: "monospace" }}>GCF(a,b) × LCM(a,b) = a × b</td></tr>
              <tr><td>LCM from GCF</td><td style={{ fontFamily: "monospace" }}>LCM = (a × b) / GCF(a,b)</td></tr>
              <tr><td>Euclidean step</td><td style={{ fontFamily: "monospace" }}>GCF(a,b) = GCF(b, a mod b)</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
