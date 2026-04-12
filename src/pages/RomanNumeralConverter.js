import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const ROMAN_MAP = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"],  [90, "XC"],  [50, "L"],  [40, "XL"],
  [10, "X"],   [9, "IX"],   [5, "V"],   [4, "IV"],  [1, "I"],
];

function toRoman(num) {
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null;
  let result = "";
  for (const [val, sym] of ROMAN_MAP) {
    while (num >= val) { result += sym; num -= val; }
  }
  return result;
}

function fromRoman(str) {
  const s = str.toUpperCase().trim();
  if (!s) return null;
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur  = vals[s[i]];
    const next = vals[s[i + 1]];
    if (cur === undefined) return null;
    if (next && cur < next) result -= cur;
    else result += cur;
  }
  if (toRoman(result) !== s) return null; // validate round-trip
  return result;
}

const SYMBOLS = [
  { sym: "I", val: 1 },
  { sym: "V", val: 5 },
  { sym: "X", val: 10 },
  { sym: "L", val: 50 },
  { sym: "C", val: 100 },
  { sym: "D", val: 500 },
  { sym: "M", val: 1000 },
];

export default function RomanNumeralConverter() {
  const [tab, setTab]     = useState("toRoman");
  const [numInput, setNumInput] = useState("2024");
  const [romInput, setRomInput] = useState("MMXXIV");

  const toRomanResult = useMemo(() => {
    const n = parseInt(numInput);
    if (isNaN(n)) return { error: "Enter a whole number." };
    if (n < 1 || n > 3999) return { error: "Enter a number between 1 and 3999." };
    const roman = toRoman(n);
    // Build breakdown
    let remaining = n;
    const steps = [];
    for (const [val, sym] of ROMAN_MAP) {
      while (remaining >= val) {
        steps.push({ sym, val });
        remaining -= val;
      }
    }
    return { roman, steps };
  }, [numInput]);

  const fromRomanResult = useMemo(() => {
    const s = romInput.trim();
    if (!s) return null;
    const num = fromRoman(s);
    if (num === null) return { error: "Invalid Roman numeral." };
    return { num, roman: s.toUpperCase() };
  }, [romInput]);

  // Generate a table of 1–20
  const sampleTable = Array.from({ length: 20 }, (_, i) => ({ n: i + 1, r: toRoman(i + 1) }));

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Roman Numeral Converter</h1>
        <p className="muted">
          Convert any number (1–3999) to Roman numerals, or convert a Roman numeral
          back to a standard decimal number.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Converter</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "toRoman"   ? " active" : ""}`} onClick={() => setTab("toRoman")}>Number → Roman</button>
            <button className={`tab-btn${tab === "fromRoman" ? " active" : ""}`} onClick={() => setTab("fromRoman")}>Roman → Number</button>
          </div>

          {tab === "toRoman" && (
            <>
              <div className="row">
                <div className="field">
                  <label>Number (1 – 3999)</label>
                  <input type="number" min="1" max="3999" value={numInput} onChange={e => setNumInput(e.target.value)} />
                </div>
              </div>

              {toRomanResult.error ? (
                <div style={{ marginTop: 12, padding: "12px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fca5a5", color: "#b91c1c", fontWeight: 600 }}>
                  {toRomanResult.error}
                </div>
              ) : (
                <>
                  <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Roman Numeral</div>
                    <div style={{ fontSize: 42, fontWeight: 900, color: "#4f46e5", letterSpacing: 4, fontFamily: "serif" }}>{toRomanResult.roman}</div>
                  </div>

                  <h3 className="card-title" style={{ marginTop: 14 }}>Breakdown</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {toRomanResult.steps.map((step, i) => (
                      <div key={i} style={{ padding: "6px 14px", background: "#f0eeff", borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)", textAlign: "center" }}>
                        <div style={{ fontFamily: "serif", fontSize: 18, fontWeight: 800, color: "#4f46e5" }}>{step.sym}</div>
                        <div style={{ fontSize: 11, color: "#6b7a9e" }}>{step.val}</div>
                      </div>
                    ))}
                  </div>
                  <p className="small" style={{ marginTop: 8 }}>
                    {toRomanResult.steps.map(s => `${s.sym}(${s.val})`).join(" + ")} = {numInput}
                  </p>
                </>
              )}
            </>
          )}

          {tab === "fromRoman" && (
            <>
              <div className="row">
                <div className="field">
                  <label>Roman Numeral</label>
                  <input type="text" value={romInput} onChange={e => setRomInput(e.target.value.toUpperCase())}
                    placeholder="e.g. MMXXIV" style={{ fontFamily: "serif", fontSize: 18, letterSpacing: 2 }} />
                </div>
              </div>

              {fromRomanResult && (
                fromRomanResult.error ? (
                  <div style={{ marginTop: 12, padding: "12px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fca5a5", color: "#b91c1c", fontWeight: 600 }}>
                    {fromRomanResult.error}
                  </div>
                ) : (
                  <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Decimal Value</div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "#4f46e5" }}>{fromRomanResult.num.toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fromRomanResult.roman} = {fromRomanResult.num}</div>
                  </div>
                )
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Roman Numeral Symbols</h2>
          <table className="table" style={{ marginBottom: 16 }}>
            <thead><tr><th>Symbol</th><th>Value</th></tr></thead>
            <tbody>
              {SYMBOLS.map(s => (
                <tr key={s.sym}>
                  <td style={{ fontFamily: "serif", fontSize: 20, fontWeight: 800, color: "#4f46e5" }}>{s.sym}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{s.val.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="card-title" style={{ marginTop: 16 }}>Reference Table (1–20)</h3>
          <table className="table">
            <thead><tr><th>Number</th><th>Roman</th><th>Number</th><th>Roman</th></tr></thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "monospace" }}>{sampleTable[i].n}</td>
                  <td style={{ fontFamily: "serif", fontWeight: 700, color: "#4f46e5" }}>{sampleTable[i].r}</td>
                  <td style={{ fontFamily: "monospace" }}>{sampleTable[i + 10].n}</td>
                  <td style={{ fontFamily: "serif", fontWeight: 700, color: "#4f46e5" }}>{sampleTable[i + 10].r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
