import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

function roundHalfUp(n, dp) {
  const factor = Math.pow(10, dp);
  return Math.floor(n * factor + 0.5) / factor;
}
function roundHalfDown(n, dp) {
  const factor = Math.pow(10, dp);
  return Math.ceil(n * factor - 0.5) / factor;
}
function roundHalfEven(n, dp) { // Banker's rounding
  const factor = Math.pow(10, dp);
  const shifted = n * factor;
  const floor = Math.floor(shifted);
  const diff = shifted - floor;
  if (Math.abs(diff - 0.5) > 1e-10) return Math.round(shifted) / factor;
  return (floor % 2 === 0 ? floor : floor + 1) / factor;
}
function toSigFigs(n, sf) {
  if (n === 0) return 0;
  const mag = Math.floor(Math.log10(Math.abs(n)));
  const factor = Math.pow(10, sf - 1 - mag);
  return Math.round(n * factor) / factor;
}

export default function RoundingCalculator() {
  const [input, setInput] = useState("3.14159265");
  const [mode, setMode]   = useState("decimal"); // "decimal" | "sigfig"
  const [dp, setDp]       = useState(2);         // decimal places
  const [sf, setSf]       = useState(3);         // significant figures

  const n = useMemo(() => parseFloat(input), [input]);

  const results = useMemo(() => {
    if (isNaN(n)) return null;
    if (mode === "decimal") {
      const places = Math.max(0, Math.min(15, Number(dp)));
      return {
        standard:   +n.toFixed(places),
        halfUp:     roundHalfUp(n, places),
        halfDown:   roundHalfDown(n, places),
        halfEven:   roundHalfEven(n, places),
        floor:      +(Math.floor(n * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places),
        ceiling:    +(Math.ceil(n  * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places),
        truncate:   +(Math.trunc(n * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places),
      };
    } else {
      const figs = Math.max(1, Math.min(15, Number(sf)));
      const rounded = toSigFigs(n, figs);
      return { sigFig: rounded, scientific: rounded.toExponential(figs - 1) };
    }
  }, [n, mode, dp, sf]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Rounding Calculator</h1>
        <p className="muted">
          Round any number to a specified number of decimal places or significant figures
          using multiple rounding methods — standard, half-up, half-down, floor, ceiling, and truncate.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row">
            <div className="field">
              <label>Number to Round</label>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. 3.14159265" />
            </div>
          </div>

          <div className="tab-row">
            <button className={`tab-btn${mode === "decimal" ? " active" : ""}`}
              onClick={() => setMode("decimal")}>Decimal Places</button>
            <button className={`tab-btn${mode === "sigfig" ? " active" : ""}`}
              onClick={() => setMode("sigfig")}>Significant Figures</button>
          </div>

          {mode === "decimal" ? (
            <div className="row">
              <div className="field">
                <label>Decimal Places (0–15)</label>
                <input type="number" min={0} max={15} value={dp}
                  onChange={e => setDp(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="field">
                <label>Significant Figures (1–15)</label>
                <input type="number" min={1} max={15} value={sf}
                  onChange={e => setSf(e.target.value)} />
              </div>
            </div>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Method</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>Standard / Half-up</td><td>Round half away from zero (most common)</td></tr>
              <tr><td>Half-down</td><td>Round half toward zero</td></tr>
              <tr><td>Half-even (Banker's)</td><td>Round half to nearest even digit</td></tr>
              <tr><td>Floor</td><td>Always round down</td></tr>
              <tr><td>Ceiling</td><td>Always round up</td></tr>
              <tr><td>Truncate</td><td>Remove extra digits without rounding</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>
          {results ? (
            mode === "decimal" ? (
              <>
                <div className="bar-title">
                  Input: <strong>{n}</strong> → rounded to <strong>{dp}</strong> decimal place{Number(dp) !== 1 ? "s" : ""}
                </div>
                <table className="table" style={{ marginTop: 14 }}>
                  <thead><tr><th>Method</th><th>Result</th></tr></thead>
                  <tbody>
                    <tr style={{ background: "#f0eeff" }}><td><strong>Standard (Half-up)</strong></td><td><strong>{results.standard}</strong></td></tr>
                    <tr><td>Half-down</td><td>{results.halfDown}</td></tr>
                    <tr><td>Half-even (Banker's)</td><td>{results.halfEven}</td></tr>
                    <tr><td>Floor (round down)</td><td>{results.floor}</td></tr>
                    <tr><td>Ceiling (round up)</td><td>{results.ceiling}</td></tr>
                    <tr><td>Truncate</td><td>{results.truncate}</td></tr>
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <div className="bar-title">
                  Input: <strong>{n}</strong> → <strong>{sf}</strong> significant figure{Number(sf) !== 1 ? "s" : ""}
                </div>
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi">
                    <div className="kpi-label">Rounded Value</div>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{results.sigFig}</div>
                    <div className="kpi-sub">{sf} sig. fig.</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Scientific Notation</div>
                    <div className="kpi-value" style={{ fontSize: 18 }}>{results.scientific}</div>
                    <div className="kpi-sub">e-notation</div>
                  </div>
                </div>
              </>
            )
          ) : (
            <p className="small">Enter a valid number to see rounding results.</p>
          )}
        </section>
      </div>
    </div>
  );
}
