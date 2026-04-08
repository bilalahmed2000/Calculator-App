import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

const COMMON_RATES = [5, 10, 12, 15, 16, 18, 19, 20, 21, 23, 25];

export default function VATCalculator() {
  const [mode, setMode]     = useState("add");    // "add" = excl→incl, "remove" = incl→excl
  const [amount, setAmount] = useState("100");
  const [rate, setRate]     = useState("20");
  const [result, setResult] = useState(null);
  const [err, setErr]       = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const a = parseN(amount), r = parseN(rate);
    if (!(a > 0))  { setErr("Please enter a valid amount."); return; }
    if (!(r >= 0)) { setErr("VAT rate must be 0 or greater."); return; }

    let exclVAT, vat, inclVAT;
    if (mode === "add") {
      exclVAT = a;
      vat     = a * r / 100;
      inclVAT = a + vat;
    } else {
      inclVAT = a;
      exclVAT = a / (1 + r / 100);
      vat     = a - exclVAT;
    }
    setResult({ exclVAT, vat, inclVAT, rate: r });
  }

  function clear() { setMode("add"); setAmount("100"); setRate("20"); setResult(null); setErr(""); }

  const tabStyle = (active) => ({
    flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)",
    background: active ? "#4f46e5" : "#f8f9ff", color: active ? "#fff" : "#4f46e5",
    fontWeight: 700, fontSize: 13, cursor: "pointer",
  });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>VAT Calculator</h1>
        <p className="muted">Calculate Value Added Tax (VAT). Add VAT to a net price, or remove VAT from a gross price to find the net amount.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 340px", minWidth: 268 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button style={tabStyle(mode === "add")}    onClick={() => setMode("add")}>Add VAT</button>
              <button style={tabStyle(mode === "remove")} onClick={() => setMode("remove")}>Remove VAT</button>
            </div>

            <div style={fst}>
              <label style={lst}>{mode === "add" ? "Net Price (Excl. VAT)" : "Gross Price (Incl. VAT)"}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
            </div>

            <div style={fst}>
              <label style={lst}>VAT Rate</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input style={ist} value={rate} onChange={e => setRate(e.target.value)} />
                <span style={sym}>%</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {COMMON_RATES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRate(String(r))}
                    style={{
                      padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.3)",
                      background: rate === String(r) ? "#4f46e5" : "#f8f9ff",
                      color: rate === String(r) ? "#fff" : "#4f46e5",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >{r}%</button>
                ))}
              </div>
            </div>

            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ margin: "0 0 20px", color: "#1e1b4b", fontWeight: 800, fontSize: 16 }}>Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", marginBottom: 24 }}>
                {[
                  ["Net Price (Excl. VAT)", fmt(result.exclVAT), "#1e1b4b"],
                  ["VAT Amount (" + result.rate + "%)", fmt(result.vat), "#f59e0b"],
                  ["Gross Price (Incl. VAT)", fmt(result.inclVAT), "#4f46e5"],
                ].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Visual bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 18, borderRadius: 9, overflow: "hidden", display: "flex" }}>
                  <div style={{ flex: result.exclVAT, background: "#4f46e5" }} title="Net Price" />
                  <div style={{ flex: result.vat, background: "#f59e0b" }} title="VAT" />
                </div>
                <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#4f46e5", borderRadius: 3, display: "inline-block" }} />Net Price</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#f59e0b", borderRadius: 3, display: "inline-block" }} />VAT Amount</span>
                </div>
              </div>

              <div style={{ background: "#f0f0ff", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, color: "#4f46e5", fontWeight: 700, marginBottom: 8 }}>Formula</div>
                <div style={{ fontSize: 13, color: "#1e1b4b", lineHeight: 1.7 }}>
                  {mode === "add"
                    ? <>VAT Amount = Net Price × ({result.rate}% ÷ 100)<br />Gross Price = Net Price + VAT Amount</>
                    : <>Net Price = Gross Price ÷ (1 + {result.rate}% ÷ 100)<br />VAT Amount = Gross Price − Net Price</>}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
