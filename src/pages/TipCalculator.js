import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt2 = v => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

export default function TipCalculator() {
  const [bill,    setBill]    = useState("85.50");
  const [tipPct,  setTipPct]  = useState("18");
  const [people,  setPeople]  = useState("2");
  const [roundTo, setRoundTo] = useState("none");

  const result = useMemo(() => {
    const b = parseFloat(bill) || 0;
    const p = parseFloat(tipPct) || 0;
    const n = parseInt(people) || 1;
    if (b <= 0) return null;
    let tip   = b * (p / 100);
    let total = b + tip;
    if (roundTo === "total") { total = Math.round(total); tip = total - b; }
    if (roundTo === "person") {
      const perP = Math.round(total / n);
      total = perP * n;
      tip   = total - b;
    }
    return { tip, total, tipPerPerson: tip / n, totalPerPerson: total / n, bill: b };
  }, [bill, tipPct, people, roundTo]);

  const QUICK_TIPS = [10, 15, 18, 20, 22, 25];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Tip Calculator</h1>
        <p className="muted">Calculate tip amount, total bill, and split evenly among multiple people.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Bill Details</h2>
          <div className="row two">
            <div className="field"><label>Bill Amount ($)</label>
              <input type="number" min="0" step="0.01" value={bill} onChange={e => setBill(e.target.value)} /></div>
            <div className="field"><label>Number of People</label>
              <input type="number" min="1" max="100" value={people} onChange={e => setPeople(e.target.value)} /></div>
          </div>

          <div className="field">
            <label>Tip Percentage</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {QUICK_TIPS.map(t => (
                <button key={t} onClick={() => setTipPct(String(t))} style={{
                  padding: "6px 14px", borderRadius: 8, border: "1.5px solid",
                  borderColor: tipPct === String(t) ? "#4f46e5" : "#d1d5db",
                  background: tipPct === String(t) ? "#4f46e5" : "white",
                  color: tipPct === String(t) ? "white" : "#374151",
                  fontWeight: 700, cursor: "pointer", fontSize: 14
                }}>{t}%</button>
              ))}
            </div>
            <input type="number" min="0" max="100" step="1" value={tipPct} onChange={e => setTipPct(e.target.value)} />
          </div>

          <div className="row two">
            <div className="field"><label>Round Bill To</label>
              <select value={roundTo} onChange={e => setRoundTo(e.target.value)}>
                <option value="none">No rounding</option>
                <option value="total">Round total to nearest $1</option>
                <option value="person">Round per-person to nearest $1</option>
              </select>
            </div>
          </div>

          {result && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Tip Amount</div><div className="kpi-value">${fmt2(result.tip)}</div></div>
              <div className="kpi"><div className="kpi-label">Total Bill</div><div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(result.total)}</div></div>
              {parseInt(people) > 1 && <>
                <div className="kpi"><div className="kpi-label">Tip / Person</div><div className="kpi-value">${fmt2(result.tipPerPerson)}</div></div>
                <div className="kpi"><div className="kpi-label">Total / Person</div><div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(result.totalPerPerson)}</div></div>
              </>}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Tip by Percentage</h2>
          {result && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Tip %</th><th>Tip Amount</th><th>Total</th><th>Per Person</th></tr></thead>
              <tbody>
                {QUICK_TIPS.map(t => {
                  const tip = result.bill * (t / 100);
                  const tot = result.bill + tip;
                  const pp  = tot / (parseInt(people) || 1);
                  return (
                    <tr key={t} style={String(t) === tipPct ? { background: "#f0eeff" } : {}}>
                      <td style={{ fontWeight: String(t) === tipPct ? 800 : 400, color: String(t) === tipPct ? "#4f46e5" : undefined }}>{t}%</td>
                      <td style={{ fontFamily: "monospace" }}>${fmt2(tip)}</td>
                      <td style={{ fontFamily: "monospace" }}>${fmt2(tot)}</td>
                      <td style={{ fontFamily: "monospace" }}>${fmt2(pp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <h3 className="card-title">Tipping Guide</h3>
          <table className="table">
            <thead><tr><th>Service</th><th>Standard Tip</th></tr></thead>
            <tbody>
              {[["Restaurant (sit-down)","18–20%"],["Bartender","15–20% or $1–2/drink"],["Food delivery","15–20%"],["Pizza delivery","$2–5"],["Hotel housekeeping","$2–5/night"],["Taxi / rideshare","15–20%"],["Hair salon","15–20%"],["Spa / massage","15–20%"],["Movers","$20–50/person"],["Tour guide","$5–10/person"]].map(([s,r]) =>
                <tr key={s}><td style={{ fontSize: 13 }}>{s}</td><td style={{ fontFamily: "monospace" }}>{r}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
