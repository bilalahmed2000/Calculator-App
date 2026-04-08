import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

// 2024 Federal tax brackets
const SINGLE_BRACKETS = [
  { max: 11600,  rate: 0.10 },
  { max: 47150,  rate: 0.12 },
  { max: 100525, rate: 0.22 },
  { max: 191950, rate: 0.24 },
  { max: 243725, rate: 0.32 },
  { max: 609350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const MFJ_BRACKETS = [
  { max: 23200,  rate: 0.10 },
  { max: 94300,  rate: 0.12 },
  { max: 201050, rate: 0.22 },
  { max: 383900, rate: 0.24 },
  { max: 487450, rate: 0.32 },
  { max: 731200, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION_SINGLE = 14600;
const STANDARD_DEDUCTION_MFJ    = 29200;

function calcFederalTax(taxableIncome, brackets) {
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, b.max) - prev;
    tax += slice * b.rate;
    prev = b.max;
  }
  return tax;
}

export default function MarriageTaxCalculator() {
  const [inc1, setInc1] = useState("60000");
  const [inc2, setInc2] = useState("40000");
  const [result, setResult] = useState(null);
  const [err, setErr]       = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const i1 = parseN(inc1), i2 = parseN(inc2);
    if (!(i1 >= 0 && i2 >= 0 && i1 + i2 > 0)) { setErr("Please enter valid income amounts."); return; }

    // As singles
    const ti1 = Math.max(i1 - STANDARD_DEDUCTION_SINGLE, 0);
    const ti2 = Math.max(i2 - STANDARD_DEDUCTION_SINGLE, 0);
    const tax1 = calcFederalTax(ti1, SINGLE_BRACKETS);
    const tax2 = calcFederalTax(ti2, SINGLE_BRACKETS);
    const totalAsSingle = tax1 + tax2;

    // As MFJ
    const combinedIncome = i1 + i2;
    const tiMFJ   = Math.max(combinedIncome - STANDARD_DEDUCTION_MFJ, 0);
    const taxMFJ  = calcFederalTax(tiMFJ, MFJ_BRACKETS);

    const difference = taxMFJ - totalAsSingle;
    const isPenalty  = difference > 0;

    setResult({
      inc1: i1, inc2: i2, combinedIncome,
      tax1, tax2, totalAsSingle,
      taxMFJ, difference,
      isPenalty,
      effectiveSingle: totalAsSingle / combinedIncome * 100,
      effectiveMFJ:    taxMFJ        / combinedIncome * 100,
    });
  }

  function clear() { setInc1("60000"); setInc2("40000"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Marriage Tax Calculator</h1>
        <p className="muted">Find out if you'll pay a marriage penalty or receive a marriage bonus when filing jointly vs. separately as single filers. Based on 2024 federal tax brackets.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}>
              <label style={lst}>Person 1 — Annual Income</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={inc1} onChange={e => setInc1(e.target.value)} />
              </div>
            </div>
            <div style={fst}>
              <label style={lst}>Person 2 — Annual Income</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={inc2} onChange={e => setInc2(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 }}>
              Standard deductions applied automatically:<br />
              Single: <strong>$14,600</strong> &nbsp;|&nbsp; MFJ: <strong>$29,200</strong>
            </div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              {/* Penalty / Bonus banner */}
              <div style={{
                background: result.isPenalty ? "#fef2f2" : "#f0fdf4",
                border: `1px solid ${result.isPenalty ? "#fca5a5" : "#86efac"}`,
                borderRadius: 12, padding: "16px 20px", marginBottom: 22,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 32 }}>{result.isPenalty ? "⚠️" : "🎉"}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: result.isPenalty ? "#dc2626" : "#16a34a" }}>
                    Marriage {result.isPenalty ? "Penalty" : "Bonus"}: {fmt(Math.abs(result.difference))}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 2 }}>
                    {result.isPenalty
                      ? "You will pay more in taxes as a married couple."
                      : "You will pay less in taxes as a married couple."}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 22 }}>
                {[
                  ["Person 1 Tax (Single)",   fmt(result.tax1)],
                  ["Person 2 Tax (Single)",   fmt(result.tax2)],
                  ["Total Tax as Singles",    fmt(result.totalAsSingle)],
                  ["Tax as Married (MFJ)",    fmt(result.taxMFJ)],
                  ["Effective Rate (Single)", result.effectiveSingle.toFixed(2) + "%"],
                  ["Effective Rate (MFJ)",    result.effectiveMFJ.toFixed(2) + "%"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b" }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f0f0ff" }}>
                      {["", "Filing as Single", "Filing as MFJ"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Combined Income", fmt(result.combinedIncome), fmt(result.combinedIncome)],
                      ["Standard Deduction", fmt(STANDARD_DEDUCTION_SINGLE * 2), fmt(STANDARD_DEDUCTION_MFJ)],
                      ["Federal Tax", fmt(result.totalAsSingle), fmt(result.taxMFJ)],
                    ].map(([l, s, m], i) => (
                      <tr key={l} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#1e1b4b" }}>{l}</td>
                        <td style={{ padding: "9px 12px", textAlign: "right" }}>{s}</td>
                        <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14 }}>
                Based on 2024 federal income tax brackets only. Does not include state taxes, credits, AMT, or other adjustments. Consult a tax professional for personalized advice.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
