import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = new Date();

function fmtDate(months) {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + months, 1);
  return MONTHS[d.getMonth()] + " " + d.getFullYear();
}

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

function simulate(balance, rate, n, extra, oneTime) {
  const mr = rate / 100 / 12;
  const pi = mr === 0 ? balance / n : (balance * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  let bal = balance, totalInt = 0, months = 0;
  let firstMonth = true;
  while (bal > 0.005 && months < n) {
    const intP = bal * mr;
    let prinP = pi - intP;
    let exP = (firstMonth ? oneTime : 0) + extra;
    firstMonth = false;
    if (prinP + exP > bal) exP = bal - prinP;
    bal -= prinP + exP;
    totalInt += intP;
    months++;
    if (bal <= 0.005) { bal = 0; break; }
  }
  return { pi, totalInt, months, totalPaid: balance + totalInt };
}

export default function MortgagePayoffCalculator() {
  const [balance, setBalance] = useState("250000");
  const [rate, setRate] = useState("6.5");
  const [remainY, setRemainY] = useState("25");
  const [remainM, setRemainM] = useState("0");
  const [extra, setExtra] = useState("200");
  const [oneTime, setOneTime] = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const P = parseN(balance), r = parseN(rate), ry = parseN(remainY), rm = parseN(remainM), ex = parseN(extra), ot = parseN(oneTime);
    if (!(P > 0)) { setErr("Balance must be greater than 0."); return; }
    if (!(r >= 0)) { setErr("Interest rate must be 0 or greater."); return; }
    const n = Math.round(ry * 12 + rm);
    if (!(n > 0)) { setErr("Remaining term must be greater than 0."); return; }

    const orig = simulate(P, r, n, 0, 0);
    const withExtra = simulate(P, r, n, ex, ot);

    const monthsSaved = orig.months - withExtra.months;
    const interestSaved = orig.totalInt - withExtra.totalInt;

    const origPayoff = fmtDate(orig.months);
    const newPayoff = fmtDate(withExtra.months);

    setResult({ orig, withExtra, monthsSaved, interestSaved, origPayoff, newPayoff, P, ex, ot });
  }

  function clear() { setBalance("250000"); setRate("6.5"); setRemainY("25"); setRemainM("0"); setExtra("200"); setOneTime("0"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mortgage Payoff Calculator</h1>
        <p className="muted">See how much time and interest you save by making extra principal payments on your mortgage.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Remaining Balance</label>{row([<span style={sym}>$</span>, <input style={ist} value={balance} onChange={e => setBalance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Interest Rate (APR)</label>{row([<input style={ist} value={rate} onChange={e => setRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Remaining Term</label>{row([<input style={{ ...ist, flex: 1 }} value={remainY} onChange={e => setRemainY(e.target.value)} />, <span style={sym}>yr</span>, <input style={{ ...ist, flex: 1 }} value={remainM} onChange={e => setRemainM(e.target.value)} />, <span style={sym}>mo</span>])}</div>
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "12px 0 12px", paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Extra Payments</div>
            </div>
            <div style={fst}><label style={lst}>Extra Monthly Payment</label>{row([<span style={sym}>$</span>, <input style={ist} value={extra} onChange={e => setExtra(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>One-time Extra Payment</label>{row([<span style={sym}>$</span>, <input style={ist} value={oneTime} onChange={e => setOneTime(e.target.value)} />])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              {result.monthsSaved > 0 ? (
                <div style={{ background: "linear-gradient(135deg,#f0fdf4,#fff)", border: "1.5px solid #86efac", borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>You Save</div>
                  <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                    <div><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>Time Saved</div><div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{Math.floor(result.monthsSaved / 12)}y {result.monthsSaved % 12}m</div></div>
                    <div><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>Interest Saved</div><div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{ccy(result.interestSaved)}</div></div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#f8f9ff", borderRadius: 14, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#6b7a9e" }}>Add extra payments to see savings.</div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { title: "Original Schedule", pi: result.orig.pi, interest: result.orig.totalInt, paid: result.orig.totalPaid, payoff: result.origPayoff, months: result.orig.months, color: "#6b7a9e" },
                  { title: "With Extra Payments", pi: result.withExtra.pi + parseN(extra), interest: result.withExtra.totalInt, paid: result.withExtra.totalPaid, payoff: result.newPayoff, months: result.withExtra.months, color: "#4f46e5" },
                ].map(s => (
                  <div key={s.title} style={{ background: "#f8f9ff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(99,102,241,0.12)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: "uppercase", marginBottom: 10 }}>{s.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[["Monthly Payment", ccy(s.pi)], ["Total Interest", ccy(s.interest)], ["Total Paid", ccy(s.paid)], ["Payoff Date", s.payoff], ["Months Remaining", s.months]].map(([l,v]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "#6b7a9e" }}>{l}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
