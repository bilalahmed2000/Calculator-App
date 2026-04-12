import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// Abramowitz & Stegun approximation for standard normal CDF
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302745))));
  return x >= 0 ? 1 - p : p;
}

// Rational approximation for inverse normal (Beasley-Springer-Moro)
function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) / ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q / (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) / ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  }
}

const fmt = (v, d = 4) => isFinite(v) ? (Math.round(v * 10**d) / 10**d).toString() : "—";

const Z_TABLE = [
  [0.0, 50.00], [0.5, 69.15], [1.0, 84.13], [1.28, 89.97], [1.5, 93.32],
  [1.645, 95.00], [1.96, 97.50], [2.0, 97.72], [2.326, 99.00], [2.576, 99.50],
  [3.0, 99.87], [3.5, 99.98],
];

export default function ZScoreCalculator() {
  const [tab, setTab] = useState("fromRaw");
  const [x, setX]   = useState("72");
  const [mu, setMu] = useState("60");
  const [sig, setSig] = useState("10");
  const [z, setZ]   = useState("1.65");
  const [pct, setPct] = useState("95");

  const fromRaw = useMemo(() => {
    const xv = parseFloat(x), mv = parseFloat(mu), sv = parseFloat(sig);
    if (isNaN(xv) || isNaN(mv) || isNaN(sv) || sv <= 0) return null;
    const zv = (xv - mv) / sv;
    const cdf = normalCDF(zv);
    return { z: zv, pctBelow: cdf * 100, pctAbove: (1 - cdf) * 100 };
  }, [x, mu, sig]);

  const fromZ = useMemo(() => {
    const zv = parseFloat(z), mv = parseFloat(mu), sv = parseFloat(sig);
    if (isNaN(zv) || isNaN(mv) || isNaN(sv) || sv <= 0) return null;
    const xv = mv + zv * sv;
    const cdf = normalCDF(zv);
    return { x: xv, pctBelow: cdf * 100, pctAbove: (1 - cdf) * 100 };
  }, [z, mu, sig]);

  const fromPct = useMemo(() => {
    const pv = parseFloat(pct), mv = parseFloat(mu), sv = parseFloat(sig);
    if (isNaN(pv) || pv <= 0 || pv >= 100 || isNaN(mv) || isNaN(sv) || sv <= 0) return null;
    const zv = normalInv(pv / 100);
    const xv = mv + zv * sv;
    return { z: zv, x: xv };
  }, [pct, mu, sig]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Z-Score Calculator</h1>
        <p className="muted">
          Calculate z-scores, find raw scores from z-scores, and look up cumulative probabilities
          using the standard normal distribution.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "fromRaw" ? " active" : ""}`} onClick={() => setTab("fromRaw")}>Raw → Z</button>
            <button className={`tab-btn${tab === "fromZ"   ? " active" : ""}`} onClick={() => setTab("fromZ")}>Z → Raw</button>
            <button className={`tab-btn${tab === "fromPct" ? " active" : ""}`} onClick={() => setTab("fromPct")}>% → Z & Raw</button>
          </div>

          <div className="row two">
            <div className="field"><label>Mean (μ)</label><input type="number" value={mu} onChange={e => setMu(e.target.value)} /></div>
            <div className="field"><label>Std Deviation (σ)</label><input type="number" min="0" value={sig} onChange={e => setSig(e.target.value)} /></div>
          </div>

          {tab === "fromRaw" && (
            <>
              <div className="row"><div className="field"><label>Raw score (x)</label><input type="number" value={x} onChange={e => setX(e.target.value)} /></div></div>
              {fromRaw && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Z-Score</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(fromRaw.z)}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmt(fromRaw.pctBelow, 2)}% of values fall below x = {x}</div>
                </div>
              )}
            </>
          )}

          {tab === "fromZ" && (
            <>
              <div className="row"><div className="field"><label>Z-score</label><input type="number" value={z} onChange={e => setZ(e.target.value)} /></div></div>
              {fromZ && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Raw Score (x)</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(fromZ.x)}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>z = {z} is at the {fmt(fromZ.pctBelow, 2)}th percentile</div>
                </div>
              )}
            </>
          )}

          {tab === "fromPct" && (
            <>
              <div className="row"><div className="field"><label>Percentile (0–100)</label><input type="number" min="0" max="100" value={pct} onChange={e => setPct(e.target.value)} /></div></div>
              {fromPct && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi"><div className="kpi-label">Z-Score</div><div className="kpi-value">{fmt(fromPct.z)}</div></div>
                  <div className="kpi"><div className="kpi-label">Raw Score (x)</div><div className="kpi-value">{fmt(fromPct.x)}</div></div>
                </div>
              )}
            </>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Z-score</td><td style={{ fontFamily: "monospace" }}>z = (x − μ) / σ</td></tr>
              <tr><td>Raw score</td><td style={{ fontFamily: "monospace" }}>x = μ + z · σ</td></tr>
              <tr><td>Percentile</td><td style={{ fontFamily: "monospace" }}>P = Φ(z) × 100%</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "fromRaw" && fromRaw && (
            <table className="table" style={{ marginBottom: 16 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Raw score (x)</td><td style={{ fontFamily: "monospace" }}>{x}</td></tr>
                <tr><td>Mean (μ)</td><td style={{ fontFamily: "monospace" }}>{mu}</td></tr>
                <tr><td>Std Dev (σ)</td><td style={{ fontFamily: "monospace" }}>{sig}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Z-score</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(fromRaw.z)}</td></tr>
                <tr><td>Percentile (CDF)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(fromRaw.pctBelow, 2)}th</td></tr>
                <tr><td>% of data below x</td><td style={{ fontFamily: "monospace" }}>{fmt(fromRaw.pctBelow, 2)}%</td></tr>
                <tr><td>% of data above x</td><td style={{ fontFamily: "monospace" }}>{fmt(fromRaw.pctAbove, 2)}%</td></tr>
              </tbody>
            </table>
          )}
          {tab === "fromZ" && fromZ && (
            <table className="table" style={{ marginBottom: 16 }}>
              <tbody>
                <tr><td>Z-score</td><td style={{ fontFamily: "monospace" }}>{z}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Raw score (x)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(fromZ.x)}</td></tr>
                <tr><td>% below</td><td style={{ fontFamily: "monospace" }}>{fmt(fromZ.pctBelow, 2)}%</td></tr>
                <tr><td>% above</td><td style={{ fontFamily: "monospace" }}>{fmt(fromZ.pctAbove, 2)}%</td></tr>
              </tbody>
            </table>
          )}
          {tab === "fromPct" && fromPct && (
            <table className="table" style={{ marginBottom: 16 }}>
              <tbody>
                <tr><td>Percentile</td><td style={{ fontFamily: "monospace" }}>{pct}th</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Z-score</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(fromPct.z)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Raw score</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(fromPct.x)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "fromRaw" && !fromRaw && <p className="small">Enter values to calculate z-score.</p>}

          <h3 className="card-title" style={{ marginTop: 16 }}>Z-Score Reference Table</h3>
          <table className="table">
            <thead><tr><th>Z-score</th><th>% Below (CDF)</th><th>Use</th></tr></thead>
            <tbody>
              {Z_TABLE.map(([zv, pv]) => (
                <tr key={zv}><td style={{ fontFamily: "monospace" }}>{zv}</td><td style={{ fontFamily: "monospace" }}>{pv}%</td><td style={{ fontSize: 12 }}>{zv === 1.645 ? "90% CI (one-tail)" : zv === 1.96 ? "95% CI (two-tail)" : zv === 2.576 ? "99% CI (two-tail)" : ""}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
