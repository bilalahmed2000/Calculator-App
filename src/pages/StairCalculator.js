import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toFixed(d) : "—";

export default function StairCalculator() {
  const [mode, setMode]         = useState("rise"); // "rise" | "steps"
  const [totalRise, setTotalRise] = useState("108"); // inches
  const [numSteps,  setNumSteps]  = useState("14");
  const [riseEach,  setRiseEach]  = useState("7.5");
  const [tread,     setTread]     = useState("10");
  const [unit,      setUnit]      = useState("in");

  const toIn = v => unit === "in" ? v : v * 39.3701;
  const fromIn = v => unit === "in" ? v : v / 39.3701;
  const uLabel = unit === "in" ? "in" : "m";

  const result = useMemo(() => {
    const rise = toIn(parseFloat(totalRise) || 0);
    const tr   = toIn(parseFloat(tread)     || 10);
    let steps, riseEachIn;

    if (mode === "rise") {
      riseEachIn = toIn(parseFloat(riseEach) || 7.5);
      if (riseEachIn <= 0) return null;
      steps = Math.round(rise / riseEachIn);
      riseEachIn = steps > 0 ? rise / steps : 0;
    } else {
      steps = parseInt(numSteps) || 0;
      riseEachIn = steps > 0 ? rise / steps : 0;
    }

    if (steps <= 0 || rise <= 0) return null;
    const totalRun = (steps - 1) * tr; // landing on top doesn't count
    const angleDeg = Math.atan(rise / totalRun) * 180 / Math.PI;
    const stringer  = Math.sqrt(rise * rise + totalRun * totalRun);
    return { steps, riseEachIn, treadIn: tr, totalRun, angleDeg, stringer, rise };
  }, [mode, totalRise, numSteps, riseEach, tread, unit]);

  const ri = result;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Stair Calculator</h1>
        <p className="muted">Calculate stair dimensions including rise, run, angle, and stringer length for any staircase.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Units</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="in">Inches / Feet</option>
                <option value="m">Meters / cm</option>
              </select>
            </div>
            <div className="field"><label>Solve by</label>
              <select value={mode} onChange={e => setMode(e.target.value)}>
                <option value="rise">Desired Rise per Step</option>
                <option value="steps">Number of Steps</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Total Rise ({uLabel})</label>
              <input type="number" min="0" value={totalRise} onChange={e => setTotalRise(e.target.value)} />
            </div>
            {mode === "rise"
              ? <div className="field"><label>Desired Rise per Step ({uLabel})</label>
                  <input type="number" min="0" step="0.25" value={riseEach} onChange={e => setRiseEach(e.target.value)} />
                </div>
              : <div className="field"><label>Number of Steps</label>
                  <input type="number" min="1" value={numSteps} onChange={e => setNumSteps(e.target.value)} />
                </div>
            }
          </div>
          <div className="row two">
            <div className="field"><label>Tread Depth / Run ({uLabel})</label>
              <input type="number" min="0" step="0.5" value={tread} onChange={e => setTread(e.target.value)} />
            </div>
          </div>

          {ri && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Steps</div><div className="kpi-value">{ri.steps}</div></div>
              <div className="kpi"><div className="kpi-label">Rise per Step</div><div className="kpi-value">{fmt(fromIn(ri.riseEachIn))} {uLabel}</div></div>
              <div className="kpi"><div className="kpi-label">Angle</div><div className="kpi-value">{fmt(ri.angleDeg)}°</div></div>
              <div className="kpi"><div className="kpi-label">Total Run</div><div className="kpi-value">{fmt(fromIn(ri.totalRun))} {uLabel}</div></div>
              <div className="kpi"><div className="kpi-label">Stringer Length</div><div className="kpi-value">{fmt(fromIn(ri.stringer))} {uLabel}</div></div>
              <div className="kpi"><div className="kpi-label">Total Rise</div><div className="kpi-value">{fmt(fromIn(ri.rise))} {uLabel}</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results &amp; Code Reference</h2>
          {ri && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Dimension</th><th>Value</th><th>Code Limit</th><th>Pass?</th></tr></thead>
              <tbody>
                <tr>
                  <td>Rise per Step</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(fromIn(ri.riseEachIn))} {uLabel}</td>
                  <td style={{ fontSize: 12 }}>4" min – 7¾" max (IRC)</td>
                  <td style={{ color: ri.riseEachIn >= 4 && ri.riseEachIn <= 7.75 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {ri.riseEachIn >= 4 && ri.riseEachIn <= 7.75 ? "✓" : "✗"}
                  </td>
                </tr>
                <tr>
                  <td>Tread Depth</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(fromIn(ri.treadIn))} {uLabel}</td>
                  <td style={{ fontSize: 12 }}>10" min (IRC)</td>
                  <td style={{ color: ri.treadIn >= 10 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {ri.treadIn >= 10 ? "✓" : "✗"}
                  </td>
                </tr>
                <tr>
                  <td>Angle</td>
                  <td style={{ fontFamily: "monospace" }}>{fmt(ri.angleDeg)}°</td>
                  <td style={{ fontSize: 12 }}>30°–50° recommended</td>
                  <td style={{ color: ri.angleDeg >= 30 && ri.angleDeg <= 50 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {ri.angleDeg >= 30 && ri.angleDeg <= 50 ? "✓" : "✗"}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          <h3 className="card-title">Standard Stair Guidelines</h3>
          <table className="table">
            <thead><tr><th>Dimension</th><th>IRC Residential</th><th>OSHA Commercial</th></tr></thead>
            <tbody>
              {[
                ["Max Rise", "7¾\"", "9½\""],
                ["Min Rise", "4\"", "6\""],
                ["Min Tread", "10\"", "9½\""],
                ["Min Width", "36\"", "44\""],
                ["Headroom", "6'8\"", "7'0\""],
                ["Handrail height", "34\"–38\"", "30\"–38\""],
              ].map(([d,a,b]) => <tr key={d}><td style={{ fontSize: 13 }}>{d}</td><td style={{ fontFamily: "monospace" }}>{a}</td><td style={{ fontFamily: "monospace" }}>{b}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
