import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 4) => isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

// Critical z-values for common confidence levels
const Z_CRIT = { "80": 1.2816, "85": 1.4395, "90": 1.6449, "95": 1.9600, "99": 2.5758, "99.5": 2.8070, "99.9": 3.2905 };

// t-table critical values [df] → {cl: t}
const T_TABLE = {
  1:  { 80: 3.078, 85: 4.165, 90: 6.314, 95: 12.706, 99: 63.657 },
  2:  { 80: 1.886, 85: 2.282, 90: 2.920, 95:  4.303, 99:  9.925 },
  3:  { 80: 1.638, 85: 1.924, 90: 2.353, 95:  3.182, 99:  5.841 },
  4:  { 80: 1.533, 85: 1.778, 90: 2.132, 95:  2.776, 99:  4.604 },
  5:  { 80: 1.476, 85: 1.699, 90: 2.015, 95:  2.571, 99:  4.032 },
  6:  { 80: 1.440, 85: 1.650, 90: 1.943, 95:  2.447, 99:  3.707 },
  7:  { 80: 1.415, 85: 1.617, 90: 1.895, 95:  2.365, 99:  3.499 },
  8:  { 80: 1.397, 85: 1.592, 90: 1.860, 95:  2.306, 99:  3.355 },
  9:  { 80: 1.383, 85: 1.574, 90: 1.833, 95:  2.262, 99:  3.250 },
  10: { 80: 1.372, 85: 1.559, 90: 1.812, 95:  2.228, 99:  3.169 },
  15: { 80: 1.341, 85: 1.517, 90: 1.753, 95:  2.131, 99:  2.947 },
  20: { 80: 1.325, 85: 1.497, 90: 1.725, 95:  2.086, 99:  2.845 },
  25: { 80: 1.316, 85: 1.485, 90: 1.708, 95:  2.060, 99:  2.787 },
  30: { 80: 1.310, 85: 1.477, 90: 1.697, 95:  2.042, 99:  2.750 },
  40: { 80: 1.303, 85: 1.468, 90: 1.684, 95:  2.021, 99:  2.704 },
  60: { 80: 1.296, 85: 1.458, 90: 1.671, 95:  2.000, 99:  2.660 },
  120:{ 80: 1.289, 85: 1.449, 90: 1.658, 95:  1.980, 99:  2.617 },
};

function getTCrit(df, cl) {
  const dfs = Object.keys(T_TABLE).map(Number).sort((a, b) => a - b);
  let bestDf = dfs[0];
  for (const d of dfs) { if (d <= df) bestDf = d; }
  return T_TABLE[bestDf]?.[cl] ?? Z_CRIT[String(cl)];
}

export default function ConfidenceIntervalCalculator() {
  const [tab, setTab]  = useState("mean");
  const [cl, setCl]    = useState("95");
  // Mean (known σ)
  const [mean, setMean]   = useState("50");
  const [sigma, setSigma] = useState("10");
  const [n, setN]         = useState("30");
  // Mean (unknown σ, use s and t)
  const [meanS, setMeanS] = useState("50");
  const [s, setS]         = useState("12");
  const [ns, setNs]       = useState("15");
  // Proportion
  const [phat, setPhat]   = useState("0.6");
  const [np, setNp]       = useState("200");

  const resultMeanZ = useMemo(() => {
    const xbar = parseFloat(mean), sig = parseFloat(sigma), nv = parseFloat(n), clv = parseFloat(cl);
    if (isNaN(xbar) || isNaN(sig) || isNaN(nv) || sig <= 0 || nv < 1) return null;
    const z = Z_CRIT[cl] ?? 1.96;
    const me = z * sig / Math.sqrt(nv);
    return { lo: xbar - me, hi: xbar + me, me, z };
  }, [mean, sigma, n, cl]);

  const resultMeanT = useMemo(() => {
    const xbar = parseFloat(meanS), sv = parseFloat(s), nv = parseFloat(ns);
    if (isNaN(xbar) || isNaN(sv) || isNaN(nv) || sv <= 0 || nv < 2) return null;
    const df = nv - 1;
    const t = getTCrit(df, parseFloat(cl));
    const me = t * sv / Math.sqrt(nv);
    return { lo: xbar - me, hi: xbar + me, me, t, df };
  }, [meanS, s, ns, cl]);

  const resultProp = useMemo(() => {
    const ph = parseFloat(phat), nv = parseFloat(np);
    if (isNaN(ph) || isNaN(nv) || ph < 0 || ph > 1 || nv < 1) return null;
    const z = Z_CRIT[cl] ?? 1.96;
    const se = Math.sqrt(ph * (1 - ph) / nv);
    const me = z * se;
    return { lo: Math.max(0, ph - me), hi: Math.min(1, ph + me), me, se, z };
  }, [phat, np, cl]);

  const CL_OPTIONS = ["80", "85", "90", "95", "99"];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Confidence Interval Calculator</h1>
        <p className="muted">
          Calculate confidence intervals for a population mean (known or unknown σ)
          and population proportion at various confidence levels.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Type</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "mean"  ? " active" : ""}`} onClick={() => setTab("mean")}>Mean (σ known)</button>
            <button className={`tab-btn${tab === "meant" ? " active" : ""}`} onClick={() => setTab("meant")}>Mean (σ unknown)</button>
            <button className={`tab-btn${tab === "prop"  ? " active" : ""}`} onClick={() => setTab("prop")}>Proportion</button>
          </div>

          <div className="row">
            <div className="field">
              <label>Confidence Level</label>
              <select value={cl} onChange={e => setCl(e.target.value)}>
                {CL_OPTIONS.map(c => <option key={c} value={c}>{c}%</option>)}
              </select>
            </div>
          </div>

          {tab === "mean" && (
            <>
              <p className="small">Use z-distribution when population standard deviation σ is known.</p>
              <div className="row two">
                <div className="field"><label>Sample mean (x̄)</label><input type="number" value={mean} onChange={e => setMean(e.target.value)} /></div>
                <div className="field"><label>Population Std Dev (σ)</label><input type="number" min="0" value={sigma} onChange={e => setSigma(e.target.value)} /></div>
              </div>
              <div className="row"><div className="field"><label>Sample size (n)</label><input type="number" min="1" value={n} onChange={e => setN(e.target.value)} /></div></div>
              {resultMeanZ && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>{cl}% Confidence Interval</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>({fmt(resultMeanZ.lo)}, {fmt(resultMeanZ.hi)})</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>Margin of Error: ±{fmt(resultMeanZ.me)} &nbsp;|&nbsp; z* = {resultMeanZ.z}</div>
                </div>
              )}
            </>
          )}

          {tab === "meant" && (
            <>
              <p className="small">Use t-distribution when σ is unknown — uses sample std dev (s).</p>
              <div className="row two">
                <div className="field"><label>Sample mean (x̄)</label><input type="number" value={meanS} onChange={e => setMeanS(e.target.value)} /></div>
                <div className="field"><label>Sample Std Dev (s)</label><input type="number" min="0" value={s} onChange={e => setS(e.target.value)} /></div>
              </div>
              <div className="row"><div className="field"><label>Sample size (n)</label><input type="number" min="2" value={ns} onChange={e => setNs(e.target.value)} /></div></div>
              {resultMeanT && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>{cl}% Confidence Interval (t, df={resultMeanT.df})</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>({fmt(resultMeanT.lo)}, {fmt(resultMeanT.hi)})</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>Margin of Error: ±{fmt(resultMeanT.me)} &nbsp;|&nbsp; t* = {resultMeanT.t}</div>
                </div>
              )}
            </>
          )}

          {tab === "prop" && (
            <>
              <p className="small">Confidence interval for a population proportion using normal approximation.</p>
              <div className="row two">
                <div className="field"><label>Sample proportion (p̂)</label><input type="number" min="0" max="1" step="0.01" value={phat} onChange={e => setPhat(e.target.value)} /></div>
                <div className="field"><label>Sample size (n)</label><input type="number" min="1" value={np} onChange={e => setNp(e.target.value)} /></div>
              </div>
              {resultProp && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>{cl}% Confidence Interval</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>({fmt(resultProp.lo)}, {fmt(resultProp.hi)})</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>Margin of Error: ±{fmt(resultProp.me)} &nbsp;|&nbsp; z* = {resultProp.z}</div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "mean" && resultMeanZ && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Sample mean (x̄)</td><td style={{ fontFamily: "monospace" }}>{mean}</td></tr>
                <tr><td>Critical value (z*)</td><td style={{ fontFamily: "monospace" }}>{resultMeanZ.z}</td></tr>
                <tr><td>Standard Error (σ/√n)</td><td style={{ fontFamily: "monospace" }}>{fmt(parseFloat(sigma) / Math.sqrt(parseFloat(n)))}</td></tr>
                <tr><td>Margin of Error</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>±{fmt(resultMeanZ.me)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Lower bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultMeanZ.lo)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Upper bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultMeanZ.hi)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "meant" && resultMeanT && (
            <table className="table" style={{ marginBottom: 14 }}>
              <tbody>
                <tr><td>Sample mean (x̄)</td><td style={{ fontFamily: "monospace" }}>{meanS}</td></tr>
                <tr><td>Degrees of freedom</td><td style={{ fontFamily: "monospace" }}>{resultMeanT.df}</td></tr>
                <tr><td>Critical value (t*)</td><td style={{ fontFamily: "monospace" }}>{resultMeanT.t}</td></tr>
                <tr><td>Standard Error (s/√n)</td><td style={{ fontFamily: "monospace" }}>{fmt(parseFloat(s) / Math.sqrt(parseFloat(ns)))}</td></tr>
                <tr><td>Margin of Error</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>±{fmt(resultMeanT.me)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Lower bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultMeanT.lo)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Upper bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultMeanT.hi)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "prop" && resultProp && (
            <table className="table" style={{ marginBottom: 14 }}>
              <tbody>
                <tr><td>Sample proportion (p̂)</td><td style={{ fontFamily: "monospace" }}>{phat}</td></tr>
                <tr><td>Standard Error</td><td style={{ fontFamily: "monospace" }}>{fmt(resultProp.se)}</td></tr>
                <tr><td>Critical value (z*)</td><td style={{ fontFamily: "monospace" }}>{resultProp.z}</td></tr>
                <tr><td>Margin of Error</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>±{fmt(resultProp.me)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Lower bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultProp.lo)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Upper bound</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(resultProp.hi)}</td></tr>
              </tbody>
            </table>
          )}

          {!resultMeanZ && !resultMeanT && !resultProp && <p className="small">Enter values to calculate confidence interval.</p>}

          <h3 className="card-title" style={{ marginTop: 16 }}>Z* Critical Values</h3>
          <table className="table">
            <thead><tr><th>Confidence Level</th><th>z*</th><th>α</th></tr></thead>
            <tbody>
              {Object.entries(Z_CRIT).map(([c, z]) => (
                <tr key={c} style={c === cl ? { background: "#f0eeff" } : {}}>
                  <td style={c === cl ? { fontWeight: 700 } : {}}>{c}%</td>
                  <td style={{ fontFamily: "monospace" }}>{z}</td>
                  <td style={{ fontFamily: "monospace" }}>{(1 - parseFloat(c) / 100).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
