import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

const PERIODS = [
  { key: "hourly",      label: "Hourly" },
  { key: "daily",       label: "Daily" },
  { key: "weekly",      label: "Weekly" },
  { key: "biweekly",    label: "Bi-Weekly" },
  { key: "semimonthly", label: "Semi-Monthly" },
  { key: "monthly",     label: "Monthly" },
  { key: "quarterly",   label: "Quarterly" },
  { key: "annual",      label: "Annual" },
];

const ROWS = [
  { key: "hourly",      label: "Hourly" },
  { key: "daily",       label: "Daily" },
  { key: "weekly",      label: "Weekly" },
  { key: "biweekly",    label: "Bi-Weekly (Every 2 Weeks)" },
  { key: "semimonthly", label: "Semi-Monthly (Twice / Month)" },
  { key: "monthly",     label: "Monthly" },
  { key: "quarterly",   label: "Quarterly" },
  { key: "annual",      label: "Annual" },
];

export default function SalaryCalculator() {
  const [salary, setSalary]       = useState("50000");
  const [period, setPeriod]       = useState("annual");
  const [hpw, setHpw]             = useState("40");
  const [dpw, setDpw]             = useState("5");
  const [result, setResult]       = useState(null);
  const [err, setErr]             = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const s = parseN(salary), h = parseN(hpw), d = parseN(dpw);
    if (!(s > 0)) { setErr("Please enter a valid salary amount."); return; }
    if (!(h > 0)) { setErr("Hours per week must be greater than 0."); return; }
    if (!(d > 0)) { setErr("Days per week must be greater than 0."); return; }

    const hoursPerYear = h * 52;
    const daysPerYear  = d * 52;
    const toAnnual = { hourly: s * hoursPerYear, daily: s * daysPerYear, weekly: s * 52, biweekly: s * 26, semimonthly: s * 24, monthly: s * 12, quarterly: s * 4, annual: s };
    const annual = toAnnual[period] ?? s;

    setResult({
      hourly:      annual / hoursPerYear,
      daily:       annual / daysPerYear,
      weekly:      annual / 52,
      biweekly:    annual / 26,
      semimonthly: annual / 24,
      monthly:     annual / 12,
      quarterly:   annual / 4,
      annual,
    });
  }

  function clear() { setSalary("50000"); setPeriod("annual"); setHpw("40"); setDpw("5"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Salary Calculator</h1>
        <p className="muted">Convert your salary between pay periods — hourly, daily, weekly, bi-weekly, monthly, and annual.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}>
              <label style={lst}>Salary Amount</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
            </div>
            <div style={fst}>
              <label style={lst}>Pay Period</label>
              <select style={ist} value={period} onChange={e => setPeriod(e.target.value)}>
                {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div style={fst}>
              <label style={lst}>Hours Per Week</label>
              <input style={ist} value={hpw} onChange={e => setHpw(e.target.value)} />
            </div>
            <div style={fst}>
              <label style={lst}>Days Per Week</label>
              <input style={ist} value={dpw} onChange={e => setDpw(e.target.value)} />
            </div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ margin: "0 0 16px", color: "#1e1b4b", fontWeight: 800, fontSize: 16 }}>Salary Breakdown</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f0f0ff" }}>
                      <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 700, color: "#4f46e5" }}>Pay Period</th>
                      <th style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r, i) => (
                      <tr key={r.key} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1e1b4b" }}>{r.label}</td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 800, color: "#4f46e5", fontSize: 15 }}>{fmt(result[r.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
                Based on {parseN(hpw)} hrs/week, {parseN(dpw)} days/week, 52 weeks/year.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
