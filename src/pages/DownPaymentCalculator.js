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

const DOWN_PRESETS = [
  { pct: 3.5, label: "3.5% (FHA Min)" },
  { pct: 5, label: "5%" },
  { pct: 10, label: "10%" },
  { pct: 20, label: "20% (No PMI)" },
  { pct: 25, label: "25%" },
];

export default function DownPaymentCalculator() {
  const [homePrice, setHomePrice] = useState("350000");
  const [dpMode, setDpMode] = useState("pct"); // 'pct' or 'amt'
  const [dpPct, setDpPct] = useState("20");
  const [dpAmt, setDpAmt] = useState("70000");
  const [closingCostPct, setClosingCostPct] = useState("3");
  const [movingCosts, setMovingCosts] = useState("2000");
  const [reserves, setReserves] = useState("5000");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const hp = parseN(homePrice), cc = parseN(closingCostPct), mv = parseN(movingCosts), res = parseN(reserves);
    if (!(hp > 0)) { setErr("Home price must be greater than 0."); return; }

    let dp, pct;
    if (dpMode === "pct") { pct = parseN(dpPct); dp = hp * pct / 100; }
    else { dp = parseN(dpAmt); pct = (dp / hp) * 100; }

    if (dp < 0 || dp > hp) { setErr("Down payment must be between 0 and the home price."); return; }

    const loanAmount = hp - dp;
    const ltv = (loanAmount / hp) * 100;
    const closingCosts = hp * cc / 100;
    const totalCash = dp + closingCosts + mv + res;

    // PMI estimate: ~0.5-1% per year if LTV > 80%
    const pmiRequired = ltv > 80;
    const monthlyPMI = pmiRequired ? (loanAmount * 0.007 / 12) : 0;

    // Loan type guidance
    let loanType = "";
    if (pct >= 20) loanType = "Conventional — No PMI required";
    else if (pct >= 10) loanType = "Conventional or FHA — PMI/MIP required";
    else if (pct >= 5) loanType = "Conventional (with PMI) or FHA";
    else if (pct >= 3.5) loanType = "FHA Loan minimum — MIP required";
    else loanType = "May require special programs";

    setResult({ hp, dp, pct, loanAmount, ltv, closingCosts, mv, res, totalCash, pmiRequired, monthlyPMI, loanType, cc });
  }

  function applyPreset(p) {
    setDpMode("pct");
    setDpPct(String(p.pct));
    setResult(null);
  }

  function clear() { setHomePrice("350000"); setDpMode("pct"); setDpPct("20"); setDpAmt("70000"); setClosingCostPct("3"); setMovingCosts("2000"); setReserves("5000"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Down Payment Calculator</h1>
        <p className="muted">Calculate how much cash you need to buy a home — including down payment, closing costs, moving expenses, and cash reserves.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Home Price</label>{row([<span style={sym}>$</span>, <input style={ist} value={homePrice} onChange={e => setHomePrice(e.target.value)} />])}</div>
            <div style={fst}>
              <label style={lst}>Down Payment</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {["pct","amt"].map(m => <button key={m} onClick={() => setDpMode(m)} style={{ flex: 1, padding: "6px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)", background: dpMode === m ? "#4f46e5" : "#f8f9ff", color: dpMode === m ? "#fff" : "#4f46e5", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{m === "pct" ? "Percent" : "Amount"}</button>)}
              </div>
              {dpMode === "pct" ? row([<input style={ist} value={dpPct} onChange={e => setDpPct(e.target.value)} />, <span style={sym}>%</span>]) : row([<span style={sym}>$</span>, <input style={ist} value={dpAmt} onChange={e => setDpAmt(e.target.value)} />])}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lst}>Common Down Payments</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DOWN_PRESETS.map(p => <button key={p.pct} onClick={() => applyPreset(p)} style={{ padding: "4px 10px", borderRadius: 20, border: "1.5px solid rgba(99,102,241,0.2)", background: "#f8f9ff", color: "#4f46e5", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>{p.label}</button>)}
              </div>
            </div>
            <div style={fst}><label style={lst}>Closing Costs</label>{row([<input style={ist} value={closingCostPct} onChange={e => setClosingCostPct(e.target.value)} />, <span style={sym}>% of price</span>])}</div>
            <div style={fst}><label style={lst}>Moving Costs</label>{row([<span style={sym}>$</span>, <input style={ist} value={movingCosts} onChange={e => setMovingCosts(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Cash Reserves (Recommended)</label>{row([<span style={sym}>$</span>, <input style={ist} value={reserves} onChange={e => setReserves(e.target.value)} />])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ background: "linear-gradient(135deg,#f0f0ff,#fff)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Total Cash Needed</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#4f46e5" }}>{ccy(result.totalCash)}</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{result.loanType}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: 20 }}>
                {[
                  ["Down Payment", ccy(result.dp) + ` (${result.pct.toFixed(1)}%)`],
                  ["Loan Amount", ccy(result.loanAmount)],
                  ["Closing Costs", ccy(result.closingCosts) + ` (${result.cc}%)`],
                  ["Moving Costs", ccy(result.mv)],
                  ["Cash Reserves", ccy(result.res)],
                  ["LTV Ratio", result.ltv.toFixed(1) + "%"],
                  ["PMI Required", result.pmiRequired ? "Yes" : "No"],
                  ...(result.pmiRequired ? [["Est. Monthly PMI", ccy(result.monthlyPMI)]] : []),
                ].map(([l,v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 800, color: l === "PMI Required" && result.pmiRequired ? "#ef4444" : "#1e1b4b" }}>{v}</div></div>
                ))}
              </div>
              {result.pmiRequired && (
                <div style={{ background: "#fff7ed", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "#92400e", lineHeight: 1.6 }}>
                  <strong>PMI Note:</strong> With a down payment below 20%, you'll typically need Private Mortgage Insurance. PMI can be removed once your LTV reaches 80% through equity gain or principal paydown.
                </div>
              )}
              <div style={{ marginTop: 14, background: "#f8f9ff", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 10 }}>Cash Breakdown</div>
                {[["Down Payment", result.dp], ["Closing Costs", result.closingCosts], ["Moving Costs", result.mv], ["Reserves", result.res]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1, fontSize: 12, color: "#6b7a9e" }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", minWidth: 90, textAlign: "right" }}>{ccy(v)}</div>
                    <div style={{ width: 120, height: 8, background: "#e9eaf5", borderRadius: 4 }}>
                      <div style={{ width: `${Math.min(100, (v / result.totalCash) * 100)}%`, height: "100%", background: "#4f46e5", borderRadius: 4 }} />
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
