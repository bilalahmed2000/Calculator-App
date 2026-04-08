import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

export default function HELOCCalculator() {
  const [homeValue, setHomeValue] = useState("400000");
  const [mortgageBalance, setMortgageBalance] = useState("250000");
  const [drawRate, setDrawRate] = useState("8.5");
  const [drawPeriod, setDrawPeriod] = useState("10");
  const [repayRate, setRepayRate] = useState("8.5");
  const [repayPeriod, setRepayPeriod] = useState("20");
  const [monthlyDraw, setMonthlyDraw] = useState("500");
  const [ltvLimit, setLtvLimit] = useState("85");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("draw");

  function calculate() {
    setErr(""); setResult(null);
    const hv = parseN(homeValue), mb = parseN(mortgageBalance), dr = parseN(drawRate), dp = parseN(drawPeriod), rr = parseN(repayRate), rp = parseN(repayPeriod), md = parseN(monthlyDraw), ltv = parseN(ltvLimit);
    if (!(hv > 0)) { setErr("Home value must be greater than 0."); return; }
    if (mb < 0) { setErr("Mortgage balance cannot be negative."); return; }
    if (!(dp > 0)) { setErr("Draw period must be greater than 0."); return; }
    if (!(rp > 0)) { setErr("Repayment period must be greater than 0."); return; }

    const maxCreditLine = Math.max(0, hv * ltv / 100 - mb);
    const drawMonths = dp * 12;
    const repayMonths = rp * 12;
    const mrDraw = dr / 100 / 12;
    const mrRepay = rr / 100 / 12;

    // Draw period: interest-only on outstanding balance as draws are made
    let balance = 0, totalDrawInterest = 0;
    const drawRows = [];
    for (let i = 0; i < drawMonths; i++) {
      const draw = Math.min(md, maxCreditLine - balance);
      balance += draw;
      const intP = balance * mrDraw;
      totalDrawInterest += intP;
      drawRows.push({ month: i + 1, draw, interest: intP, balance, cumInterest: totalDrawInterest });
    }

    const balanceAtRepay = balance;
    let repayBal = balanceAtRepay, totalRepayInterest = 0;
    const repayRows = [];
    const mr = mrRepay;
    const n = repayMonths;
    const pi = mr === 0 ? repayBal / n : (repayBal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    for (let i = 0; i < n && repayBal > 0.005; i++) {
      const intP = repayBal * mr;
      let prinP = pi - intP;
      if (prinP > repayBal) prinP = repayBal;
      repayBal -= prinP; totalRepayInterest += intP;
      repayRows.push({ month: i + 1, principal: prinP, interest: intP, balance: Math.max(repayBal, 0), cumInterest: totalRepayInterest });
      if (repayBal <= 0.005) break;
    }

    setResult({ maxCreditLine, totalDrawn: monthlyDraw * drawMonths > maxCreditLine ? maxCreditLine : parseN(monthlyDraw) * drawMonths, balanceAtRepay, pi, totalDrawInterest, totalRepayInterest, totalInterest: totalDrawInterest + totalRepayInterest, drawRows, repayRows, hv, mb, ltv });
  }

  function clear() { setHomeValue("400000"); setMortgageBalance("250000"); setDrawRate("8.5"); setDrawPeriod("10"); setRepayRate("8.5"); setRepayPeriod("20"); setMonthlyDraw("500"); setLtvLimit("85"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>HELOC Calculator</h1>
        <p className="muted">Calculate your Home Equity Line of Credit limit, draw-period interest, and repayment schedule.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Home Value</label>{row([<span style={sym}>$</span>, <input style={ist} value={homeValue} onChange={e => setHomeValue(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Outstanding Mortgage Balance</label>{row([<span style={sym}>$</span>, <input style={ist} value={mortgageBalance} onChange={e => setMortgageBalance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Max LTV Allowed by Lender</label>{row([<input style={ist} value={ltvLimit} onChange={e => setLtvLimit(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "12px 0 12px", paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Draw Period</div>
            </div>
            <div style={fst}><label style={lst}>Draw Period (Years)</label><input style={ist} value={drawPeriod} onChange={e => setDrawPeriod(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Interest Rate During Draw</label>{row([<input style={ist} value={drawRate} onChange={e => setDrawRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Monthly Draw Amount</label>{row([<span style={sym}>$</span>, <input style={ist} value={monthlyDraw} onChange={e => setMonthlyDraw(e.target.value)} />])}</div>
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "12px 0 12px", paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Repayment Period</div>
            </div>
            <div style={fst}><label style={lst}>Repayment Period (Years)</label><input style={ist} value={repayPeriod} onChange={e => setRepayPeriod(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Interest Rate During Repayment</label>{row([<input style={ist} value={repayRate} onChange={e => setRepayRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 20px", marginBottom: 20 }}>
                {[["Max Credit Line", ccy(result.maxCreditLine)], ["Balance at Repayment", ccy(result.balanceAtRepay)], ["Monthly Repayment", ccy(result.pi)], ["Draw Period Interest", ccy(result.totalDrawInterest)], ["Repayment Interest", ccy(result.totalRepayInterest)], ["Total Interest", ccy(result.totalInterest)]].map(([l,v]) => (
                  <div key={l} style={{ background: "#f8f9ff", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#4f46e5" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["draw","repay"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)", background: tab === t ? "#4f46e5" : "#f8f9ff", color: tab === t ? "#fff" : "#4f46e5", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t === "draw" ? "Draw Period" : "Repayment"}</button>)}
              </div>
              <div style={{ overflowX: "auto", maxHeight: 340, overflowY: "auto" }}>
                {tab === "draw" ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr style={{ background: "#f0f0ff" }}>{["Month","Draw","Interest","Balance"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {result.drawRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                          <td style={{ padding: "7px 10px", fontWeight: 600 }}>{r.month}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", color: "#10b981" }}>{ccy(r.draw)}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", color: "#f59e0b" }}>{ccy(r.interest)}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>{ccy(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr style={{ background: "#f0f0ff" }}>{["Month","Principal","Interest","Balance"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {result.repayRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                          <td style={{ padding: "7px 10px", fontWeight: 600 }}>{r.month}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", color: "#4f46e5" }}>{ccy(r.principal)}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", color: "#f59e0b" }}>{ccy(r.interest)}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>{ccy(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
