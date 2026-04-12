import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 });

function calcStats(nums) {
  const n = nums.length;
  if (n === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Mode
  const freq = {};
  nums.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const mode = maxFreq === 1 ? [] : Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v));

  const range = sorted[n - 1] - sorted[0];
  const min = sorted[0], max = sorted[n - 1];

  // Variance
  const varPop  = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const varSamp = n > 1 ? nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
  const stdPop  = Math.sqrt(varPop);
  const stdSamp = Math.sqrt(varSamp);

  // Quartiles (inclusive method)
  const q1 = n >= 4 ? (() => {
    const lower = sorted.slice(0, Math.floor(n / 2));
    const lm = Math.floor(lower.length / 2);
    return lower.length % 2 === 0 ? (lower[lm - 1] + lower[lm]) / 2 : lower[lm];
  })() : sorted[0];
  const q3 = n >= 4 ? (() => {
    const upper = sorted.slice(Math.ceil(n / 2));
    const um = Math.floor(upper.length / 2);
    return upper.length % 2 === 0 ? (upper[um - 1] + upper[um]) / 2 : upper[um];
  })() : sorted[n - 1];
  const iqr = q3 - q1;

  return { n, sum, mean, median, mode, range, min, max, varPop, varSamp, stdPop, stdSamp, sorted, q1, q2: median, q3, iqr };
}

export default function MeanMedianModeCalculator() {
  const [input, setInput] = useState("4, 7, 13, 2, 1, 7, 4, 4, 9");

  const result = useMemo(() => {
    const nums = input.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v));
    if (nums.length === 0) return null;
    return calcStats(nums);
  }, [input]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mean, Median, Mode, Range Calculator</h1>
        <p className="muted">
          Enter a list of numbers to calculate mean, median, mode, range, variance, standard deviation,
          and quartiles.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Data Set</h2>
          <div className="row">
            <div className="field">
              <label>Numbers (comma, space, or semicolon separated)</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
                placeholder="e.g. 4, 7, 13, 2, 1, 7, 4"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 14, resize: "vertical" }} />
            </div>
          </div>

          {result && (
            <>
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-label">Mean</div><div className="kpi-value">{fmt(result.mean)}</div></div>
                <div className="kpi"><div className="kpi-label">Median</div><div className="kpi-value">{fmt(result.median)}</div></div>
                <div className="kpi"><div className="kpi-label">Mode</div><div className="kpi-value" style={{ fontSize: result.mode.length === 0 ? 14 : 20 }}>{result.mode.length === 0 ? "No mode" : result.mode.map(fmt).join(", ")}</div></div>
                <div className="kpi"><div className="kpi-label">Range</div><div className="kpi-value">{fmt(result.range)}</div></div>
              </div>

              <h3 className="card-title" style={{ marginTop: 16 }}>Sorted Data</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {result.sorted.map((v, i) => (
                  <span key={i} style={{ padding: "3px 9px", background: result.mode.includes(v) ? "#f0eeff" : "#f8f9ff", borderRadius: 6, fontFamily: "monospace", fontSize: 13, fontWeight: result.mode.includes(v) ? 800 : 400, color: result.mode.includes(v) ? "#4f46e5" : "#374151", border: "1px solid rgba(99,102,241,0.12)" }}>
                    {v}
                  </span>
                ))}
              </div>
              <p className="small" style={{ marginTop: 6 }}>Purple = mode (most frequent)</p>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Full Statistics</h2>

          {result ? (
            <table className="table">
              <thead><tr><th>Statistic</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Count (n)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.n}</td></tr>
                <tr><td>Sum</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.sum)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Mean (average)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.mean)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Median</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.median)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Mode</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{result.mode.length === 0 ? "None" : result.mode.map(fmt).join(", ")}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Range</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.range)}</td></tr>
                <tr><td>Minimum</td><td style={{ fontFamily: "monospace" }}>{fmt(result.min)}</td></tr>
                <tr><td>Maximum</td><td style={{ fontFamily: "monospace" }}>{fmt(result.max)}</td></tr>
                <tr><td>Variance (population)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.varPop)}</td></tr>
                <tr><td>Variance (sample)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.varSamp)}</td></tr>
                <tr><td>Std Dev (population σ)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.stdPop)}</td></tr>
                <tr><td>Std Dev (sample s)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.stdSamp)}</td></tr>
                <tr><td>Q1 (25th percentile)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q1)}</td></tr>
                <tr><td>Q2 / Median (50th)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q2)}</td></tr>
                <tr><td>Q3 (75th percentile)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q3)}</td></tr>
                <tr><td>IQR (Q3 − Q1)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.iqr)}</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Enter numbers to see statistics.</p>
          )}
        </section>
      </div>
    </div>
  );
}
