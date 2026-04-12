/* global BigInt */
import React, { useState } from "react";
import "../css/CalcBase.css";

function safeBigInt(s) {
  try { return BigInt(s.trim().replace(/,/g, "")); } catch { return null; }
}
function fmtBig(n) {
  const s = n.toString();
  // Add commas every 3 digits for display (only if < 40 chars)
  if (s.length <= 40) return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return s;
}

const OPS = ["+", "−", "×", "÷", "mod", "^", "GCD", "LCM"];

export default function BigNumberCalculator() {
  const [a, setA]   = useState("123456789012345678901234567890");
  const [b, setB]   = useState("987654321098765432109876543210");
  const [op, setOp] = useState("+");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  function gcd(x, y) { return y === 0n ? x : gcd(y, x % y); }
  function lcm(x, y) { return x / gcd(x, y) * y; }
  function bigPow(base, exp) {
    if (exp < 0n) return null; // fractional not supported
    let r = 1n; let b = base;
    while (exp > 0n) {
      if (exp % 2n === 1n) r *= b;
      b *= b; exp /= 2n;
    }
    return r;
  }

  const calculate = () => {
    setError(""); setResult(null);
    const va = safeBigInt(a);
    const vb = op !== "mod" && op !== "GCD" && op !== "LCM" ? safeBigInt(b) : safeBigInt(b);
    if (!va) { setError("First number is not a valid integer."); return; }
    if (!vb && op !== "mod") { setError("Second number is not a valid integer."); return; }
    let r;
    try {
      switch (op) {
        case "+":   r = va + vb; break;
        case "−":   r = va - vb; break;
        case "×":   r = va * vb; break;
        case "÷":
          if (vb === 0n) { setError("Division by zero."); return; }
          r = va / vb; break;
        case "mod":
          if (vb === 0n) { setError("Modulo by zero."); return; }
          r = va % vb; break;
        case "^":
          if (vb < 0n) { setError("Negative exponents not supported for integers."); return; }
          if (vb > 1000n) { setError("Exponent too large (max 1000)."); return; }
          r = bigPow(va, vb); break;
        case "GCD": r = gcd(va < 0n ? -va : va, vb < 0n ? -vb : vb); break;
        case "LCM": r = lcm(va < 0n ? -va : va, vb < 0n ? -vb : vb); break;
        default:    r = 0n;
      }
      if (r === null) { setError("Could not compute result."); return; }
      setResult(r);
    } catch (e) { setError("Computation error: " + e.message); }
  };

  const digits = result !== null ? result.toString().replace("-","").length : 0;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Big Number Calculator</h1>
        <p className="muted">
          Perform arithmetic on arbitrarily large integers beyond normal floating-point precision.
          Supports addition, subtraction, multiplication, division, modulo, exponentiation, GCD, and LCM.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row">
            <div className="field">
              <label>First Number (A) — integers only</label>
              <input type="text" value={a}
                onChange={e => setA(e.target.value.replace(/[^0-9\-]/g, ""))}
                style={{ fontFamily: "monospace", fontSize: 13 }}
                placeholder="e.g. 123456789012345678901234567890" />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Operation</label>
              <select value={op} onChange={e => setOp(e.target.value)}>
                {OPS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Second Number (B)</label>
              <input type="text" value={b}
                onChange={e => setB(e.target.value.replace(/[^0-9\-]/g, ""))}
                style={{ fontFamily: "monospace", fontSize: 13 }}
                placeholder="e.g. 987654321098765432109876543210" />
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={calculate} style={{ marginTop: 8 }}>
            Calculate
          </button>

          <table className="table" style={{ marginTop: 18 }}>
            <thead><tr><th>Operation</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>+, −, ×, ÷</td><td>Standard arithmetic (integer division for ÷)</td></tr>
              <tr><td>mod</td><td>Remainder after division (A mod B)</td></tr>
              <tr><td>^</td><td>Exponentiation (A to the power of B)</td></tr>
              <tr><td>GCD</td><td>Greatest Common Divisor of A and B</td></tr>
              <tr><td>LCM</td><td>Least Common Multiple of A and B</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Result</h2>
          {result !== null ? (
            <>
              <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                  A {op} B =
                </div>
                <div style={{ fontSize: digits > 20 ? 13 : 22, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>
                  {fmtBig(result)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 6 }}>
                  {digits.toLocaleString()} digit{digits !== 1 ? "s" : ""}
                </div>
              </div>

              {digits <= 15 && (
                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-label">Scientific Notation</div>
                    <div className="kpi-value" style={{ fontSize: 16 }}>
                      {Number(result).toExponential(4)}
                    </div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Digit Count</div>
                    <div className="kpi-value">{digits}</div>
                  </div>
                </div>
              )}

              <p className="small" style={{ marginTop: 12 }}>
                Result has <strong>{digits.toLocaleString()}</strong> digit{digits !== 1 ? "s" : ""}.
                Uses JavaScript's native <code>BigInt</code> for exact integer arithmetic with no precision loss.
              </p>
            </>
          ) : (
            <p className="small">Enter two large integers and click Calculate.</p>
          )}
        </section>
      </div>
    </div>
  );
}
