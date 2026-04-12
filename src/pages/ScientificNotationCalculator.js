import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// Parse scientific notation string like "3.2e5" or "3.2 × 10^5"
function parseSN(s) {
  const clean = s.trim().replace(/×\s*10\^?/gi, "e").replace(/\s/g, "");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

// Format as a × 10^b
function toSN(n, sigFigs = 5) {
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const coef = n / Math.pow(10, exp);
  const fmtCoef = (Math.round(coef * Math.pow(10, sigFigs - 1)) / Math.pow(10, sigFigs - 1));
  return `${fmtCoef} × 10^${exp}`;
}

const OPS = ["+", "−", "×", "÷"];

export default function ScientificNotationCalculator() {
  const [tab, setTab] = useState("convert"); // "convert" | "arithmetic"
  const [input, setInput] = useState("0.000045678");
  const [sigFigs, setSigFigs] = useState(4);
  const [a, setA]   = useState("3.2e5");
  const [b, setB]   = useState("4.5e3");
  const [op, setOp] = useState("×");

  const n = useMemo(() => parseSN(input), [input]);
  const va = useMemo(() => parseSN(a), [a]);
  const vb = useMemo(() => parseSN(b), [b]);

  const converted = useMemo(() => {
    if (n === null) return null;
    const exp = n !== 0 ? Math.floor(Math.log10(Math.abs(n))) : 0;
    const coef = n !== 0 ? n / Math.pow(10, exp) : 0;
    return {
      standard: n.toLocaleString("en-US", { maximumSignificantDigits: 10 }),
      sci: n.toExponential(Number(sigFigs) - 1),
      coef: Math.round(coef * 1e10) / 1e10,
      exp,
      pretty: toSN(n, Number(sigFigs)),
    };
  }, [n, sigFigs]);

  const calcResult = useMemo(() => {
    if (va === null || vb === null) return null;
    let r;
    switch (op) {
      case "+": r = va + vb; break;
      case "−": r = va - vb; break;
      case "×": r = va * vb; break;
      case "÷": if (vb === 0) return { error: "Division by zero" }; r = va / vb; break;
      default: r = 0;
    }
    const exp = r !== 0 ? Math.floor(Math.log10(Math.abs(r))) : 0;
    return {
      val: r,
      sci: r.toExponential(Number(sigFigs) - 1),
      pretty: toSN(r, Number(sigFigs)),
      exp,
    };
  }, [va, vb, op, sigFigs]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Scientific Notation Calculator</h1>
        <p className="muted">
          Convert numbers to and from scientific notation. Perform arithmetic operations
          on numbers in scientific notation with configurable significant figures.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "convert" ? " active" : ""}`} onClick={() => setTab("convert")}>Convert</button>
            <button className={`tab-btn${tab === "arithmetic" ? " active" : ""}`} onClick={() => setTab("arithmetic")}>Arithmetic</button>
          </div>

          <div className="row">
            <div className="field">
              <label>Significant Figures</label>
              <input type="number" min={1} max={15} value={sigFigs}
                onChange={e => setSigFigs(e.target.value)} />
            </div>
          </div>

          {tab === "convert" && (
            <div className="row">
              <div className="field">
                <label>Number (standard or scientific notation)</label>
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="e.g. 0.000045678 or 4.5e-5" />
              </div>
            </div>
          )}

          {tab === "arithmetic" && (
            <>
              <div className="row">
                <div className="field">
                  <label>First Number (A)</label>
                  <input type="text" value={a} onChange={e => setA(e.target.value)}
                    placeholder="e.g. 3.2e5" />
                  {va !== null && <div className="small" style={{ marginTop: 3 }}>{toSN(va, 4)}</div>}
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
                  <input type="text" value={b} onChange={e => setB(e.target.value)}
                    placeholder="e.g. 4.5e3" />
                  {vb !== null && <div className="small" style={{ marginTop: 3 }}>{toSN(vb, 4)}</div>}
                </div>
              </div>
            </>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            Enter numbers as standard decimals (e.g. <strong>0.0045</strong>) or scientific notation
            (e.g. <strong>4.5e-3</strong> or <strong>4.5×10^-3</strong>).
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "convert" && (
            converted ? (
              <>
                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-label">Scientific Notation</div>
                    <div className="kpi-value" style={{ fontSize: 17 }}>{converted.sci}</div>
                    <div className="kpi-sub">{sigFigs} sig. fig.</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Written Form</div>
                    <div className="kpi-value" style={{ fontSize: 15 }}>{converted.pretty}</div>
                  </div>
                </div>
                <table className="table" style={{ marginTop: 14 }}>
                  <thead><tr><th>Form</th><th>Value</th></tr></thead>
                  <tbody>
                    <tr><td>Standard notation</td><td style={{ fontFamily: "monospace" }}>{converted.standard}</td></tr>
                    <tr style={{ background: "#f0eeff" }}><td><strong>Scientific notation (E)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800 }}>{converted.sci}</td></tr>
                    <tr><td>Written form</td><td>{converted.pretty}</td></tr>
                    <tr><td>Coefficient</td><td>{converted.coef}</td></tr>
                    <tr><td>Exponent (power of 10)</td><td>{converted.exp}</td></tr>
                  </tbody>
                </table>
              </>
            ) : (
              <p className="small">Enter a number to convert.</p>
            )
          )}

          {tab === "arithmetic" && (
            calcResult ? (
              calcResult.error ? (
                <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13.5 }}>
                  {calcResult.error}
                </div>
              ) : (
                <>
                  <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                      {a} {op} {b} =
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                      {calcResult.sci}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{calcResult.pretty}</div>
                  </div>
                  <table className="table">
                    <thead><tr><th>Form</th><th>Value</th></tr></thead>
                    <tbody>
                      <tr style={{ background: "#f0eeff" }}><td><strong>Scientific (E)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{calcResult.sci}</td></tr>
                      <tr><td>Standard</td><td style={{ fontFamily: "monospace" }}>{calcResult.val.toLocaleString("en-US", { maximumSignificantDigits: 10 })}</td></tr>
                      <tr><td>Written</td><td>{calcResult.pretty}</td></tr>
                    </tbody>
                  </table>
                </>
              )
            ) : (
              <p className="small">Enter two numbers and select an operation.</p>
            )
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Prefix</th><th>Power</th><th>Name</th></tr></thead>
            <tbody>
              {[
                ["T", "10¹²", "Trillion"],
                ["G", "10⁹",  "Billion"],
                ["M", "10⁶",  "Million"],
                ["k", "10³",  "Thousand"],
                ["",  "10⁰",  "One"],
                ["m", "10⁻³", "Thousandth"],
                ["μ", "10⁻⁶", "Millionth"],
                ["n", "10⁻⁹", "Billionth"],
              ].map(([p, pw, n]) => <tr key={n}><td>{p}</td><td>{pw}</td><td>{n}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
