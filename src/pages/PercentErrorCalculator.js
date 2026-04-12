import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => isFinite(v) ? (Math.round(v * 1e8) / 1e8).toString() : "—";

export default function PercentErrorCalculator() {
  const [experimental, setExperimental] = useState("9.4");
  const [theoretical,  setTheoretical]  = useState("9.8");

  const result = useMemo(() => {
    const exp = parseFloat(experimental);
    const the = parseFloat(theoretical);
    if (isNaN(exp) || isNaN(the)) return null;
    if (the === 0) return { error: "Theoretical value cannot be zero." };
    const absError    = exp - the;
    const absErr      = Math.abs(absError);
    const pctError    = (absErr / Math.abs(the)) * 100;
    const relError    = absError / Math.abs(the);
    const signedPct   = (absError / Math.abs(the)) * 100;
    return { absError, absErr, pctError, relError, signedPct };
  }, [experimental, theoretical]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Percent Error Calculator</h1>
        <p className="muted">
          Calculate the percent error between an experimental (measured) value and a theoretical
          (accepted) value. Also shows absolute and relative error.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Values</h2>

          <div className="row two">
            <div className="field">
              <label>Experimental value (measured)</label>
              <input type="number" value={experimental} onChange={e => setExperimental(e.target.value)} />
            </div>
            <div className="field">
              <label>Theoretical value (accepted)</label>
              <input type="number" value={theoretical} onChange={e => setTheoretical(e.target.value)} />
            </div>
          </div>

          {result?.error ? (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              {result.error}
            </div>
          ) : result ? (
            <>
              <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Percent Error</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.pctError)}%</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                  Signed: {result.signedPct >= 0 ? "+" : ""}{fmt(result.signedPct)}%
                </div>
              </div>
            </>
          ) : null}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Formula</th><th>Expression</th></tr></thead>
            <tbody>
              <tr><td>Percent Error</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>|exp − the| / |the| × 100%</td></tr>
              <tr><td>Absolute Error</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>|exp − the|</td></tr>
              <tr><td>Relative Error</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>(exp − the) / |the|</td></tr>
              <tr><td>Signed %</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>(exp − the) / |the| × 100%</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result && !result.error ? (
            <>
              <table className="table">
                <thead><tr><th>Measurement</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Experimental (measured)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{experimental}</td></tr>
                  <tr><td>Theoretical (accepted)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{theoretical}</td></tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Percent Error</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.pctError)}%</td>
                  </tr>
                  <tr>
                    <td>Signed Percent Error</td>
                    <td style={{ fontFamily: "monospace" }}>{result.signedPct >= 0 ? "+" : ""}{fmt(result.signedPct)}%</td>
                  </tr>
                  <tr>
                    <td>Absolute Error</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.absErr)}</td>
                  </tr>
                  <tr>
                    <td>Signed Absolute Error</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.absError)}</td>
                  </tr>
                  <tr>
                    <td>Relative Error</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(result.relError)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi">
                  <div className="kpi-label">Percent Error</div>
                  <div className="kpi-value">{fmt(result.pctError)}%</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Absolute Error</div>
                  <div className="kpi-value">{fmt(result.absErr)}</div>
                </div>
              </div>
            </>
          ) : (
            <p className="small">Enter experimental and theoretical values to calculate percent error.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Interpretation</h3>
          <table className="table">
            <thead><tr><th>% Error</th><th>Interpretation</th></tr></thead>
            <tbody>
              <tr><td>&lt; 1%</td><td>Excellent accuracy</td></tr>
              <tr><td>1% – 5%</td><td>Very good accuracy</td></tr>
              <tr><td>5% – 10%</td><td>Acceptable accuracy</td></tr>
              <tr><td>10% – 20%</td><td>Moderate error</td></tr>
              <tr><td>&gt; 20%</td><td>Large error — review method</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
