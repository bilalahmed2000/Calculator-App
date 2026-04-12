import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function RootCalculator() {
  const [num, setNum]  = useState("64");
  const [nth, setNth]  = useState(2);

  const n   = useMemo(() => parseFloat(num), [num]);
  const root = useMemo(() => Number(nth), [nth]);

  const result = useMemo(() => {
    if (isNaN(n) || !root || root <= 0) return null;
    if (n < 0 && root % 2 === 0) return { type: "complex", msg: "Complex result — even root of negative number" };
    const val = n < 0 ? -Math.pow(-n, 1 / root) : Math.pow(n, 1 / root);
    return { type: "real", val };
  }, [n, root]);

  // Common roots table
  const commonRoots = useMemo(() => {
    if (isNaN(n)) return [];
    return [2, 3, 4, 5, 6, 8, 10].map(r => {
      if (n < 0 && r % 2 === 0) return { r, val: "complex" };
      const val = n < 0 ? -Math.pow(-n, 1 / r) : Math.pow(n, 1 / r);
      return { r, val };
    });
  }, [n]);

  const fmtVal = (v, r) => {
    if (typeof v === "string") return v;
    const rounded = Math.round(v * 1e10) / 1e10;
    const perfect = Math.abs(Math.round(rounded) - rounded) < 1e-9;
    const sym = r === 2 ? "√" : r === 3 ? "∛" : `${r}√`;
    return { value: perfect ? Math.round(rounded) : rounded, sym, perfect };
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Root Calculator</h1>
        <p className="muted">
          Calculate square roots, cube roots, and any nth root of a number.
          See all common roots in a single table.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Input</h2>

          <div className="row two">
            <div className="field">
              <label>Number</label>
              <input type="text" value={num} onChange={e => setNum(e.target.value)}
                placeholder="e.g. 64" />
            </div>
            <div className="field">
              <label>Root (n)</label>
              <input type="number" min={1} max={100} value={nth}
                onChange={e => setNth(e.target.value)} />
            </div>
          </div>

          <p className="small" style={{ marginTop: 8 }}>
            n = 2 is square root (√), n = 3 is cube root (∛), n = 4 is fourth root, etc.
          </p>

          {result && result.type === "real" && (
            <div style={{ marginTop: 16, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                {nth === 2 ? "Square" : nth === 3 ? "Cube" : `${nth}th`} Root of {n}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", letterSpacing: "-0.5px" }}>
                {Math.round(result.val * 1e10) / 1e10}
              </div>
              <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                ⁿ√{n} = {Math.round(result.val * 1e10) / 1e10} (n = {nth})
              </div>
            </div>
          )}

          {result && result.type === "complex" && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, color: "#b91c1c", fontSize: 13.5 }}>
              {result.msg}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">All Common Roots of {isNaN(n) ? "..." : n}</h2>
          {!isNaN(n) ? (
            <table className="table">
              <thead>
                <tr><th>Root</th><th>Notation</th><th>Result</th><th>Verification</th></tr>
              </thead>
              <tbody>
                {commonRoots.map(({ r, val }) => {
                  if (typeof val === "string") return (
                    <tr key={r}><td>{r === 2 ? "Square" : r === 3 ? "Cube" : `${r}th`}</td><td>{r === 2 ? "√" : r === 3 ? "∛" : `${r}√`}{n}</td><td style={{ color: "#9ca3af" }}>complex</td><td>—</td></tr>
                  );
                  const rounded = Math.round(val * 1e8) / 1e8;
                  const isPerfect = Math.abs(Math.round(val) - val) < 1e-9;
                  return (
                    <tr key={r} style={r === Number(nth) ? { background: "#f0eeff" } : {}}>
                      <td><strong>{r === 2 ? "Square" : r === 3 ? "Cube" : `${r}th`}</strong></td>
                      <td style={{ fontFamily: "monospace" }}>{r === 2 ? "√" : r === 3 ? "∛" : `${r}√`}{n}</td>
                      <td><strong style={{ color: isPerfect ? "#16a34a" : "#312e81" }}>{rounded}</strong>{isPerfect && <span style={{ marginLeft: 6, fontSize: 10, color: "#16a34a", fontWeight: 700 }}>PERFECT</span>}</td>
                      <td style={{ fontSize: 12, color: "#6b7a9e" }}>{rounded}^{r} ≈ {Math.round(Math.pow(rounded, r) * 1e4) / 1e4}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="small">Enter a number to see all roots.</p>
          )}

          <p className="small" style={{ marginTop: 12 }}>
            <strong>Perfect root</strong> (shown in green) means the result is an exact integer.
            e.g. √64 = 8 exactly.
          </p>
        </section>
      </div>
    </div>
  );
}
