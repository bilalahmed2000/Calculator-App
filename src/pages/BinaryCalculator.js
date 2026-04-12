import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function parseBin(s) { return s.trim() ? parseInt(s.replace(/\s/g, ""), 2) : NaN; }
function toBin(n)    { if (!isFinite(n)) return ""; const a = Math.abs(n); return (n < 0 ? "-" : "") + a.toString(2); }
function padBin(s, len) { return s.padStart(len, "0"); }

const OPS = [
  { sym: "+",   label: "Add" },
  { sym: "-",   label: "Subtract" },
  { sym: "×",   label: "Multiply" },
  { sym: "÷",   label: "Divide" },
  { sym: "AND", label: "AND (bitwise)" },
  { sym: "OR",  label: "OR  (bitwise)" },
  { sym: "XOR", label: "XOR (bitwise)" },
  { sym: "NOR", label: "NOR (bitwise)" },
  { sym: "XNOR",label: "XNOR (bitwise)"},
];

export default function BinaryCalculator() {
  const [a, setA]   = useState("1010");
  const [b, setB]   = useState("0110");
  const [op, setOp] = useState("+");

  const va = useMemo(() => parseBin(a), [a]);
  const vb = useMemo(() => parseBin(b), [b]);

  const result = useMemo(() => {
    if (isNaN(va)) return { error: "Invalid binary for A (use only 0s and 1s)" };
    if (!["NOT"].includes(op) && isNaN(vb)) return { error: "Invalid binary for B" };
    let r;
    switch (op) {
      case "+":    r = va + vb; break;
      case "-":    r = va - vb; break;
      case "×":    r = va * vb; break;
      case "÷":    if (vb === 0) return { error: "Division by zero" }; r = Math.trunc(va / vb); break;
      case "AND":  r = va & vb; break;
      case "OR":   r = va | vb; break;
      case "XOR":  r = va ^ vb; break;
      case "NOR":  r = ~(va | vb); break;
      case "XNOR": r = ~(va ^ vb); break;
      default:     r = 0;
    }
    return {
      val: r,
      bin: toBin(r),
      dec: String(r),
      hex: r < 0 ? "-" + Math.abs(r).toString(16).toUpperCase() : r.toString(16).toUpperCase(),
      oct: r < 0 ? "-" + Math.abs(r).toString(8) : r.toString(8),
    };
  }, [va, vb, op]);

  // Validate binary input
  const handleA = (v) => { if (/^[01]*$/.test(v)) setA(v); };
  const handleB = (v) => { if (/^[01]*$/.test(v)) setB(v); };

  // Addition/subtraction step-by-step visual (binary addition)
  const stepByStep = useMemo(() => {
    if (op !== "+" && op !== "-" || isNaN(va) || isNaN(vb)) return null;
    const res = op === "+" ? va + vb : va - vb;
    const len = Math.max(a.length, b.length, toBin(res).replace("-", "").length) + 2;
    return {
      a: padBin(toBin(Math.abs(va)), len),
      b: padBin(toBin(Math.abs(vb)), len),
      r: padBin(toBin(Math.abs(res)), len),
    };
  }, [op, va, vb, a, b]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Binary Calculator</h1>
        <p className="muted">
          Perform arithmetic and bitwise operations on binary numbers. Results are shown in
          binary, decimal, hexadecimal, and octal.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row">
            <div className="field">
              <label>First Binary Number (A)</label>
              <input type="text" value={a} onChange={e => handleA(e.target.value)}
                placeholder="e.g. 1010"
                style={{ fontFamily: "monospace", letterSpacing: 2 }} />
              {!isNaN(va) && <div className="small" style={{ marginTop: 3 }}>= {va} (decimal)</div>}
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Operation</label>
              <select value={op} onChange={e => setOp(e.target.value)}>
                {OPS.map(o => <option key={o.sym} value={o.sym}>{o.sym} — {o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Second Binary Number (B)</label>
              <input type="text" value={b} onChange={e => handleB(e.target.value)}
                placeholder="e.g. 0110"
                style={{ fontFamily: "monospace", letterSpacing: 2 }} />
              {!isNaN(vb) && <div className="small" style={{ marginTop: 3 }}>= {vb} (decimal)</div>}
            </div>
          </div>

          {stepByStep && (
            <div style={{ marginTop: 14, padding: "14px 16px", background: "#f8f9ff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)", fontFamily: "monospace" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                Step-by-step
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 14 }}>
                <div style={{ color: "#1e1b4b" }}>&nbsp;&nbsp;{stepByStep.a}</div>
                <div style={{ color: "#1e1b4b" }}>{op === "+" ? "+" : "−"}&nbsp;{stepByStep.b}</div>
                <div style={{ borderTop: "2px solid #312e81", paddingTop: 4, color: "#4f46e5", fontWeight: 800 }}>&nbsp;&nbsp;{stepByStep.r}</div>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result.error ? (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13.5 }}>
              {result.error}
            </div>
          ) : (
            <>
              <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                  {a} {op} {b} =
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace", letterSpacing: 2 }}>
                  {result.bin}
                </div>
                <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>binary result</div>
              </div>

              <table className="table">
                <thead><tr><th>Base</th><th>Result</th></tr></thead>
                <tbody>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Binary (2)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }}>{result.bin}</td></tr>
                  <tr><td><strong>Decimal (10)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.dec}</td></tr>
                  <tr><td><strong>Hex (16)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.hex}</td></tr>
                  <tr><td><strong>Octal (8)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{result.oct}</td></tr>
                </tbody>
              </table>
            </>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Binary Reference</h3>
          <table className="table">
            <thead><tr><th>Decimal</th><th>Binary</th><th>Hex</th></tr></thead>
            <tbody>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                <tr key={i}>
                  <td>{i}</td>
                  <td style={{ fontFamily: "monospace" }}>{i.toString(2).padStart(4, "0")}</td>
                  <td style={{ fontFamily: "monospace" }}>{i.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
