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

export default function AutoLeaseCalculator() {
  const [msrp, setMsrp] = useState("35000");
  const [capCost, setCapCost] = useState("33000");
  const [residualPct, setResidualPct] = useState("55");
  const [moneyFactor, setMoneyFactor] = useState("0.00125");
  const [term, setTerm] = useState("36");
  const [downPayment, setDownPayment] = useState("2000");
  const [salesTax, setSalesTax] = useState("8");
  const [acqFee, setAcqFee] = useState("895");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const msrpV = parseN(msrp), cap = parseN(capCost), resPct = parseN(residualPct), mf = parseN(moneyFactor), termV = parseN(term), dp = parseN(downPayment), tax = parseN(salesTax), acq = parseN(acqFee);
    if (!(msrpV > 0)) { setErr("MSRP must be greater than 0."); return; }
    if (!(cap > 0)) { setErr("Capitalized cost must be greater than 0."); return; }
    if (!(termV > 0)) { setErr("Lease term must be greater than 0."); return; }

    const residualValue = msrpV * resPct / 100;
    const adjCapCost = cap + acq - dp;
    const depreciation = (adjCapCost - residualValue) / termV;
    const financeCharge = (adjCapCost + residualValue) * mf;
    const basePayment = depreciation + financeCharge;
    const taxAmt = basePayment * tax / 100;
    const monthlyPayment = basePayment + taxAmt;

    // APR equivalent from money factor
    const aprEquiv = mf * 2400;

    setResult({
      monthlyPayment, depreciation, financeCharge, taxAmt, residualValue, adjCapCost,
      totalPayments: monthlyPayment * termV, totalCost: monthlyPayment * termV + dp + acq, aprEquiv,
      msrpV, cap, termV, dp
    });
  }

  function clear() { setMsrp("35000"); setCapCost("33000"); setResidualPct("55"); setMoneyFactor("0.00125"); setTerm("36"); setDownPayment("2000"); setSalesTax("8"); setAcqFee("895"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Auto Lease Calculator</h1>
        <p className="muted">Calculate monthly lease payments for a vehicle. Enter MSRP, negotiated cap cost, residual value, money factor, and lease term.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Vehicle MSRP</label>{row([<span style={sym}>$</span>, <input style={ist} value={msrp} onChange={e => setMsrp(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Negotiated Cap Cost</label>{row([<span style={sym}>$</span>, <input style={ist} value={capCost} onChange={e => setCapCost(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Residual Value (% of MSRP)</label>{row([<input style={ist} value={residualPct} onChange={e => setResidualPct(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Money Factor</label><input style={ist} value={moneyFactor} onChange={e => setMoneyFactor(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Lease Term (Months)</label><input style={ist} value={term} onChange={e => setTerm(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Down Payment (Cap Cost Reduction)</label>{row([<span style={sym}>$</span>, <input style={ist} value={downPayment} onChange={e => setDownPayment(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Acquisition Fee</label>{row([<span style={sym}>$</span>, <input style={ist} value={acqFee} onChange={e => setAcqFee(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Sales Tax Rate</label>{row([<input style={ist} value={salesTax} onChange={e => setSalesTax(e.target.value)} />, <span style={sym}>%</span>])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ background: "linear-gradient(135deg,#f0f0ff,#fff)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Monthly Lease Payment</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#4f46e5" }}>{ccy(result.monthlyPayment)}</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>Equivalent APR: {result.aprEquiv.toFixed(2)}%</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 20 }}>
                {[
                  ["Depreciation / mo", ccy(result.depreciation)],
                  ["Finance Charge / mo", ccy(result.financeCharge)],
                  ["Tax / mo", ccy(result.taxAmt)],
                  ["Residual Value", ccy(result.residualValue)],
                  ["Adj. Cap Cost", ccy(result.adjCapCost)],
                  ["Total Lease Payments", ccy(result.totalPayments)],
                  ["Total Cost of Lease", ccy(result.totalCost)],
                  ["Lease Term", result.termV + " months"],
                ].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ background: "#f8f9ff", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#6b7a9e", lineHeight: 1.6 }}>
                <strong style={{ color: "#1e1b4b" }}>How lease payments work:</strong> The monthly payment is split into a <em>depreciation component</em> (vehicle value lost over the lease) and a <em>finance charge</em> (cost of using the money). The money factor is equivalent to an interest rate — multiply by 2400 to get the approximate APR.
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
