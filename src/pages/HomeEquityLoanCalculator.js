import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = new Date();

function DonutChart({ principal, interest }) {
  const total = (principal || 0) + (interest || 0);
  if (!(total > 0)) return null;
  const cx = 90, cy = 90, ro = 76, ri = 46;
  if (interest <= 0) return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}><circle cx={cx} cy={cy} r={ro} fill="#4f46e5" /><circle cx={cx} cy={cy} r={ri} fill="#fff" /></svg>;
  const pSweep = Math.min((principal / total) * 360, 359.999);
  const f = (n) => n.toFixed(3);
  const pt = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const arc = (s, sw, c) => { const e = s + sw; const [ox1,oy1]=pt(ro,s),[ox2,oy2]=pt(ro,e),[ix1,iy1]=pt(ri,e),[ix2,iy2]=pt(ri,s); const lg = sw > 180 ? 1 : 0; return <path d={`M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`} fill={c} stroke="#fff" strokeWidth={1.5} />; };
  return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}>{arc(0, pSweep, "#4f46e5")}{arc(pSweep, 360 - pSweep - 0.001, "#f59e0b")}</svg>;
}

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

export default function HomeEquityLoanCalculator() {
  const [homeValue, setHomeValue] = useState("400000");
  const [mortgageBalance, setMortgageBalance] = useState("200000");
  const [loanAmount, setLoanAmount] = useState("50000");
  const [rate, setRate] = useState("8");
  const [term, setTerm] = useState("10");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("year");

  function calculate() {
    setErr(""); setResult(null);
    const hv = parseN(homeValue), mb = parseN(mortgageBalance), la = parseN(loanAmount), r = parseN(rate), t = parseN(term);
    if (!(hv > 0)) { setErr("Home value must be greater than 0."); return; }
    if (mb < 0) { setErr("Mortgage balance cannot be negative."); return; }
    if (!(la > 0)) { setErr("Loan amount must be greater than 0."); return; }
    if (!(t > 0)) { setErr("Loan term must be greater than 0."); return; }

    const availableEquity = Math.max(0, hv * 0.85 - mb);
    if (la > availableEquity) { setErr(`Loan amount exceeds available equity (${ccy(availableEquity)} at 85% LTV).`); return; }

    const totalDebt = mb + la;
    const combinedLTV = (totalDebt / hv) * 100;
    const equity = hv - mb;
    const equityPct = (equity / hv) * 100;

    const n = t * 12;
    const mr = r / 100 / 12;
    const pi = mr === 0 ? la / n : (la * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);

    let bal = la, totalInt = 0, rows = [];
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
    setResult({ pi, la, totalInt, totalPaid: la + totalInt, hv, mb, equity, equityPct, availableEquity, combinedLTV, rows, annual, payoff: rows[rows.length - 1]?.label });
  }

  function clear() { setHomeValue("400000"); setMortgageBalance("200000"); setLoanAmount("50000"); setRate("8"); setTerm("10"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Home Equity Loan Calculator</h1>
        <p className="muted">Calculate monthly payments on a home equity loan. Borrow against your home equity at a fixed rate.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Home Value</label>{row([<span style={sym}>$</span>, <input style={ist} value={homeValue} onChange={e => setHomeValue(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Outstanding Mortgage Balance</label>{row([<span style={sym}>$</span>, <input style={ist} value={mortgageBalance} onChange={e => setMortgageBalance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Loan Amount Requested</label>{row([<span style={sym}>$</span>, <input style={ist} value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Interest Rate (APR)</label>{row([<input style={ist} value={rate} onChange={e => setRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Loan Term (Years)</label>
              <select style={ist} value={term} onChange={e => setTerm(e.target.value)}>
                {["5","10","15","20","25","30"].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
                <DonutChart principal={result.la} interest={result.totalInt} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                    {[["Monthly Payment", ccy(result.pi)], ["Loan Amount", ccy(result.la)], ["Total Interest", ccy(result.totalInt)], ["Total Cost", ccy(result.totalPaid)], ["Your Equity", ccy(result.equity) + ` (${result.equityPct.toFixed(1)}%)`], ["Combined LTV", result.combinedLTV.toFixed(1) + "%"]].map(([l,v]) => (
                      <div key={l}><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#4f46e5", borderRadius: 3, display: "inline-block" }} />Principal</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#f59e0b", borderRadius: 3, display: "inline-block" }} />Interest</span>
                  </div>
                </div>
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
