import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

// 2024 federal estate tax brackets
const BRACKETS = [
  { min: 0,        max: 10000,     base: 0,       rate: 0.18 },
  { min: 10000,    max: 20000,     base: 1800,    rate: 0.20 },
  { min: 20000,    max: 40000,     base: 3800,    rate: 0.22 },
  { min: 40000,    max: 60000,     base: 8200,    rate: 0.24 },
  { min: 60000,    max: 80000,     base: 13000,   rate: 0.26 },
  { min: 80000,    max: 100000,    base: 18200,   rate: 0.28 },
  { min: 100000,   max: 150000,    base: 23800,   rate: 0.30 },
  { min: 150000,   max: 250000,    base: 38800,   rate: 0.32 },
  { min: 250000,   max: 500000,    base: 70800,   rate: 0.34 },
  { min: 500000,   max: 750000,    base: 155800,  rate: 0.37 },
  { min: 750000,   max: 1000000,   base: 248300,  rate: 0.39 },
  { min: 1000000,  max: Infinity,  base: 345800,  rate: 0.40 },
];

const EXEMPTION_2024 = 13_610_000; // federal lifetime exemption

function computeEstateTax(taxable) {
  if (taxable <= 0) return 0;
  for (const b of BRACKETS) {
    if (taxable <= b.max) {
      return b.base + (taxable - b.min) * b.rate;
    }
  }
  return 0;
}

export default function EstateTaxCalculator() {
  const [gross, setGross]         = useState("15000000");
  const [debts, setDebts]         = useState("500000");
  const [funeral, setFuneral]     = useState("25000");
  const [charitable, setChar]     = useState("0");
  const [marital, setMarital]     = useState("0");
  const [stateEx, setStateEx]     = useState("0");
  const [result, setResult]       = useState(null);
  const [err, setErr]             = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const g = parseN(gross);
    if (!(g > 0)) { setErr("Gross estate value must be greater than 0."); return; }
    const totalDeductions = parseN(debts) + parseN(funeral) + parseN(charitable) + parseN(marital) + parseN(stateEx);
    const adjustedEstate  = Math.max(g - totalDeductions, 0);
    const taxableEstate   = Math.max(adjustedEstate - EXEMPTION_2024, 0);
    const federalTax      = computeEstateTax(taxableEstate);
    const effectiveRate   = federalTax > 0 ? (federalTax / g) * 100 : 0;
    setResult({ gross: g, totalDeductions, adjustedEstate, taxableEstate, federalTax, effectiveRate, afterTaxEstate: g - federalTax });
  }

  function clear() { setGross("15000000"); setDebts("500000"); setFuneral("25000"); setChar("0"); setMarital("0"); setStateEx("0"); setResult(null); setErr(""); }

  const dollarInput = (label, val, setter) => (
    <div style={fst}>
      <label style={lst}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={sym}>$</span>
        <input style={ist} value={val} onChange={e => setter(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Estate Tax Calculator</h1>
        <p className="muted">Estimate federal estate tax liability based on your gross estate value, deductions, and the 2024 federal exemption of $13,610,000.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 340px", minWidth: 268 }}>
            <div style={{ fontSize: 12, color: "#6b7a9e", marginBottom: 16, background: "#f0f0ff", padding: "10px 14px", borderRadius: 8 }}>
              2024 Federal Exemption: <strong style={{ color: "#4f46e5" }}>$13,610,000</strong>
            </div>
            {dollarInput("Gross Estate Value", gross, setGross)}
            <div style={{ fontSize: 12, color: "#9ca3af", margin: "-8px 0 14px", fontWeight: 600 }}>DEDUCTIONS</div>
            {dollarInput("Outstanding Debts & Mortgages", debts, setDebts)}
            {dollarInput("Funeral & Administration Expenses", funeral, setFuneral)}
            {dollarInput("Charitable Deductions", charitable, setChar)}
            {dollarInput("Marital Deduction (Surviving Spouse)", marital, setMarital)}
            {dollarInput("State Estate Tax Deduction", stateEx, setStateEx)}
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ margin: "0 0 20px", color: "#1e1b4b", fontWeight: 800, fontSize: 16 }}>Federal Estate Tax Summary</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {[
                      ["Gross Estate Value",         fmt(result.gross),           "#1e1b4b", false],
                      ["Total Deductions",           "− " + fmt(result.totalDeductions), "#6b7a9e", false],
                      ["Adjusted Gross Estate",      fmt(result.adjustedEstate),  "#1e1b4b", false],
                      ["Federal Exemption (2024)",   "− " + fmt(EXEMPTION_2024),  "#6b7a9e", false],
                      ["Taxable Estate",             fmt(result.taxableEstate),   "#1e1b4b", true],
                      ["Federal Estate Tax (≤40%)",  fmt(result.federalTax),      "#ef4444", true],
                      ["Effective Rate",             result.effectiveRate.toFixed(2) + "%", "#6b7a9e", false],
                      ["Net Estate After Tax",       fmt(result.afterTaxEstate),  "#4f46e5", true],
                    ].map(([l, v, c, bold], i) => (
                      <tr key={l} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                        <td style={{ padding: "10px 14px", color: "#6b7a9e", fontWeight: 600 }}>{l}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", color: c, fontWeight: bold ? 800 : 600, fontSize: bold ? 16 : 14 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.taxableEstate <= 0 && (
                <div style={{ background: "#d1fae5", borderRadius: 10, padding: "14px 18px", marginTop: 16, color: "#065f46", fontWeight: 700, fontSize: 14 }}>
                  No federal estate tax is owed — the taxable estate is below the exemption threshold.
                </div>
              )}
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14 }}>
                This is an estimate. Consult a tax professional for estate planning. State estate taxes are separate.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
