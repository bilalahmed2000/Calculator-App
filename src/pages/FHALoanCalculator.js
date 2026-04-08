import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = new Date();

function DonutChart({ slices }) {
  const total = slices.reduce((s, sl) => s + (sl.v || 0), 0);
  if (!(total > 0)) return null;
  const cx = 90, cy = 90, ro = 76, ri = 46;
  const active = slices.filter(s => s.v > 0);
  if (active.length === 1) return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}><circle cx={cx} cy={cy} r={ro} fill={active[0].c} /><circle cx={cx} cy={cy} r={ri} fill="#fff" /></svg>;
  const f = (n) => n.toFixed(3); let deg = 0;
  const pt = (r, d) => { const a = ((d - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const paths = active.map((sl, i) => {
    const sw = Math.min((sl.v / total) * 360, 359.999); const e = deg + sw;
    const [ox1,oy1]=pt(ro,deg),[ox2,oy2]=pt(ro,e),[ix1,iy1]=pt(ri,e),[ix2,iy2]=pt(ri,deg);
    const lg = sw > 180 ? 1 : 0;
    const d = `M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
    deg = e; return <path key={i} d={d} fill={sl.c} stroke="#fff" strokeWidth={1.5} />;
  });
  return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}>{paths}</svg>;
}

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

export default function FHALoanCalculator() {
  const [homePrice, setHomePrice] = useState("300000");
  const [downPayment, setDownPayment] = useState("10500"); // 3.5%
  const [rate, setRate] = useState("6.75");
  const [term, setTerm] = useState("30");
  const [propTax, setPropTax] = useState("1.2");
  const [insurance, setInsurance] = useState("1200");
  const [hoa, setHoa] = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("year");

  function calculate() {
    setErr(""); setResult(null);
    const hp = parseN(homePrice), dp = parseN(downPayment), r = parseN(rate), t = parseN(term), pt = parseN(propTax), ins = parseN(insurance), hoaV = parseN(hoa);
    if (!(hp > 0)) { setErr("Home price must be greater than 0."); return; }
    if (!(t > 0)) { setErr("Loan term must be greater than 0."); return; }
    const dpPct = (dp / hp) * 100;
    if (dpPct < 3.5) { setErr("FHA loans require a minimum 3.5% down payment."); return; }
    if (dp >= hp) { setErr("Down payment cannot exceed the home price."); return; }

    // FHA MIP: Upfront 1.75% financed into loan
    const baseLoan = hp - dp;
    const upfrontMIP = baseLoan * 0.0175;
    const P = baseLoan + upfrontMIP;
    const ltv = (baseLoan / hp) * 100;

    // Annual MIP rate (2024 rates): 0.55% for 30yr loans with LTV > 95%, 0.50% <= 95%
    let annualMIPRate = 0;
    if (t > 15) { annualMIPRate = ltv > 95 ? 0.55 : 0.50; }
    else { annualMIPRate = ltv > 90 ? 0.40 : 0.15; }
    const monthlyMIP = baseLoan * annualMIPRate / 100 / 12;

    const n = t * 12;
    const mr = r / 100 / 12;
    const pi = mr === 0 ? P / n : (P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    const monthlyTax = hp * pt / 100 / 12;
    const monthlyIns = ins / 12;
    const monthlyHoa = hoaV / 12;
    const monthlyTotal = pi + monthlyMIP + monthlyTax + monthlyIns + monthlyHoa;

    let bal = P, totalInt = 0, rows = [];
    const startD = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1);
    for (let i = 0; i < n && bal > 0.005; i++) {
      const intP = bal * mr;
      let prinP = pi - intP;
      if (prinP > bal) prinP = bal;
      bal -= prinP; totalInt += intP;
      const d = new Date(startD.getFullYear(), startD.getMonth() + i, 1);
      rows.push({ n: i + 1, label: MONTHS[d.getMonth()] + " " + d.getFullYear(), interest: intP, principal: prinP, balance: Math.max(bal, 0) });
      if (bal <= 0.005) break;
    }
    const annual = [];
    let yr = null, yRow = null;
    rows.forEach(r => {
      const y = r.label.split(" ")[1];
      if (y !== yr) { if (yRow) annual.push(yRow); yr = y; yRow = { year: y, interest: 0, principal: 0, balance: 0 }; }
      yRow.interest += r.interest; yRow.principal += r.principal; yRow.balance = r.balance;
    });
    if (yRow) annual.push(yRow);
    setResult({ pi, monthlyTotal, monthlyTax, monthlyIns, monthlyHoa, monthlyMIP, upfrontMIP, annualMIPRate, P, baseLoan, totalInt, totalPaid: P + totalInt, dp, dpPct, ltv, rows, annual, payoff: rows[rows.length - 1]?.label });
  }

  function clear() { setHomePrice("300000"); setDownPayment("10500"); setRate("6.75"); setTerm("30"); setPropTax("1.2"); setInsurance("1200"); setHoa("0"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>FHA Loan Calculator</h1>
        <p className="muted">Calculate FHA loan payments including upfront and annual mortgage insurance premiums (MIP). Minimum 3.5% down payment required.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Home Price</label>{row([<span style={sym}>$</span>, <input style={ist} value={homePrice} onChange={e => setHomePrice(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Down Payment (min 3.5%)</label>{row([<span style={sym}>$</span>, <input style={ist} value={downPayment} onChange={e => setDownPayment(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Interest Rate (APR)</label>{row([<input style={ist} value={rate} onChange={e => setRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Loan Term (Years)</label>
              <select style={ist} value={term} onChange={e => setTerm(e.target.value)}>
                {["15","20","25","30"].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
            <div style={fst}><label style={lst}>Annual Property Tax Rate</label>{row([<input style={ist} value={propTax} onChange={e => setPropTax(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Annual Home Insurance</label>{row([<span style={sym}>$</span>, <input style={ist} value={insurance} onChange={e => setInsurance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>HOA (Annual)</label>{row([<span style={sym}>$</span>, <input style={ist} value={hoa} onChange={e => setHoa(e.target.value)} />])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
                <DonutChart slices={[{ v: result.pi, c: "#4f46e5" }, { v: result.totalInt, c: "#f59e0b" }, { v: result.monthlyMIP * 360, c: "#ef4444" }, { v: result.monthlyTax * 360, c: "#10b981" }]} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Monthly Payment</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#4f46e5", marginBottom: 10 }}>{ccy(result.monthlyTotal)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px" }}>
                    {[["P & I", ccy(result.pi)], ["Annual MIP", ccy(result.monthlyMIP)], ["Property Tax", ccy(result.monthlyTax)], ["Insurance", ccy(result.monthlyIns)]].map(([l,v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px 16px", marginBottom: 16 }}>
                {[["Base Loan", ccy(result.baseLoan)], ["Upfront MIP (1.75%)", ccy(result.upfrontMIP)], ["Total Loan", ccy(result.P)], ["LTV Ratio", result.ltv.toFixed(1) + "%"], ["Down Payment", ccy(result.dp) + ` (${result.dpPct.toFixed(1)}%)`], ["Payoff Date", result.payoff], ["Total Interest", ccy(result.totalInt)], ["Annual MIP Rate", result.annualMIPRate.toFixed(2) + "%"]].map(([l,v]) => (
                  <div key={l}><div style={{ fontSize: 10, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ background: "#fff7ed", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "#92400e", lineHeight: 1.6, marginBottom: 16 }}>
                <strong>FHA MIP Note:</strong> The annual MIP rate of {result.annualMIPRate.toFixed(2)}% applies as long as you have an LTV above 80%. Once you reach 20% equity, you can refinance to a conventional loan to remove MIP.
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["year","month"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)", background: tab === t ? "#4f46e5" : "#f8f9ff", color: tab === t ? "#fff" : "#4f46e5", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t === "year" ? "Annual" : "Monthly"}</button>)}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: "#f0f0ff" }}>{["Date","Principal","Interest","Balance"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(tab === "year" ? result.annual : result.rows).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                        <td style={{ padding: "7px 10px", fontWeight: 600 }}>{tab === "year" ? r.year : r.label}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: "#4f46e5" }}>{ccy(r.principal)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: "#f59e0b" }}>{ccy(r.interest)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>{ccy(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
