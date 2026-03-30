import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ---------- Sidebar ---------- */
const SIDEBAR_LINKS = [
  { label: "Scientific Calculator",        to: "/scientific" },
  { label: "Fraction Calculator",          to: "/fraction-calculator" },
  { label: "Percentage Calculator",        to: "/percentage-calculator" },
  { label: "Random Number Generator",      to: "/random-number-generator" },
  { label: "Triangle Calculator",          to: "/triangle-calculator" },
  { label: "Standard Deviation Calculator",to: "/std-dev" },
];

/* ---------- Z-table ---------- */
const CI_LEVELS = [
  { label: "68.3%",    z: 1 },
  { label: "90%",      z: 1.645 },
  { label: "95%",      z: 1.96 },
  { label: "99%",      z: 2.576 },
  { label: "99.9%",    z: 3.291 },
  { label: "99.99%",   z: 3.891 },
  { label: "99.999%",  z: 4.417 },
  { label: "99.9999%", z: 4.892 },
];

/* ---------- Helpers ---------- */
function parseNumbers(raw) {
  return raw
    .split(/[\s,;\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
}

function fmtN(n, d = 4) {
  if (!Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(d)).toString();
}

/* ---------- Core computation ---------- */
function compute(nums, mode) {
  const N = nums.length;
  if (N < 2) return null;

  const sum     = nums.reduce((a, b) => a + b, 0);
  const mean    = sum / N;
  const ssq     = nums.reduce((a, x) => a + (x - mean) ** 2, 0);
  const variance = mode === "population" ? ssq / N : ssq / (N - 1);
  const stdDev  = Math.sqrt(variance);
  const sem     = stdDev / Math.sqrt(N);

  const ciRows = CI_LEVELS.map(({ label, z }) => {
    const margin = z * sem;
    const pct    = mean !== 0 ? (margin / Math.abs(mean)) * 100 : null;
    return { label, z, margin, low: mean - margin, high: mean + margin, pct };
  });

  /* Frequency table */
  const freq = {};
  nums.forEach((n) => { const k = String(n); freq[k] = (freq[k] || 0) + 1; });
  const freqTable = Object.entries(freq)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([val, count]) => ({ val: parseFloat(val), count, pct: (count / N) * 100 }));

  return { N, sum, mean, variance, stdDev, sem, ssq, ciRows, freqTable };
}

/* ---------- UI sub-components ---------- */
function ResultHeader({ title }) {
  return (
    <div className="result-header">
      <span>{title}</span>
    </div>
  );
}

/* ---------- Component ---------- */
export default function StandardDeviationCalculator() {
  const [input,  setInput]  = useState("");
  const [mode,   setMode]   = useState("population");
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");
  const [showSteps, setShowSteps] = useState(false);

  const handleCalculate = () => {
    const nums = parseNumbers(input);
    if (nums.length < 2) {
      setError("Please enter at least 2 numbers separated by commas or spaces.");
      setResult(null);
      return;
    }
    setError("");
    setResult(compute(nums, mode));
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  const maxMargin = result ? Math.max(...result.ciRows.map((r) => r.margin)) : 1;
  const isPop     = mode === "population";

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Standard Deviation Calculator</h1>
        <p className="muted">
          Calculate population or sample standard deviation, variance, mean, standard error,
          confidence intervals, and a frequency table for any data set.
        </p>
      </header>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ── Input card ── */}
          <section className="card">
            <h2 className="card-title">Standard Deviation Calculator</h2>
            <p className="rng-desc">
              Enter numbers separated by commas, spaces, or line breaks.
            </p>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>Data Set</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 10, 20, 30, 40, 50"
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.2)",
                  borderRadius: 12, padding: "11px 14px", fontSize: 15,
                  color: "#1e1b4b", outline: "none", resize: "vertical",
                  fontFamily: "inherit", transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; }}
              />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>Type</label>
              <div className="rng-radio-group">
                <label className="rng-radio-label">
                  <input type="radio" name="sdMode" value="population"
                    checked={mode === "population"} onChange={() => setMode("population")} />
                  <span>Population</span>
                </label>
                <label className="rng-radio-label">
                  <input type="radio" name="sdMode" value="sample"
                    checked={mode === "sample"} onChange={() => setMode("sample")} />
                  <span>Sample</span>
                </label>
              </div>
            </div>

            <div className="row two rng-btn-row">
              <button type="button" className="btn-primary" onClick={handleCalculate}>Calculate</button>
              <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
            </div>

            {error && <div className="rng-error">{error}</div>}
          </section>

          {/* ── Results ── */}
          {result && (
            <>
              {/* Main stats */}
              <section className="card" style={{ marginTop: 18 }}>
                <ResultHeader title="Answer" />

                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-label">{isPop ? "Population Std Dev (σ)" : "Sample Std Dev (s)"}</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{fmtN(result.stdDev)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Count (N)</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{result.N}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Sum (Σx)</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{fmtN(result.sum)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Mean (μ)</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{fmtN(result.mean)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">{isPop ? "Variance (σ²)" : "Variance (s²)"}</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{fmtN(result.variance)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Std Error of Mean (SEM)</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{fmtN(result.sem)}</div>
                  </div>
                </div>

                {/* Steps */}
                <div className="bar-title" style={{ marginTop: 18, cursor: "pointer", userSelect: "none" }}
                  onClick={() => setShowSteps((s) => !s)}>
                  {showSteps ? "▾" : "▸"} Calculation Steps
                </div>

                {showSteps && (
                  <div style={{ fontSize: 13.5, lineHeight: 2, color: "#374151", padding: "6px 4px 0" }}>
                    <div>N = <b>{result.N}</b></div>
                    <div>Σx = <b>{fmtN(result.sum, 6)}</b></div>
                    <div>μ = Σx / N = {fmtN(result.sum, 6)} / {result.N} = <b>{fmtN(result.mean, 6)}</b></div>
                    <div>Σ(x − μ)² = <b>{fmtN(result.ssq, 6)}</b></div>
                    {isPop
                      ? <div>σ² = Σ(x − μ)² / N = {fmtN(result.ssq, 6)} / {result.N} = <b>{fmtN(result.variance, 6)}</b></div>
                      : <div>s² = Σ(x − μ)² / (N − 1) = {fmtN(result.ssq, 6)} / {result.N - 1} = <b>{fmtN(result.variance, 6)}</b></div>
                    }
                    <div>
                      {isPop ? "σ" : "s"} = √{fmtN(result.variance, 6)} = <b>{fmtN(result.stdDev, 6)}</b>
                    </div>
                    <div>
                      SEM = {isPop ? "σ" : "s"} / √N = {fmtN(result.stdDev, 6)} / √{result.N} = <b>{fmtN(result.sem, 6)}</b>
                    </div>
                  </div>
                )}
              </section>

              {/* Confidence Intervals */}
              <section className="card" style={{ marginTop: 18 }}>
                <h2 className="card-title">Margin of Error — Confidence Intervals</h2>
                <p className="rng-desc" style={{ marginBottom: 10 }}>
                  SEM = {fmtN(result.sem)}&ensp;·&ensp;Mean = {fmtN(result.mean)}
                </p>

                <div className="table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Confidence</th>
                        <th>z</th>
                        <th>± Margin</th>
                        <th>Range</th>
                        <th>% of Mean</th>
                        <th style={{ minWidth: 110 }}>Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ciRows.map((row) => (
                        <tr key={row.label}>
                          <td><b>{row.label}</b></td>
                          <td style={{ fontFamily: "monospace" }}>{row.z}</td>
                          <td>{fmtN(row.margin)}</td>
                          <td style={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 12 }}>
                            {fmtN(row.low)} – {fmtN(row.high)}
                          </td>
                          <td>{row.pct != null ? fmtN(row.pct, 2) + "%" : "—"}</td>
                          <td>
                            {/* Bar visualization: centered blue bar + red center marker */}
                            <div style={{ position: "relative", height: 14, background: "#f0eeff", borderRadius: 7, overflow: "hidden" }}>
                              <div style={{
                                position: "absolute",
                                left:  `${(100 - (row.margin / maxMargin) * 88) / 2}%`,
                                width: `${(row.margin / maxMargin) * 88}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #818cf8, #a78bfa)",
                                borderRadius: 7,
                                minWidth: 4,
                              }} />
                              <div style={{
                                position: "absolute", left: "50%",
                                transform: "translateX(-50%)",
                                width: 2, height: "100%", background: "#dc2626",
                              }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Frequency Table */}
              <section className="card" style={{ marginTop: 18 }}>
                <h2 className="card-title">Frequency Table</h2>
                <div className="table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Value</th>
                        <th>Frequency</th>
                        <th>Relative Frequency (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.freqTable.map((row, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: "monospace" }}>{row.val}</td>
                          <td>{row.count}</td>
                          <td>{fmtN(row.pct, 2)}%</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 700, background: "#f5f3ff" }}>
                        <td>Total</td>
                        <td>{result.N}</td>
                        <td>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

        </div>

        {/* ── Sidebar ── */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Math Calculators</h3>
            <ul className="rng-sidebar-list">
              {SIDEBAR_LINKS.map((lnk) => (
                <li key={lnk.to}>
                  <Link to={lnk.to}
                    className={lnk.to === "/std-dev"
                      ? "rng-sidebar-link rng-sidebar-link--active"
                      : "rng-sidebar-link"}>
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
