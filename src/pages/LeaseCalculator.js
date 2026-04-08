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

export default function LeaseCalculator() {
  const [assetValue, setAssetValue] = useState("40000");
  const [residualValue, setResidualValue] = useState("20000");
  const [interestRate, setInterestRate] = useState("5");
  const [term, setTerm] = useState("36");
  const [downPayment, setDownPayment] = useState("0");
  const [salesTax, setSalesTax] = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const av = parseN(assetValue), rv = parseN(residualValue), r = parseN(interestRate), t = parseN(term), dp = parseN(downPayment), tax = parseN(salesTax);
    if (!(av > 0)) { setErr("Asset value must be greater than 0."); return; }
    if (rv < 0 || rv >= av) { setErr("Residual value must be between 0 and asset value."); return; }
    if (!(t > 0)) { setErr("Lease term must be greater than 0."); return; }

    const adjCapCost = av - dp;
    const mf = r / 100 / 24; // money factor equivalent
    const depreciation = (adjCapCost - rv) / t;
    const financeCharge = (adjCapCost + rv) * mf;
    const basePayment = depreciation + financeCharge;
    const taxAmt = basePayment * tax / 100;
    const monthlyPayment = basePayment + taxAmt;
    const totalPayments = monthlyPayment * t;
    const totalCost = totalPayments + dp;
    const totalDepreciation = adjCapCost - rv;

    setResult({ monthlyPayment, depreciation, financeCharge, taxAmt, totalPayments, totalCost, totalDepreciation, adjCapCost, rv, t, dp, av });
  }

  function clear() { setAssetValue("40000"); setResidualValue("20000"); setInterestRate("5"); setTerm("36"); setDownPayment("0"); setSalesTax("0"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Lease Calculator</h1>
        <p className="muted">Calculate lease payments for any asset — vehicles, equipment, or property. Enter asset value, residual value, interest rate, and term.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Asset Value</label>{row([<span style={sym}>$</span>, <input style={ist} value={assetValue} onChange={e => setAssetValue(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Residual Value (End of Lease)</label>{row([<span style={sym}>$</span>, <input style={ist} value={residualValue} onChange={e => setResidualValue(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Annual Interest Rate</label>{row([<input style={ist} value={interestRate} onChange={e => setInterestRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Lease Term (Months)</label><input style={ist} value={term} onChange={e => setTerm(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Down Payment</label>{row([<span style={sym}>$</span>, <input style={ist} value={downPayment} onChange={e => setDownPayment(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Sales Tax Rate</label>{row([<input style={ist} value={salesTax} onChange={e => setSalesTax(e.target.value)} />, <span style={sym}>%</span>])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ background: "linear-gradient(135deg,#f0f0ff,#fff)", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Monthly Lease Payment</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#4f46e5" }}>{ccy(result.monthlyPayment)}</div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>For {result.t} months</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 20 }}>
                {[
                  ["Depreciation / mo", ccy(result.depreciation)],
                  ["Finance Charge / mo", ccy(result.financeCharge)],
                  ["Tax / mo", ccy(result.taxAmt)],
                  ["Total Depreciation", ccy(result.totalDepreciation)],
                  ["Total Payments", ccy(result.totalPayments)],
                  ["Total Cost (incl. down)", ccy(result.totalCost)],
                  ["Residual Value", ccy(result.rv)],
                  ["Adj. Cap Cost", ccy(result.adjCapCost)],
                ].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ background: "#f8f9ff", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#6b7a9e", lineHeight: 1.6 }}>
                <strong style={{ color: "#1e1b4b" }}>Lease vs Buy:</strong> Leasing typically results in lower monthly payments compared to financing because you only pay for the asset's depreciation during the lease term, not its full value.
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
