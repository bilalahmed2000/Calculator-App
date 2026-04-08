import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

function calcPayment(P, r, n) {
  if (!(P > 0) || !(n > 0)) return 0;
  const mr = r / 100 / 12;
  if (mr === 0) return P / n;
  return (P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}
function totalInterest(P, r, n) {
  if (!(P > 0) || !(n > 0)) return 0;
  return calcPayment(P, r, n) * n - P;
}

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

export default function RefinanceCalculator() {
  // Current loan
  const [curBalance, setCurBalance] = useState("280000");
  const [curRate, setCurRate] = useState("7.5");
  const [curRemainY, setCurRemainY] = useState("25");
  // New loan
  const [newRate, setNewRate] = useState("6.5");
  const [newTermY, setNewTermY] = useState("30");
  const [closingCosts, setClosingCosts] = useState("4000");
  const [cashOut, setCashOut] = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const P = parseN(curBalance), cr = parseN(curRate), cT = parseN(curRemainY), nr = parseN(newRate), nT = parseN(newTermY), cc = parseN(closingCosts), co = parseN(cashOut);
    if (!(P > 0)) { setErr("Current balance must be greater than 0."); return; }
    if (!(cT > 0)) { setErr("Remaining term must be greater than 0."); return; }
    if (!(nT > 0)) { setErr("New term must be greater than 0."); return; }

    const curN = cT * 12, newN = nT * 12;
    const curPi = calcPayment(P, cr, curN);
    const newP = P + cc + co;
    const newPi = calcPayment(newP, nr, newN);
    const monthlySavings = curPi - newPi;

    const curTotalInt = totalInterest(P, cr, curN);
    const newTotalInt = totalInterest(newP, nr, newN);
    const interestSavings = curTotalInt - newTotalInt;

    // Break-even in months
    const breakEven = monthlySavings > 0 ? Math.ceil(cc / monthlySavings) : null;

    // Net savings over new term
    const curRemainingCost = curPi * curN;
    const newTotalCost = newPi * newN;
    const netSavings = curRemainingCost - newTotalCost;

    setResult({ curPi, newPi, monthlySavings, curTotalInt, newTotalInt, interestSavings, breakEven, netSavings, curRemainingCost, newTotalCost, cc, co, newP, P, curN, newN });
  }

  function clear() { setCurBalance("280000"); setCurRate("7.5"); setCurRemainY("25"); setNewRate("6.5"); setNewTermY("30"); setClosingCosts("4000"); setCashOut("0"); setResult(null); setErr(""); }

  const isSaving = result && result.monthlySavings > 0;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Refinance Calculator</h1>
        <p className="muted">Compare your current mortgage with a refinanced loan. See monthly savings, break-even point, and total interest comparison.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Current Loan</div>
            <div style={fst}><label style={lst}>Remaining Balance</label>{row([<span style={sym}>$</span>, <input style={ist} value={curBalance} onChange={e => setCurBalance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Current Interest Rate</label>{row([<input style={ist} value={curRate} onChange={e => setCurRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Remaining Term (Years)</label><input style={ist} value={curRemainY} onChange={e => setCurRemainY(e.target.value)} /></div>
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "14px 0 14px", paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>New Loan</div>
            </div>
            <div style={fst}><label style={lst}>New Interest Rate</label>{row([<input style={ist} value={newRate} onChange={e => setNewRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>New Loan Term (Years)</label>
              <select style={ist} value={newTermY} onChange={e => setNewTermY(e.target.value)}>
                {["10","15","20","25","30"].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
            <div style={fst}><label style={lst}>Closing Costs</label>{row([<span style={sym}>$</span>, <input style={ist} value={closingCosts} onChange={e => setClosingCosts(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Cash-Out Amount</label>{row([<span style={sym}>$</span>, <input style={ist} value={cashOut} onChange={e => setCashOut(e.target.value)} />])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ background: isSaving ? "linear-gradient(135deg,#f0fdf4,#fff)" : "linear-gradient(135deg,#fff7ed,#fff)", border: `1.5px solid ${isSaving ? "#86efac" : "#fed7aa"}`, borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: isSaving ? "#166534" : "#92400e", marginBottom: 8 }}>{isSaving ? "Refinancing Saves You" : "Refinancing Costs More"}</div>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                  <div><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>Monthly {isSaving ? "Savings" : "Increase"}</div><div style={{ fontSize: 28, fontWeight: 800, color: isSaving ? "#166534" : "#ef4444" }}>{ccy(Math.abs(result.monthlySavings))}</div></div>
                  {result.breakEven && <div><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>Break-Even</div><div style={{ fontSize: 28, fontWeight: 800, color: "#1e1b4b" }}>{result.breakEven} mo</div></div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { title: "Current Loan", pi: result.curPi, totalInt: result.curTotalInt, totalCost: result.curRemainingCost, months: result.curN },
                  { title: "New Loan", pi: result.newPi, totalInt: result.newTotalInt, totalCost: result.newTotalCost, months: result.newN },
                ].map(s => (
                  <div key={s.title} style={{ background: "#f8f9ff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(99,102,241,0.12)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>{s.title}</div>
                    {[["Monthly Payment", ccy(s.pi)], ["Total Interest", ccy(s.totalInt)], ["Total Cost", ccy(s.totalCost)], ["Term", `${s.months} months`]].map(([l,v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6b7a9e" }}>{l}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ background: "#f8f9ff", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                {[["New Loan Amount", ccy(result.newP)], ["Closing Costs", ccy(result.cc)], ["Cash-Out", ccy(result.co)], ["Interest Savings", ccy(result.interestSavings)], ["Net Savings Over Term", ccy(result.netSavings)]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#6b7a9e" }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: result.netSavings < 0 && l === "Net Savings Over Term" ? "#ef4444" : "#1e1b4b" }}>{v}</span>
                  </div>
                ))}
              </div>
              {result.breakEven && (
                <div style={{ fontSize: 12.5, color: "#6b7a9e", lineHeight: 1.6 }}>
                  You need to stay in your home for at least <strong style={{ color: "#4f46e5" }}>{result.breakEven} months ({(result.breakEven / 12).toFixed(1)} years)</strong> to recoup the closing costs.
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
