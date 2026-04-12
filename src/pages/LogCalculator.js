import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

function fmtLog(v) {
  if (!isFinite(v)) return "undefined";
  return (Math.round(v * 1e10) / 1e10).toString();
}

export default function LogCalculator() {
  const [num, setNum]      = useState("100");
  const [customBase, setCustomBase] = useState("5");
  const [mode, setMode]    = useState("log"); // "log" | "antilog"
  const [antiInput, setAntiInput] = useState("2");
  const [antiBase, setAntiBase]   = useState("10");

  const n = useMemo(() => parseFloat(num), [num]);
  const cb = useMemo(() => parseFloat(customBase), [customBase]);

  const logs = useMemo(() => {
    if (isNaN(n) || n <= 0) return null;
    return {
      log10: Math.log10(n),
      ln:    Math.log(n),
      log2:  Math.log2(n),
      logN:  (!isNaN(cb) && cb > 0 && cb !== 1) ? Math.log(n) / Math.log(cb) : null,
    };
  }, [n, cb]);

  const antiResult = useMemo(() => {
    const v = parseFloat(antiInput);
    const base = parseFloat(antiBase);
    if (isNaN(v) || isNaN(base) || base <= 0 || base === 1) return null;
    return { val: Math.pow(base, v), base, v };
  }, [antiInput, antiBase]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Log Calculator</h1>
        <p className="muted">
          Calculate logarithms in any base — log₁₀ (common log), ln (natural log), log₂ (binary log),
          or any custom base. Also calculate antilogarithms.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Logarithm</h2>

          <div className="tab-row">
            <button className={`tab-btn${mode === "log" ? " active" : ""}`} onClick={() => setMode("log")}>
              Logarithm
            </button>
            <button className={`tab-btn${mode === "antilog" ? " active" : ""}`} onClick={() => setMode("antilog")}>
              Antilogarithm
            </button>
          </div>

          {mode === "log" ? (
            <>
              <div className="row">
                <div className="field">
                  <label>Number (must be &gt; 0)</label>
                  <input type="text" value={num} onChange={e => setNum(e.target.value)}
                    placeholder="e.g. 100" />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Custom Base (optional)</label>
                  <input type="text" value={customBase} onChange={e => setCustomBase(e.target.value)}
                    placeholder="e.g. 5" />
                </div>
              </div>

              {n <= 0 && !isNaN(n) && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
                  Logarithm is undefined for numbers ≤ 0.
                </div>
              )}

              {logs && (
                <table className="table" style={{ marginTop: 14 }}>
                  <thead><tr><th>Function</th><th>Notation</th><th>Result</th></tr></thead>
                  <tbody>
                    <tr style={{ background: "#f0eeff" }}>
                      <td><strong>Common log</strong></td>
                      <td>log₁₀({n})</td>
                      <td><strong>{fmtLog(logs.log10)}</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Natural log</strong></td>
                      <td>ln({n})</td>
                      <td><strong>{fmtLog(logs.ln)}</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Binary log</strong></td>
                      <td>log₂({n})</td>
                      <td><strong>{fmtLog(logs.log2)}</strong></td>
                    </tr>
                    {logs.logN !== null && (
                      <tr style={{ background: "#f5f3ff" }}>
                        <td><strong>Custom base</strong></td>
                        <td>log<sub>{cb}</sub>({n})</td>
                        <td><strong>{fmtLog(logs.logN)}</strong></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <div className="row two">
                <div className="field">
                  <label>Exponent value (x)</label>
                  <input type="text" value={antiInput} onChange={e => setAntiInput(e.target.value)}
                    placeholder="e.g. 2" />
                </div>
                <div className="field">
                  <label>Base</label>
                  <input type="text" value={antiBase} onChange={e => setAntiBase(e.target.value)}
                    placeholder="e.g. 10" />
                </div>
              </div>
              {antiResult && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                    antilog<sub>{antiResult.base}</sub>({antiResult.v}) = {antiResult.base}<sup>{antiResult.v}</sup>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5" }}>
                    {Math.round(antiResult.val * 1e8) / 1e8}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Log Reference Table</h2>
          <table className="table">
            <thead><tr><th>Number</th><th>log₁₀</th><th>ln</th><th>log₂</th></tr></thead>
            <tbody>
              {[0.001, 0.01, 0.1, 1, 2, Math.E, 10, 100, 1000].map(v => (
                <tr key={v} style={Math.abs(v - n) < 1e-9 ? { background: "#f0eeff" } : {}}>
                  <td>{v === Math.E ? "e" : v}</td>
                  <td>{fmtLog(Math.log10(v))}</td>
                  <td>{fmtLog(Math.log(v))}</td>
                  <td>{fmtLog(Math.log2(v))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="table" style={{ marginTop: 14 }}>
            <thead><tr><th>Property</th><th>Rule</th></tr></thead>
            <tbody>
              <tr><td>Product rule</td><td>log(ab) = log(a) + log(b)</td></tr>
              <tr><td>Quotient rule</td><td>log(a/b) = log(a) − log(b)</td></tr>
              <tr><td>Power rule</td><td>log(aⁿ) = n · log(a)</td></tr>
              <tr><td>Change of base</td><td>log<sub>b</sub>(x) = ln(x) / ln(b)</td></tr>
              <tr><td>log<sub>b</sub>(1)</td><td>= 0 for any base b</td></tr>
              <tr><td>log<sub>b</sub>(b)</td><td>= 1 for any base b</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
