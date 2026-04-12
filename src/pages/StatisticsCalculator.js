import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => isFinite(v) ? (Math.round(v * 1e8) / 1e8).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

function calcStats(nums) {
  const n = nums.length;
  if (n === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const sum    = nums.reduce((a, b) => a + b, 0);
  const mean   = sum / n;
  const min    = sorted[0], max = sorted[n - 1];
  const range  = max - min;

  const mid    = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const freq = {};
  nums.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const mode = maxFreq === 1 ? null : Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v)).sort((a, b) => a - b);

  const varPop  = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const varSamp = n > 1 ? nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
  const stdPop  = Math.sqrt(varPop);
  const stdSamp = Math.sqrt(varSamp);
  const cv      = mean !== 0 ? (stdSamp / Math.abs(mean)) * 100 : null; // coefficient of variation

  // Quartiles
  const getMedian = arr => {
    const m = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[m - 1] + arr[m]) / 2 : arr[m];
  };
  const lower = sorted.slice(0, Math.floor(n / 2));
  const upper = sorted.slice(Math.ceil(n / 2));
  const q1 = lower.length > 0 ? getMedian(lower) : min;
  const q3 = upper.length > 0 ? getMedian(upper) : max;
  const iqr = q3 - q1;

  // Outliers (Tukey fences)
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers   = sorted.filter(v => v < lowerFence || v > upperFence);

  // Skewness (sample)
  const skew = n > 2 ? (nums.reduce((acc, v) => acc + ((v - mean) / stdSamp) ** 3, 0) * n / ((n - 1) * (n - 2))) : null;

  // Kurtosis (excess kurtosis)
  const kurt = n > 3 ? (
    (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) *
    nums.reduce((acc, v) => acc + ((v - mean) / stdSamp) ** 4, 0) -
    3 * (n - 1) ** 2 / ((n - 2) * (n - 3))
  ) : null;

  // Sum of squares
  const ss = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0);

  return { n, sum, mean, median, mode, range, min, max, varPop, varSamp, stdPop, stdSamp, cv, q1, q2: median, q3, iqr, lowerFence, upperFence, outliers, skew, kurt, ss, sorted };
}

export default function StatisticsCalculator() {
  const [input, setInput] = useState("2, 4, 4, 4, 5, 5, 7, 9");

  const result = useMemo(() => {
    const nums = input.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v));
    if (nums.length === 0) return null;
    return calcStats(nums);
  }, [input]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Statistics Calculator</h1>
        <p className="muted">
          Enter a dataset to compute comprehensive descriptive statistics: mean, median, mode,
          standard deviation, variance, quartiles, IQR, skewness, kurtosis, and outliers.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Dataset</h2>
          <div className="row">
            <div className="field">
              <label>Data values (comma, space, or semicolon separated)</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
                placeholder="e.g. 2, 4, 4, 4, 5, 5, 7, 9"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 14, resize: "vertical" }} />
            </div>
          </div>

          {result && (
            <>
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-label">Count</div><div className="kpi-value">{result.n}</div></div>
                <div className="kpi"><div className="kpi-label">Mean</div><div className="kpi-value">{fmt(result.mean)}</div></div>
                <div className="kpi"><div className="kpi-label">Std Dev (s)</div><div className="kpi-value">{fmt(result.stdSamp)}</div></div>
                <div className="kpi"><div className="kpi-label">Median</div><div className="kpi-value">{fmt(result.median)}</div></div>
              </div>

              {result.outliers.length > 0 && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 13, color: "#b91c1c" }}>
                  <strong>Outliers detected:</strong> {result.outliers.join(", ")}
                  <div style={{ fontSize: 12, marginTop: 2 }}>Values outside [{fmt(result.lowerFence)}, {fmt(result.upperFence)}] (Tukey fences)</div>
                </div>
              )}
            </>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Statistic</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>Mean</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Σxᵢ / n</td></tr>
              <tr><td>Variance (pop.)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Σ(xᵢ−μ)² / n</td></tr>
              <tr><td>Variance (sample)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Σ(xᵢ−x̄)² / (n−1)</td></tr>
              <tr><td>Std Dev (σ)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>√(population variance)</td></tr>
              <tr><td>IQR</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Q3 − Q1</td></tr>
              <tr><td>Outlier fences</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Q1 − 1.5·IQR, Q3 + 1.5·IQR</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Full Results</h2>

          {result ? (
            <table className="table">
              <thead><tr><th>Statistic</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Count (n)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.n}</td></tr>
                <tr><td>Sum</td><td style={{ fontFamily: "monospace" }}>{fmt(result.sum)}</td></tr>
                <tr><td>Minimum</td><td style={{ fontFamily: "monospace" }}>{fmt(result.min)}</td></tr>
                <tr><td>Maximum</td><td style={{ fontFamily: "monospace" }}>{fmt(result.max)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Mean (x̄)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.mean)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Median</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.median)}</td></tr>
                <tr><td>Mode</td><td style={{ fontFamily: "monospace" }}>{result.mode ? result.mode.map(fmt).join(", ") : "No mode"}</td></tr>
                <tr><td>Range</td><td style={{ fontFamily: "monospace" }}>{fmt(result.range)}</td></tr>
                <tr><td>Sum of Squares</td><td style={{ fontFamily: "monospace" }}>{fmt(result.ss)}</td></tr>
                <tr><td>Variance (pop. σ²)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.varPop)}</td></tr>
                <tr><td>Variance (sample s²)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.varSamp)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Std Dev (pop. σ)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.stdPop)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Std Dev (sample s)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.stdSamp)}</td></tr>
                {result.cv !== null && <tr><td>Coeff. of Variation</td><td style={{ fontFamily: "monospace" }}>{fmt(result.cv)}%</td></tr>}
                <tr><td>Q1 (25th pct)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q1)}</td></tr>
                <tr><td>Q2 / Median</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q2)}</td></tr>
                <tr><td>Q3 (75th pct)</td><td style={{ fontFamily: "monospace" }}>{fmt(result.q3)}</td></tr>
                <tr><td>IQR</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(result.iqr)}</td></tr>
                <tr><td>Lower Fence</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>{fmt(result.lowerFence)}</td></tr>
                <tr><td>Upper Fence</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>{fmt(result.upperFence)}</td></tr>
                {result.skew !== null && <tr><td>Skewness</td><td style={{ fontFamily: "monospace" }}>{fmt(result.skew)}</td></tr>}
                {result.kurt !== null && <tr><td>Excess Kurtosis</td><td style={{ fontFamily: "monospace" }}>{fmt(result.kurt)}</td></tr>}
                <tr><td>Outliers</td><td style={{ fontFamily: "monospace" }}>{result.outliers.length === 0 ? "None" : result.outliers.join(", ")}</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="small">Enter a dataset to calculate statistics.</p>
          )}
        </section>
      </div>
    </div>
  );
}
