import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtp = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return n.toFixed(4) + "%"; };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist  = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst  = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst  = { marginBottom: 14 };
const sym  = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

const US_STATE_RATES = [
  ["Alabama","AL",4],["Alaska","AK",0],["Arizona","AZ",5.6],["Arkansas","AR",6.5],
  ["California","CA",7.25],["Colorado","CO",2.9],["Connecticut","CT",6.35],
  ["Delaware","DE",0],["Florida","FL",6],["Georgia","GA",4],["Hawaii","HI",4],
  ["Idaho","ID",6],["Illinois","IL",6.25],["Indiana","IN",7],["Iowa","IA",6],
  ["Kansas","KS",6.5],["Kentucky","KY",6],["Louisiana","LA",4.45],["Maine","ME",5.5],
  ["Maryland","MD",6],["Massachusetts","MA",6.25],["Michigan","MI",6],
  ["Minnesota","MN",6.875],["Mississippi","MS",7],["Missouri","MO",4.225],
  ["Montana","MT",0],["Nebraska","NE",5.5],["Nevada","NV",6.85],
  ["New Hampshire","NH",0],["New Jersey","NJ",6.625],["New Mexico","NM",5],
  ["New York","NY",4],["North Carolina","NC",4.75],["North Dakota","ND",5],
  ["Ohio","OH",5.75],["Oklahoma","OK",4.5],["Oregon","OR",0],
  ["Pennsylvania","PA",6],["Rhode Island","RI",7],["South Carolina","SC",6],
  ["South Dakota","SD",4.5],["Tennessee","TN",7],["Texas","TX",6.25],
  ["Utah","UT",4.85],["Vermont","VT",6],["Virginia","VA",5.3],
  ["Washington","WA",6.5],["West Virginia","WV",6],["Wisconsin","WI",5],
  ["Wyoming","WY",4],
];

export default function SalesTaxCalculator() {
  const [mode, setMode]     = useState("add");   // "add" = before→after, "remove" = after→before
  const [amount, setAmount] = useState("100");
  const [rate, setRate]     = useState("8.5");
  const [state, setState]   = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr]       = useState("");

  function handleStateChange(e) {
    const found = US_STATE_RATES.find(s => s[1] === e.target.value);
    setState(e.target.value);
    if (found) setRate(String(found[2]));
  }

  function calculate() {
    setErr(""); setResult(null);
    const a = parseN(amount), r = parseN(rate);
    if (!(a > 0))  { setErr("Please enter a valid amount."); return; }
    if (!(r >= 0)) { setErr("Tax rate must be 0 or greater."); return; }

    let beforeTax, tax, afterTax;
    if (mode === "add") {
      beforeTax = a;
      tax       = a * r / 100;
      afterTax  = a + tax;
    } else {
      afterTax  = a;
      beforeTax = a / (1 + r / 100);
      tax       = a - beforeTax;
    }
    setResult({ beforeTax, tax, afterTax, rate: r, effectivePct: (tax / beforeTax) * 100 });
  }

  function clear() { setMode("add"); setAmount("100"); setRate("8.5"); setState(""); setResult(null); setErr(""); }

  const tabStyle = (active) => ({
    flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)",
    background: active ? "#4f46e5" : "#f8f9ff", color: active ? "#fff" : "#4f46e5",
    fontWeight: 700, fontSize: 13, cursor: "pointer",
  });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Sales Tax Calculator</h1>
        <p className="muted">Calculate sales tax on purchases. Add tax to a before-tax price, or back out the pre-tax price from a total.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 340px", minWidth: 268 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button style={tabStyle(mode === "add")}    onClick={() => setMode("add")}>Add Tax</button>
              <button style={tabStyle(mode === "remove")} onClick={() => setMode("remove")}>Remove Tax</button>
            </div>

            <div style={fst}>
              <label style={lst}>{mode === "add" ? "Before-Tax Price" : "After-Tax Price (Total)"}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
            </div>

            <div style={fst}>
              <label style={lst}>State (Optional)</label>
              <select style={ist} value={state} onChange={handleStateChange}>
                <option value="">— Enter rate manually —</option>
                {US_STATE_RATES.map(s => <option key={s[1]} value={s[1]}>{s[0]} ({s[2]}%)</option>)}
              </select>
            </div>

            <div style={fst}>
              <label style={lst}>Sales Tax Rate</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input style={ist} value={rate} onChange={e => { setState(""); setRate(e.target.value); }} />
                <span style={sym}>%</span>
              </div>
            </div>

            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ margin: "0 0 20px", color: "#1e1b4b", fontWeight: 800, fontSize: 16 }}>Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px", marginBottom: 24 }}>
                {[
                  ["Before-Tax Price", fmt(result.beforeTax)],
                  ["Sales Tax (" + result.rate + "%)", fmt(result.tax)],
                  ["After-Tax Price (Total)", fmt(result.afterTax)],
                  ["Effective Tax Rate", fmtp(result.effectivePct)],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5" }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#f0f0ff", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, color: "#4f46e5", fontWeight: 700, marginBottom: 8 }}>Formula</div>
                <div style={{ fontSize: 13, color: "#1e1b4b", lineHeight: 1.7 }}>
                  {mode === "add"
                    ? <>Sales Tax = Before-Tax Price × ({result.rate}% ÷ 100)<br />After-Tax Price = Before-Tax Price + Sales Tax</>
                    : <>Before-Tax Price = After-Tax Price ÷ (1 + {result.rate}% ÷ 100)<br />Sales Tax = After-Tax Price − Before-Tax Price</>}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
