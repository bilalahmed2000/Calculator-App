import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const Z_CRIT = { "80": 1.2816, "85": 1.4395, "90": 1.6449, "95": 1.9600, "99": 2.5758 };

const fmt = (v, d = 4) => isFinite(v) ? Math.ceil(v).toLocaleString("en-US") : "—";
const fmtD = (v, d = 4) => isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toString() : "—";

export default function SampleSizeCalculator() {
  const [tab, setTab] = useState("proportion");
  const [cl, setCl] = useState("95");

  // Proportion inputs
  const [p, setP]   = useState("0.5");
  const [e, setE]   = useState("0.05");

  // Mean inputs
  const [sigma, setSigma] = useState("15");
  const [eM, setEM]       = useState("3");

  // Finite population correction
  const [useFinite, setUseFinite] = useState(false);
  const [popSize, setPopSize]     = useState("10000");

  const z = Z_CRIT[cl] ?? 1.96;

  const resultProp = useMemo(() => {
    const pv = parseFloat(p), ev = parseFloat(e);
    if (isNaN(pv) || isNaN(ev) || pv < 0 || pv > 1 || ev <= 0 || ev >= 1) return null;
    const q = 1 - pv;
    const n0 = (z * z * pv * q) / (ev * ev);
    let n = n0;
    if (useFinite) {
      const N = parseFloat(popSize);
      if (!isNaN(N) && N > 0) n = n0 / (1 + (n0 - 1) / N);
    }
    return { n0, n, z, p: pv, q, e: ev };
  }, [p, e, cl, useFinite, popSize, z]);

  const resultMean = useMemo(() => {
    const sv = parseFloat(sigma), ev = parseFloat(eM);
    if (isNaN(sv) || isNaN(ev) || sv <= 0 || ev <= 0) return null;
    const n0 = (z * sv / ev) ** 2;
    let n = n0;
    if (useFinite) {
      const N = parseFloat(popSize);
      if (!isNaN(N) && N > 0) n = n0 / (1 + (n0 - 1) / N);
    }
    return { n0, n, z, sigma: sv, e: ev };
  }, [sigma, eM, cl, useFinite, popSize, z]);

  const CL_OPTIONS = ["80", "85", "90", "95", "99"];

  // Reference table data
  const refRows = [
    { e: "±1%",  n95: 9604,  n99: 16587 },
    { e: "±2%",  n95: 2401,  n99: 4147 },
    { e: "±3%",  n95: 1067,  n99: 1843 },
    { e: "±4%",  n95: 600,   n99: 1037 },
    { e: "±5%",  n95: 384,   n99: 664 },
    { e: "±10%", n95: 96,    n99: 166 },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Sample Size Calculator</h1>
        <p className="muted">
          Determine the minimum sample size needed to estimate a population proportion
          or population mean with a given confidence level and margin of error.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Type</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "proportion" ? " active" : ""}`} onClick={() => setTab("proportion")}>Population Proportion</button>
            <button className={`tab-btn${tab === "mean"       ? " active" : ""}`} onClick={() => setTab("mean")}>Population Mean</button>
          </div>

          <div className="row two">
            <div className="field">
              <label>Confidence Level</label>
              <select value={cl} onChange={e => setCl(e.target.value)}>
                {CL_OPTIONS.map(c => <option key={c} value={c}>{c}%</option>)}
              </select>
            </div>
            <div className="field">
              <label>Critical Value (z*)</label>
              <input type="text" readOnly value={z} style={{ background: "#f8f9ff" }} />
            </div>
          </div>

          <div className="row two">
            <div className="field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="finite" checked={useFinite} onChange={e => setUseFinite(e.target.checked)} style={{ width: "auto" }} />
              <label htmlFor="finite" style={{ marginBottom: 0 }}>Finite population correction</label>
            </div>
            {useFinite && (
              <div className="field">
                <label>Population size (N)</label>
                <input type="number" min="1" value={popSize} onChange={e => setPopSize(e.target.value)} />
              </div>
            )}
          </div>

          {tab === "proportion" && (
            <>
              <p className="small">Estimates sample size to determine a population proportion p within margin of error E.</p>
              <p className="small" style={{ marginTop: 2 }}>Formula: n = z²·p·(1−p) / E²</p>
              <div className="row two">
                <div className="field">
                  <label>Estimated proportion (p)</label>
                  <input type="number" min="0" max="1" step="0.01" value={p} onChange={e => setP(e.target.value)} />
                  <span className="small">Use 0.5 for maximum sample size</span>
                </div>
                <div className="field">
                  <label>Margin of error (E)</label>
                  <input type="number" min="0.001" max="0.999" step="0.01" value={e} onChange={e => setE(e.target.value)} />
                  <span className="small">e.g. 0.05 for ±5%</span>
                </div>
              </div>

              {resultProp && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                    Required Sample Size ({cl}% CI, ±{(resultProp.e * 100).toFixed(1)}%)
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(resultProp.n)}</div>
                  {useFinite && <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                    Unadjusted n₀ = {Math.ceil(resultProp.n0).toLocaleString()} → adjusted for N = {parseInt(popSize).toLocaleString()}
                  </div>}
                </div>
              )}
            </>
          )}

          {tab === "mean" && (
            <>
              <p className="small">Estimates sample size to estimate a population mean within margin of error E.</p>
              <p className="small" style={{ marginTop: 2 }}>Formula: n = (z · σ / E)²</p>
              <div className="row two">
                <div className="field">
                  <label>Population Std Dev (σ)</label>
                  <input type="number" min="0" value={sigma} onChange={e => setSigma(e.target.value)} />
                </div>
                <div className="field">
                  <label>Margin of error (E)</label>
                  <input type="number" min="0" value={eM} onChange={e => setEM(e.target.value)} />
                </div>
              </div>

              {resultMean && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                    Required Sample Size ({cl}% CI, ±{resultMean.e})
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(resultMean.n)}</div>
                  {useFinite && <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                    Unadjusted n₀ = {Math.ceil(resultMean.n0).toLocaleString()} → adjusted for N = {parseInt(popSize).toLocaleString()}
                  </div>}
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "proportion" && resultProp && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Confidence Level</td><td style={{ fontFamily: "monospace" }}>{cl}%</td></tr>
                <tr><td>Critical value (z*)</td><td style={{ fontFamily: "monospace" }}>{resultProp.z}</td></tr>
                <tr><td>Proportion (p)</td><td style={{ fontFamily: "monospace" }}>{resultProp.p}</td></tr>
                <tr><td>1 − p = q</td><td style={{ fontFamily: "monospace" }}>{fmtD(resultProp.q)}</td></tr>
                <tr><td>Margin of Error (E)</td><td style={{ fontFamily: "monospace" }}>±{resultProp.e} ({(resultProp.e * 100).toFixed(1)}%)</td></tr>
                <tr><td>Unadjusted n₀</td><td style={{ fontFamily: "monospace" }}>{Math.ceil(resultProp.n0).toLocaleString()}</td></tr>
                {useFinite && <tr><td>Population size (N)</td><td style={{ fontFamily: "monospace" }}>{parseInt(popSize).toLocaleString()}</td></tr>}
                <tr style={{ background: "#f0eeff" }}><td><strong>Required n</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultProp.n)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "mean" && resultMean && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Confidence Level</td><td style={{ fontFamily: "monospace" }}>{cl}%</td></tr>
                <tr><td>Critical value (z*)</td><td style={{ fontFamily: "monospace" }}>{resultMean.z}</td></tr>
                <tr><td>Std Deviation (σ)</td><td style={{ fontFamily: "monospace" }}>{resultMean.sigma}</td></tr>
                <tr><td>Margin of Error (E)</td><td style={{ fontFamily: "monospace" }}>±{resultMean.e}</td></tr>
                <tr><td>Unadjusted n₀</td><td style={{ fontFamily: "monospace" }}>{Math.ceil(resultMean.n0).toLocaleString()}</td></tr>
                {useFinite && <tr><td>Population size (N)</td><td style={{ fontFamily: "monospace" }}>{parseInt(popSize).toLocaleString()}</td></tr>}
                <tr style={{ background: "#f0eeff" }}><td><strong>Required n</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultMean.n)}</td></tr>
              </tbody>
            </table>
          )}

          {!resultProp && !resultMean && <p className="small">Enter values to calculate sample size.</p>}

          <h3 className="card-title" style={{ marginTop: 16 }}>Reference: Proportion (p = 0.5)</h3>
          <table className="table">
            <thead><tr><th>Margin of Error</th><th>n (95% CI)</th><th>n (99% CI)</th></tr></thead>
            <tbody>
              {refRows.map(r => (
                <tr key={r.e}>
                  <td style={{ fontFamily: "monospace" }}>{r.e}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.n95.toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.n99.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
