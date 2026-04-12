import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 };
const BASE_LABELS = { bin: "Binary (Base 2)", oct: "Octal (Base 8)", dec: "Decimal (Base 10)", hex: "Hexadecimal (Base 16)" };
const PREFIX = { bin: "0b", oct: "0o", dec: "", hex: "0x" };
const VALID  = { bin: /^-?[01]*$/, oct: /^-?[0-7]*$/, dec: /^-?\d*$/, hex: /^-?[0-9a-fA-F]*$/ };

function parseBase(str, base) {
  const s = str.trim();
  if (!s || s === "-") return NaN;
  return parseInt(s, base);
}
function toBase(n, base) {
  if (!isFinite(n)) return "";
  const abs = Math.abs(Math.trunc(n));
  const str = abs.toString(base).toUpperCase();
  return n < 0 ? "-" + str : str;
}

const OPS = ["+", "-", "×", "÷", "AND", "OR", "XOR", "NOT"];

export default function HexCalculator() {
  const [tab, setTab] = useState("convert"); // "convert" | "arithmetic"
  const [inputBase, setInputBase] = useState("dec");
  const [inputVal, setInputVal]   = useState("255");
  const [a, setA]   = useState("FF");
  const [b, setB]   = useState("1A");
  const [op, setOp] = useState("+");
  const [calcBase, setCalcBase] = useState("hex");
  const [error, setError] = useState("");

  /* ── CONVERTER ── */
  const decValue = useMemo(() => {
    const v = inputVal.trim();
    if (!v) return NaN;
    return parseBase(v, BASES[inputBase]);
  }, [inputVal, inputBase]);

  const converted = useMemo(() => {
    if (isNaN(decValue)) return null;
    return {
      bin: toBase(decValue, 2),
      oct: toBase(decValue, 8),
      dec: String(decValue),
      hex: toBase(decValue, 16),
    };
  }, [decValue]);

  /* ── ARITHMETIC ── */
  const calcResult = useMemo(() => {
    const base = BASES[calcBase];
    const va = parseBase(a, base);
    const vb = parseBase(b, base);
    if (op === "NOT") {
      if (isNaN(va)) return { error: "Invalid input" };
      const r = ~va >>> 0; // 32-bit unsigned NOT
      return { val: r, str: toBase(r, base) };
    }
    if (isNaN(va) || isNaN(vb)) return { error: "Invalid input for the selected base" };
    let r;
    switch (op) {
      case "+":   r = va + vb; break;
      case "-":   r = va - vb; break;
      case "×":   r = va * vb; break;
      case "÷":   r = vb === 0 ? null : Math.trunc(va / vb); break;
      case "AND": r = va & vb; break;
      case "OR":  r = va | vb; break;
      case "XOR": r = va ^ vb; break;
      default:    r = 0;
    }
    if (r === null) return { error: "Division by zero" };
    return {
      val: r,
      str: toBase(r, base),
      bin: toBase(r, 2),
      oct: toBase(r, 8),
      dec: String(r),
      hex: toBase(r, 16),
    };
  }, [a, b, op, calcBase]);

  const handleInput = (v) => {
    if (VALID[inputBase].test(v)) setInputVal(v);
  };
  const handleA = (v) => { if (VALID[calcBase].test(v)) setA(v); };
  const handleB = (v) => { if (VALID[calcBase].test(v)) setB(v); };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Hex Calculator</h1>
        <p className="muted">
          Convert numbers between hexadecimal, decimal, binary, and octal. Perform arithmetic
          and bitwise operations (AND, OR, XOR, NOT) in any number base.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "convert" ? " active" : ""}`} onClick={() => setTab("convert")}>
              Base Converter
            </button>
            <button className={`tab-btn${tab === "arithmetic" ? " active" : ""}`} onClick={() => setTab("arithmetic")}>
              Arithmetic
            </button>
          </div>

          {tab === "convert" && (
            <>
              <div className="row">
                <div className="field">
                  <label>Input Base</label>
                  <select value={inputBase} onChange={e => { setInputBase(e.target.value); setInputVal(""); }}>
                    {Object.entries(BASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Value ({BASE_LABELS[inputBase]})</label>
                  <input type="text" value={inputVal} onChange={e => handleInput(e.target.value)}
                    placeholder={inputBase === "hex" ? "e.g. FF" : inputBase === "bin" ? "e.g. 11001100" : "e.g. 255"}
                    style={{ fontFamily: "monospace", textTransform: "uppercase" }} />
                </div>
              </div>
              {!isNaN(decValue) && <div className="small" style={{ marginTop: 4 }}>Decimal value: {decValue}</div>}
            </>
          )}

          {tab === "arithmetic" && (
            <>
              <div className="row">
                <div className="field">
                  <label>Number Base</label>
                  <select value={calcBase} onChange={e => { setCalcBase(e.target.value); setA(""); setB(""); }}>
                    {Object.entries(BASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>First Number (A)</label>
                  <input type="text" value={a} onChange={e => handleA(e.target.value)}
                    style={{ fontFamily: "monospace", textTransform: "uppercase" }} />
                </div>
                <div className="field">
                  <label>Operation</label>
                  <select value={op} onChange={e => setOp(e.target.value)}>
                    {OPS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              {op !== "NOT" && (
                <div className="row">
                  <div className="field">
                    <label>Second Number (B)</label>
                    <input type="text" value={b} onChange={e => handleB(e.target.value)}
                      style={{ fontFamily: "monospace", textTransform: "uppercase" }} />
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "convert" && converted && (
            <table className="table">
              <thead><tr><th>Base</th><th>Prefix</th><th>Value</th></tr></thead>
              <tbody>
                {Object.entries(converted).map(([base, val]) => (
                  <tr key={base} style={base === inputBase ? { background: "#f0eeff" } : {}}>
                    <td><strong>{BASE_LABELS[base].split(" ")[0]}</strong></td>
                    <td style={{ fontFamily: "monospace", color: "#6b7a9e" }}>{PREFIX[base] || "—"}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15 }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "arithmetic" && (
            <>
              {calcResult?.error ? (
                <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13.5 }}>
                  {calcResult.error}
                </div>
              ) : calcResult ? (
                <>
                  <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                      {a} {op} {op !== "NOT" ? b : ""} =
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                      {calcResult.str}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>in {BASE_LABELS[calcBase]}</div>
                  </div>
                  <table className="table">
                    <thead><tr><th>Base</th><th>Result</th></tr></thead>
                    <tbody>
                      {["hex","dec","oct","bin"].map(base => (
                        <tr key={base} style={base === calcBase ? { background: "#f0eeff" } : {}}>
                          <td><strong>{BASE_LABELS[base].split(" ")[0]}</strong></td>
                          <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{calcResult[base]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="small">Enter values to calculate.</p>
              )}
            </>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Hex</th><th>Dec</th><th>Bin</th><th>Oct</th></tr></thead>
            <tbody>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                <tr key={i}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{i.toString(16).toUpperCase()}</td>
                  <td>{i}</td>
                  <td style={{ fontFamily: "monospace" }}>{i.toString(2).padStart(4, "0")}</td>
                  <td>{i.toString(8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
