import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function parseHMS(h, m, s) {
  const hv = parseInt(h) || 0;
  const mv = parseInt(m) || 0;
  const sv = parseInt(s) || 0;
  return hv * 3600 + mv * 60 + sv;
}

function secToHMS(total) {
  const abs = Math.abs(total);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  return { h, m, s, neg: total < 0 };
}

function fmtHMS({ h, m, s, neg }) {
  return `${neg ? "-" : ""}${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

function fmtReadable({ h, m, s, neg }) {
  const parts = [];
  if (h) parts.push(`${h} hr${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} min${m !== 1 ? "s" : ""}`);
  if (s || parts.length === 0) parts.push(`${s} sec${s !== 1 ? "s" : ""}`);
  return (neg ? "-" : "") + parts.join(", ");
}

export default function TimeDurationCalculator() {
  const [tab, setTab] = useState("between");

  // Between two times
  const [t1h, setT1h] = useState("08"); const [t1m, setT1m] = useState("30"); const [t1s, setT1s] = useState("00");
  const [t2h, setT2h] = useState("17"); const [t2m, setT2m] = useState("45"); const [t2s, setT2s] = useState("00");

  // Add / subtract duration from a time
  const [baseH, setBaseH] = useState("10"); const [baseM, setBaseM] = useState("00"); const [baseS, setBaseS] = useState("00");
  const [durH, setDurH]   = useState("1");  const [durM, setDurM]   = useState("30"); const [durS, setDurS]   = useState("00");
  const [op, setOp] = useState("add");

  // Add multiple durations
  const [durations, setDurations] = useState([
    { h: "1", m: "30", s: "00" },
    { h: "0", m: "45", s: "00" },
    { h: "2", m: "15", s: "00" },
  ]);

  const betweenResult = useMemo(() => {
    const s1 = parseHMS(t1h, t1m, t1s);
    const s2 = parseHMS(t2h, t2m, t2s);
    let diff = s2 - s1;
    if (diff < 0) diff += 86400; // next day
    const hms = secToHMS(diff);
    return { hms, totalSecs: diff, totalMins: Math.floor(diff / 60), totalHrs: (diff / 3600).toFixed(4) };
  }, [t1h, t1m, t1s, t2h, t2m, t2s]);

  const addSubResult = useMemo(() => {
    const base = parseHMS(baseH, baseM, baseS);
    const dur  = parseHMS(durH, durM, durS);
    let result = op === "add" ? base + dur : base - dur;
    // Normalize to 24h
    result = ((result % 86400) + 86400) % 86400;
    return secToHMS(result);
  }, [baseH, baseM, baseS, durH, durM, durS, op]);

  const sumResult = useMemo(() => {
    const total = durations.reduce((acc, d) => acc + parseHMS(d.h, d.m, d.s), 0);
    const hms = secToHMS(total);
    return { hms, totalSecs: total, totalMins: Math.floor(total / 60), totalHrs: (total / 3600).toFixed(4) };
  }, [durations]);

  const updateDur = (i, field, val) => setDurations(prev => {
    const next = [...prev];
    next[i] = { ...next[i], [field]: val };
    return next;
  });

  const HMS_INPUT = (h, setH, m, setM, s, setS) => (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input type="number" min="0" value={h} onChange={e => setH(e.target.value)}
        style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="HH" />
      <span style={{ fontWeight: 700 }}>:</span>
      <input type="number" min="0" max="59" value={m} onChange={e => setM(e.target.value)}
        style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="MM" />
      <span style={{ fontWeight: 700 }}>:</span>
      <input type="number" min="0" max="59" value={s} onChange={e => setS(e.target.value)}
        style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="SS" />
      <span style={{ fontSize: 12, color: "#6b7a9e" }}>HH:MM:SS</span>
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Time Duration Calculator</h1>
        <p className="muted">
          Calculate the duration between two times, add or subtract time from a start time,
          or sum multiple time durations.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "between" ? " active" : ""}`} onClick={() => setTab("between")}>Between Two Times</button>
            <button className={`tab-btn${tab === "addsub"  ? " active" : ""}`} onClick={() => setTab("addsub")}>Add / Subtract</button>
            <button className={`tab-btn${tab === "sum"     ? " active" : ""}`} onClick={() => setTab("sum")}>Sum Durations</button>
          </div>

          {tab === "between" && (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Start Time</label>
                {HMS_INPUT(t1h, setT1h, t1m, setT1m, t1s, setT1s)}
              </div>
              <div className="field">
                <label>End Time</label>
                {HMS_INPUT(t2h, setT2h, t2m, setT2m, t2s, setT2s)}
              </div>
              <p className="small" style={{ marginTop: 6 }}>If end &lt; start, assumes next day (e.g. overnight shift).</p>

              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Duration</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>{fmtHMS(betweenResult.hms)}</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmtReadable(betweenResult.hms)}</div>
              </div>
            </>
          )}

          {tab === "addsub" && (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Start Time</label>
                {HMS_INPUT(baseH, setBaseH, baseM, setBaseM, baseS, setBaseS)}
              </div>
              <div className="row">
                <div className="field">
                  <label>Operation</label>
                  <select value={op} onChange={e => setOp(e.target.value)}>
                    <option value="add">Add (+)</option>
                    <option value="sub">Subtract (−)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Duration to {op === "add" ? "Add" : "Subtract"}</label>
                {HMS_INPUT(durH, setDurH, durM, setDurM, durS, setDurS)}
              </div>

              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Result Time</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>{fmtHMS(addSubResult)}</div>
              </div>
            </>
          )}

          {tab === "sum" && (
            <>
              <p className="small">Add multiple time durations together.</p>
              {durations.map((d, i) => (
                <div key={i} className="field" style={{ marginBottom: 10 }}>
                  <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Duration {i + 1}</span>
                    {durations.length > 1 && (
                      <button onClick={() => setDurations(prev => prev.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Remove</button>
                    )}
                  </label>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="number" min="0" value={d.h} onChange={e => updateDur(i, "h", e.target.value)}
                      style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="HH" />
                    <span style={{ fontWeight: 700 }}>:</span>
                    <input type="number" min="0" max="59" value={d.m} onChange={e => updateDur(i, "m", e.target.value)}
                      style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="MM" />
                    <span style={{ fontWeight: 700 }}>:</span>
                    <input type="number" min="0" max="59" value={d.s} onChange={e => updateDur(i, "s", e.target.value)}
                      style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 15 }} placeholder="SS" />
                  </div>
                </div>
              ))}
              <button className="btn-primary" style={{ marginTop: 4, width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setDurations(prev => [...prev, { h: "0", m: "0", s: "00" }])}>
                + Add Duration
              </button>

              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Total Duration</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>{fmtHMS(sumResult.hms)}</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmtReadable(sumResult.hms)}</div>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "between" && (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Start time</td><td style={{ fontFamily: "monospace" }}>{`${t1h.padStart(2,"0")}:${t1m.padStart(2,"0")}:${t1s.padStart(2,"0")}`}</td></tr>
                <tr><td>End time</td><td style={{ fontFamily: "monospace" }}>{`${t2h.padStart(2,"0")}:${t2m.padStart(2,"0")}:${t2s.padStart(2,"0")}`}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Duration (H:M:S)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtHMS(betweenResult.hms)}</td></tr>
                <tr><td>Total hours</td><td style={{ fontFamily: "monospace" }}>{betweenResult.totalHrs}</td></tr>
                <tr><td>Total minutes</td><td style={{ fontFamily: "monospace" }}>{betweenResult.totalMins}</td></tr>
                <tr><td>Total seconds</td><td style={{ fontFamily: "monospace" }}>{betweenResult.totalSecs.toLocaleString()}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "addsub" && (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Start time</td><td style={{ fontFamily: "monospace" }}>{`${baseH.padStart(2,"0")}:${baseM.padStart(2,"0")}:${baseS.padStart(2,"0")}`}</td></tr>
                <tr><td>Operation</td><td style={{ fontFamily: "monospace" }}>{op === "add" ? "+" : "−"} {durH}h {durM}m {durS}s</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Result Time</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtHMS(addSubResult)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "sum" && (
            <table className="table">
              <thead><tr><th>#</th><th>Duration</th></tr></thead>
              <tbody>
                {durations.map((d, i) => (
                  <tr key={i}><td>{i + 1}</td><td style={{ fontFamily: "monospace" }}>{d.h.padStart(2,"0")}:{d.m.padStart(2,"0")}:{d.s.padStart(2,"0")}</td></tr>
                ))}
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Total</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtHMS(sumResult.hms)} = {fmtReadable(sumResult.hms)}</td>
                </tr>
              </tbody>
            </table>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Time Conversions</h3>
          <table className="table">
            <thead><tr><th>Unit</th><th>Equivalent</th></tr></thead>
            <tbody>
              <tr><td>1 minute</td><td style={{ fontFamily: "monospace" }}>60 seconds</td></tr>
              <tr><td>1 hour</td><td style={{ fontFamily: "monospace" }}>60 min = 3,600 sec</td></tr>
              <tr><td>1 day</td><td style={{ fontFamily: "monospace" }}>24 hrs = 1,440 min</td></tr>
              <tr><td>1 week</td><td style={{ fontFamily: "monospace" }}>168 hrs = 10,080 min</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
