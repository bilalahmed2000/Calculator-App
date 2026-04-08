import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

// 2024 federal tax brackets
const BRACKETS = {
  single: [
    { max: 11600,    rate: 0.10 },
    { max: 47150,    rate: 0.12 },
    { max: 100525,   rate: 0.22 },
    { max: 191950,   rate: 0.24 },
    { max: 243725,   rate: 0.32 },
    { max: 609350,   rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  married: [
    { max: 23200,    rate: 0.10 },
    { max: 94300,    rate: 0.12 },
    { max: 201050,   rate: 0.22 },
    { max: 383900,   rate: 0.24 },
    { max: 487450,   rate: 0.32 },
    { max: 731200,   rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { max: 16550,    rate: 0.10 },
    { max: 63100,    rate: 0.12 },
    { max: 100500,   rate: 0.22 },
    { max: 191950,   rate: 0.24 },
    { max: 243700,   rate: 0.32 },
    { max: 609350,   rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
};
const STD_DEDUCTION = { single: 14600, married: 29200, hoh: 21900 };
const SS_WAGE_BASE  = 168600;
const SS_RATE       = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE = 0.009; // Additional Medicare tax above $200k single / $250k MFJ

function calcFederalTax(taxableIncome, brackets) {
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, b.max) - prev;
    tax += slice * b.rate;
    prev = b.max;
  }
  return Math.max(tax, 0);
}

const STATE_RATES = [
  ["No State Tax","none",0],["Alabama","AL",5],["Alaska","AK",0],["Arizona","AZ",2.5],
  ["Arkansas","AR",4.4],["California","CA",9.3],["Colorado","CO",4.4],
  ["Connecticut","CT",5],["Delaware","DE",5.55],["Florida","FL",0],
  ["Georgia","GA",5.49],["Hawaii","HI",7.9],["Idaho","ID",5.8],
  ["Illinois","IL",4.95],["Indiana","IN",3.15],["Iowa","IA",5.7],
  ["Kansas","KS",5.7],["Kentucky","KY",4.5],["Louisiana","LA",4.25],
  ["Maine","ME",7.15],["Maryland","MD",4.75],["Massachusetts","MA",5],
  ["Michigan","MI",4.25],["Minnesota","MN",9.85],["Mississippi","MS",5],
  ["Missouri","MO",4.95],["Montana","MT",6.75],["Nebraska","NE",6.64],
  ["Nevada","NV",0],["New Hampshire","NH",0],["New Jersey","NJ",6.37],
  ["New Mexico","NM",5.9],["New York","NY",6.85],["North Carolina","NC",4.5],
  ["North Dakota","ND",2.5],["Ohio","OH",3.5],["Oklahoma","OK",4.75],
  ["Oregon","OR",9.9],["Pennsylvania","PA",3.07],["Rhode Island","RI",5.99],
  ["South Carolina","SC",6.4],["South Dakota","SD",0],["Tennessee","TN",0],
  ["Texas","TX",0],["Utah","UT",4.65],["Vermont","VT",8.75],
  ["Virginia","VA",5.75],["Washington","WA",0],["West Virginia","WV",5.12],
  ["Wisconsin","WI",7.65],["Wyoming","WY",0],
];

export default function TakeHomePayCalculator() {
  const [salary, setSalary]       = useState("75000");
  const [filingStatus, setFiling] = useState("single");
  const [stateKey, setStateKey]   = useState("none");
  const [k401, setK401]           = useState("0");
  const [healthIns, setHealthIns] = useState("0");
  const [payPeriod, setPayPeriod] = useState("annual");
  const [result, setResult]       = useState(null);
  const [err, setErr]             = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const gross = parseN(salary);
    if (!(gross > 0)) { setErr("Please enter a valid salary."); return; }

    const k401Annual    = parseN(k401);
    const healthAnnual  = parseN(healthIns);
    const stdDed        = STD_DEDUCTION[filingStatus];
    const brackets      = BRACKETS[filingStatus];

    // Pre-tax deductions
    const preTaxDed     = k401Annual + healthAnnual;
    const fedTaxable    = Math.max(gross - preTaxDed - stdDed, 0);
    const federalTax    = calcFederalTax(fedTaxable, brackets);

    // FICA
    const ssTaxable     = Math.min(gross, SS_WAGE_BASE);
    const ssTax         = ssTaxable * SS_RATE;
    const medicareTax   = gross * MEDICARE_RATE;
    const addlMedicare  = gross > 200000 ? (gross - 200000) * ADDL_MEDICARE : 0;
    const ficaTotal     = ssTax + medicareTax + addlMedicare;

    // State tax (flat rate approximation)
    const stateInfo     = STATE_RATES.find(s => s[1] === stateKey) || STATE_RATES[0];
    const stateTax      = gross * stateInfo[2] / 100;

    const totalDeductions = federalTax + ficaTotal + stateTax + preTaxDed;
    const annualNet     = gross - totalDeductions;

    const divisor = { annual: 1, monthly: 12, biweekly: 26, weekly: 52 }[payPeriod] || 1;

    setResult({
      gross, federalTax, ssTax, medicareTax, addlMedicare, ficaTotal,
      stateTax, stateName: stateInfo[0], k401Annual, healthAnnual,
      totalDeductions, annualNet,
      perPeriod: annualNet / divisor,
      grossPerPeriod: gross / divisor,
      effectiveRate: (federalTax / gross) * 100,
      totalTaxRate:  ((federalTax + ficaTotal + stateTax) / gross) * 100,
    });
  }

  function clear() { setSalary("75000"); setFiling("single"); setStateKey("none"); setK401("0"); setHealthIns("0"); setPayPeriod("annual"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Take-Home-Pay Calculator</h1>
        <p className="muted">Calculate your net take-home pay after federal income tax, FICA (Social Security & Medicare), state income tax, and pre-tax deductions. Based on 2024 tax rates.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 340px", minWidth: 268 }}>
            <div style={fst}>
              <label style={lst}>Annual Gross Salary</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
            </div>
            <div style={fst}>
              <label style={lst}>Filing Status</label>
              <select style={ist} value={filingStatus} onChange={e => setFiling(e.target.value)}>
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>
            <div style={fst}>
              <label style={lst}>State</label>
              <select style={ist} value={stateKey} onChange={e => setStateKey(e.target.value)}>
                {STATE_RATES.map(s => <option key={s[1]} value={s[1]}>{s[0]}{s[2] > 0 ? ` (~${s[2]}%)` : ""}</option>)}
              </select>
            </div>
            <div style={fst}>
              <label style={lst}>Annual 401(k) Contribution</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={k401} onChange={e => setK401(e.target.value)} />
              </div>
            </div>
            <div style={fst}>
              <label style={lst}>Annual Health Insurance Premium</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={healthIns} onChange={e => setHealthIns(e.target.value)} />
              </div>
            </div>
            <div style={fst}>
              <label style={lst}>Display Results Per</label>
              <select style={ist} value={payPeriod} onChange={e => setPayPeriod(e.target.value)}>
                <option value="annual">Year</option>
                <option value="monthly">Month</option>
                <option value="biweekly">Bi-Weekly Paycheck</option>
                <option value="weekly">Week</option>
              </select>
            </div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              {/* Summary headline */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24, background: "#f0f0ff", borderRadius: 12, padding: "18px 20px" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Gross Pay</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1e1b4b" }}>{fmt(result.grossPerPeriod)}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 400, color: "#c4c9e0", alignSelf: "center" }}>→</div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Take-Home Pay</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#4f46e5" }}>{fmt(result.perPeriod)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Total Tax Rate</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>{result.totalTaxRate.toFixed(1)}%</div>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f0f0ff" }}>
                      <th style={{ padding: "8px 14px", textAlign: "left", fontWeight: 700, color: "#4f46e5" }}>Deduction</th>
                      <th style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>Annual</th>
                      <th style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>% of Gross</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Gross Salary",                result.gross,         null],
                      ["Federal Income Tax",          result.federalTax,    result.federalTax / result.gross * 100],
                      ["Social Security Tax (6.2%)",  result.ssTax,         result.ssTax / result.gross * 100],
                      ["Medicare Tax (1.45%)",        result.medicareTax,   result.medicareTax / result.gross * 100],
                      result.addlMedicare > 0
                        ? ["Additional Medicare (0.9%)", result.addlMedicare, result.addlMedicare / result.gross * 100]
                        : null,
                      result.stateTax > 0
                        ? [`${result.stateName} State Tax`, result.stateTax, result.stateTax / result.gross * 100]
                        : null,
                      result.k401Annual > 0
                        ? ["401(k) Contribution",     result.k401Annual,    result.k401Annual / result.gross * 100]
                        : null,
                      result.healthAnnual > 0
                        ? ["Health Insurance",        result.healthAnnual,  result.healthAnnual / result.gross * 100]
                        : null,
                      ["Net Take-Home Pay",           result.annualNet,     result.annualNet / result.gross * 100],
                    ].filter(Boolean).map(([l, v, pct], i) => {
                      const isLast = l === "Net Take-Home Pay";
                      const isFirst = l === "Gross Salary";
                      return (
                        <tr key={l} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: isLast ? "#eef2ff" : i % 2 === 0 ? "#fafbff" : "#fff" }}>
                          <td style={{ padding: "9px 14px", fontWeight: isLast || isFirst ? 800 : 600, color: isLast ? "#4f46e5" : "#1e1b4b" }}>{l}</td>
                          <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: isLast ? 800 : 600, color: isLast ? "#4f46e5" : "#1e1b4b", fontSize: isLast ? 16 : 14 }}>{fmt(v)}</td>
                          <td style={{ padding: "9px 14px", textAlign: "right", color: "#6b7a9e", fontWeight: 600 }}>{pct != null ? pct.toFixed(1) + "%" : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14 }}>
                State tax is a flat-rate approximation. Actual taxes vary. This tool does not account for credits, itemized deductions, or local taxes.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
